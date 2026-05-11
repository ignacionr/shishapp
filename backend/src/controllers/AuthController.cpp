#include "AuthController.hpp"
#include "models/models.hpp"
#include "services/AuthService.hpp"
#include "services/ContextService.hpp"
#include <glaze/glaze.hpp>

namespace viditacafe {

void AuthController::registerUser(const HttpRequestPtr& req, std::function<void(const HttpResponsePtr&)>&& callback) {
    // Simulated registration logic
    AuthResponse response;
    response.token = "simulated_jwt_token";
    response.user = {"1", "user@example.com", "Coffee Enthusiast"};

    std::string json = glz::write_json(response).value_or("{}");
    auto res = HttpResponse::newHttpResponse();
    res->setBody(json);
    res->setContentTypeCode(CT_APPLICATION_JSON);
    callback(res);
}

void AuthController::login(const HttpRequestPtr& req, std::function<void(const HttpResponsePtr&)>&& callback) {
    // Simulated login logic
    AuthResponse response;
    response.token = "simulated_jwt_token";
    response.user = {"1", "user@example.com", "Coffee Enthusiast"};

    std::string json = glz::write_json(response).value_or("{}");
    auto res = HttpResponse::newHttpResponse();
    res->setBody(json);
    res->setContentTypeCode(CT_APPLICATION_JSON);
    callback(res);
}

void AuthController::googleLogin(const HttpRequestPtr& req, std::function<void(const HttpResponsePtr&)>&& callback) {
    auto jsonBody = req->getJsonObject();
    
    std::string id = "unknown";
    std::string email = "unknown@example.com";
    std::string name = "Coffee Lover";
    std::optional<std::string> picture;

    if (jsonBody) {
        if ((*jsonBody).isMember("id")) id = (*jsonBody)["id"].asString();
        if ((*jsonBody).isMember("email")) email = (*jsonBody)["email"].asString();
        if ((*jsonBody).isMember("name")) name = (*jsonBody)["name"].asString();
        if ((*jsonBody).isMember("picture")) picture = (*jsonBody)["picture"].asString();
    }

    // 1. Determine Country (Preference -> ContextService)
    std::string country = "WW";
    if (jsonBody && (*jsonBody).isMember("preferredCountry") && !(*jsonBody)["preferredCountry"].asString().empty()) {
        country = (*jsonBody)["preferredCountry"].asString();
    } else {
        country = ContextService::getCountry(req);
    }

    // 2. Determine Language (Preference -> ContextService)
    std::string language = "en";
    if (jsonBody && (*jsonBody).isMember("preferredLanguage") && !(*jsonBody)["preferredLanguage"].asString().empty()) {
        language = (*jsonBody)["preferredLanguage"].asString();
    } else {
        language = ContextService::getLanguage(req);
    }

    auto dbClient = drogon::app().getDbClient();
    
    // Create or Update User
    dbClient->execSqlAsync(
        "INSERT INTO users (google_id, email, name, picture, country, language) "
        "VALUES ($1, $2, $3, $4, $5, $6) "
        "ON CONFLICT (google_id) DO UPDATE SET "
        "email = EXCLUDED.email, name = EXCLUDED.name, picture = EXCLUDED.picture, "
        "country = COALESCE(users.country, EXCLUDED.country), "
        "language = COALESCE(users.language, EXCLUDED.language) "
        "RETURNING id, country, language, is_admin",
        [callback, dbClient, req, id, email, name, picture](const drogon::orm::Result &r) {
            std::string finalCountry = "Rest of the World";
            std::string finalLang = "en";
            bool isAdmin = false;
            std::string internalUserId;
            
            if (r.size() > 0) {
                internalUserId = r[0]["id"].as<std::string>();
                finalCountry = r[0]["country"].as<std::string>();
                finalLang = r[0]["language"].as<std::string>();
                isAdmin = r[0]["is_admin"].as<bool>();

                // Record Login History (Background)
                std::string ip = req->getHeader("CF-Connecting-IP");
                if (ip.empty()) ip = req->getPeerAddr().toIp();
                
                dbClient->execSqlAsync(
                    "INSERT INTO login_history (user_id, ip_address) VALUES ($1, $2)",
                    [](const drogon::orm::Result &r){},
                    [](const drogon::orm::DrogonDbException &e){},
                    internalUserId, ip
                );
            }

            AuthResponse response;
            response.token = "simulated_vidita_jwt_" + id;
            response.user = User{id, email, name, picture, finalCountry, finalLang, id, isAdmin};

            // Fetch Roles
            AuthService::getUserRoles(id, [callback, response, dbClient, id](std::vector<UserRole> roles) mutable {
                response.user.roles = roles;

                // Fetch Mastery (New)
                dbClient->execSqlAsync(
                    "SELECT total_score, current_level, journal_count, method_count, venue_count, precision_count, last_updated::text "
                    "FROM user_mastery WHERE user_id = (SELECT id FROM users WHERE google_id = $1 LIMIT 1)",
                    [callback, response, id](const drogon::orm::Result &rm) mutable {
                        if (rm.size() > 0) {
                            UserMastery m;
                            m.total_score = rm[0]["total_score"].as<double>();
                            m.current_level = rm[0]["current_level"].as<int>();
                            m.journal_count = rm[0]["journal_count"].as<int>();
                            m.method_count = rm[0]["method_count"].as<int>();
                            m.venue_count = rm[0]["venue_count"].as<int>();
                            m.precision_count = rm[0]["precision_count"].as<int>();
                            m.last_updated = rm[0]["last_updated"].as<std::string>();
                            response.user.mastery = m;
                        }

                        std::string json = glz::write_json(response).value_or("{}");
                        auto res = HttpResponse::newHttpResponse();
                        res->setBody(json);
                        res->setContentTypeCode(CT_APPLICATION_JSON);
                        callback(res);
                    },
                    [callback, response](const drogon::orm::DrogonDbException &e) mutable {
                        // Fallback to no mastery if query fails
                        std::string json = glz::write_json(response).value_or("{}");
                        auto res = HttpResponse::newHttpResponse();
                        res->setBody(json);
                        res->setContentTypeCode(CT_APPLICATION_JSON);
                        callback(res);
                    },
                    id
                );
            });
        },
        [callback](const drogon::orm::DrogonDbException &e) {
            auto res = HttpResponse::newHttpResponse();
            res->setStatusCode(k500InternalServerError);
            res->setBody(e.base().what());
            callback(res);
        },
        id, email, name, picture.value_or(""), country, language
    );
}

void AuthController::me(const HttpRequestPtr& req, std::function<void(const HttpResponsePtr&)>&& callback) {
    auto userId = AuthService::getUserIdFromRequest(req);
    if (!userId) {
        auto res = HttpResponse::newHttpResponse();
        res->setStatusCode(k401Unauthorized);
        callback(res);
        return;
    }

    auto dbClient = drogon::app().getDbClient();
    dbClient->execSqlAsync(
        "SELECT google_id, email, name, picture, country, language, is_admin FROM users WHERE google_id = $1 OR id::text = $1",
        [callback, dbClient, userId](const drogon::orm::Result &r) {
            if (r.size() == 0) {
                auto res = HttpResponse::newHttpResponse();
                res->setStatusCode(k404NotFound);
                callback(res);
                return;
            }

            auto const &row = r[0];
            std::optional<std::string> picture;
            if (!row["picture"].isNull() && !row["picture"].as<std::string>().empty()) {
                picture = row["picture"].as<std::string>();
            }

            User user;
            user.id = row["google_id"].as<std::string>();
            user.google_id = user.id;
            user.email = row["email"].as<std::string>();
            user.name = row["name"].as<std::string>();
            user.picture = picture;
            user.country = row["country"].as<std::string>();
            user.language = row["language"].as<std::string>();
            user.is_admin = row["is_admin"].as<bool>();

            // Fetch Roles
            AuthService::getUserRoles(*userId, [callback, user, dbClient, userId](std::vector<UserRole> roles) mutable {
                user.roles = roles;

                // Fetch Mastery (New)
                dbClient->execSqlAsync(
                    "SELECT total_score, current_level, journal_count, method_count, venue_count, precision_count, last_updated::text "
                    "FROM user_mastery WHERE user_id = (SELECT id FROM users WHERE google_id = $1 OR id::text = $1 LIMIT 1)",
                    [callback, user](const drogon::orm::Result &rm) mutable {
                        if (rm.size() > 0) {
                            UserMastery m;
                            m.total_score = rm[0]["total_score"].as<double>();
                            m.current_level = rm[0]["current_level"].as<int>();
                            m.journal_count = rm[0]["journal_count"].as<int>();
                            m.method_count = rm[0]["method_count"].as<int>();
                            m.venue_count = rm[0]["venue_count"].as<int>();
                            m.precision_count = rm[0]["precision_count"].as<int>();
                            m.last_updated = rm[0]["last_updated"].as<std::string>();
                            user.mastery = m;
                        }

                        std::string json = glz::write_json(user).value_or("{}");
                        auto res = HttpResponse::newHttpResponse();
                        res->setBody(json);
                        res->setContentTypeCode(CT_APPLICATION_JSON);
                        callback(res);
                    },
                    [callback, user](const drogon::orm::DrogonDbException &e) mutable {
                        // Fallback to no mastery if query fails
                        std::string json = glz::write_json(user).value_or("{}");
                        auto res = HttpResponse::newHttpResponse();
                        res->setBody(json);
                        res->setContentTypeCode(CT_APPLICATION_JSON);
                        callback(res);
                    },
                    *userId
                );
            });
        },
        [callback](const drogon::orm::DrogonDbException &e) {
            auto res = HttpResponse::newHttpResponse();
            res->setStatusCode(k500InternalServerError);
            res->setBody(e.base().what());
            callback(res);
        },
        *userId
    );
}

void AuthController::getContext(const HttpRequestPtr& req, std::function<void(const HttpResponsePtr&)>&& callback) {
    std::string country = ContextService::getCountry(req);
    std::string language = ContextService::getLanguage(req);

    auto res = HttpResponse::newHttpResponse();
    res->setBody("{\"country\": \"" + country + "\", \"language\": \"" + language + "\"}");
    res->setContentTypeCode(CT_APPLICATION_JSON);
    callback(res);
}

void AuthController::updateProfile(const HttpRequestPtr& req, std::function<void(const HttpResponsePtr&)>&& callback) {
    auto userId = AuthService::getUserIdFromRequest(req);
    if (!userId) {
        auto res = HttpResponse::newHttpResponse();
        res->setStatusCode(k401Unauthorized);
        callback(res);
        return;
    }

    auto jsonBody = req->getJsonObject();
    if (!jsonBody) {
        auto res = HttpResponse::newHttpResponse();
        res->setStatusCode(k400BadRequest);
        callback(res);
        return;
    }

    std::string country = (*jsonBody).isMember("country") ? (*jsonBody)["country"].asString() : "";
    std::string language = (*jsonBody).isMember("language") ? (*jsonBody)["language"].asString() : "";

    auto dbClient = drogon::app().getDbClient();
    
    if (!country.empty() && !language.empty()) {
        dbClient->execSqlAsync(
            "UPDATE users SET country = $1, language = $2 WHERE google_id = $3 OR id::text = $3",
            [callback](const drogon::orm::Result &r) {
                auto res = HttpResponse::newHttpResponse();
                res->setStatusCode(k200OK);
                callback(res);
            },
            [callback](const drogon::orm::DrogonDbException &e) {
                auto res = HttpResponse::newHttpResponse();
                res->setStatusCode(k500InternalServerError);
                res->setBody(e.base().what());
                callback(res);
            },
            country, language, *userId
        );
    } else if (!country.empty()) {
        dbClient->execSqlAsync(
            "UPDATE users SET country = $1 WHERE google_id = $2 OR id::text = $2",
            [callback](const drogon::orm::Result &r) {
                auto res = HttpResponse::newHttpResponse();
                res->setStatusCode(k200OK);
                callback(res);
            },
            [callback](const drogon::orm::DrogonDbException &e) {
                auto res = HttpResponse::newHttpResponse();
                res->setStatusCode(k500InternalServerError);
                res->setBody(e.base().what());
                callback(res);
            },
            country, *userId
        );
    } else if (!language.empty()) {
        dbClient->execSqlAsync(
            "UPDATE users SET language = $1 WHERE google_id = $2 OR id::text = $2",
            [callback](const drogon::orm::Result &r) {
                auto res = HttpResponse::newHttpResponse();
                res->setStatusCode(k200OK);
                callback(res);
            },
            [callback](const drogon::orm::DrogonDbException &e) {
                auto res = HttpResponse::newHttpResponse();
                res->setStatusCode(k500InternalServerError);
                res->setBody(e.base().what());
                callback(res);
            },
            language, *userId
        );
    } else {
        auto res = HttpResponse::newHttpResponse();
        res->setStatusCode(k200OK); // No changes needed
        callback(res);
    }
}

void AuthController::registerDevice(const HttpRequestPtr& req, std::function<void(const HttpResponsePtr&)>&& callback) {
    auto userId = AuthService::getUserIdFromRequest(req);
    if (!userId) {
        auto res = HttpResponse::newHttpResponse();
        res->setStatusCode(k401Unauthorized);
        callback(res);
        return;
    }

    auto jsonBody = req->getJsonObject();
    if (!jsonBody || !(*jsonBody).isMember("fcm_token") || !(*jsonBody).isMember("platform")) {
        auto res = HttpResponse::newHttpResponse();
        res->setStatusCode(k400BadRequest);
        callback(res);
        return;
    }

    std::string fcmToken = (*jsonBody)["fcm_token"].asString();
    std::string platform = (*jsonBody)["platform"].asString();

    auto dbClient = drogon::app().getDbClient();
    dbClient->execSqlAsync(
        "INSERT INTO user_devices (user_id, fcm_token, platform) VALUES ($1, $2, $3) "
        "ON CONFLICT (user_id, fcm_token) DO UPDATE SET last_seen = CURRENT_TIMESTAMP",
        [callback](const drogon::orm::Result &r) {
            auto res = HttpResponse::newHttpResponse();
            res->setStatusCode(k200OK);
            callback(res);
        },
        [callback](const drogon::orm::DrogonDbException &e) {
            auto res = HttpResponse::newHttpResponse();
            res->setStatusCode(k500InternalServerError);
            res->setBody(e.base().what());
            callback(res);
        },
        *userId, fcmToken, platform
    );
}

} // namespace viditacafe
