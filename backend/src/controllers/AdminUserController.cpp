#include "AdminUserController.hpp"
#include "services/AuthService.hpp"
#include <glaze/glaze.hpp>

namespace viditacafe {

void AdminUserController::list(const HttpRequestPtr& req, std::function<void(const HttpResponsePtr&)>&& callback) {
    AuthService::hasAdminAccess(req, [req, callback](bool isAdmin) {
        if (!isAdmin) {
            auto res = HttpResponse::newHttpResponse(); res->setStatusCode(k403Forbidden); callback(res);
            return;
        }

        std::string q = req->getParameter("q");
        UserService::listUsers(q,
            [callback](std::vector<User> users) {
                std::string json = glz::write_json(users).value_or("[]");
                auto res = HttpResponse::newHttpResponse();
                res->setBody(json);
                res->setContentTypeCode(CT_APPLICATION_JSON);
                callback(res);
            },
            [callback](const drogon::orm::DrogonDbException& e) {
                auto res = HttpResponse::newHttpResponse(); res->setStatusCode(k500InternalServerError); callback(res);
            }
        );
    });
}

void AdminUserController::assignRole(const HttpRequestPtr& req, std::function<void(const HttpResponsePtr&)>&& callback, std::string userId) {
    UserRole role;
    auto err = glz::read_json(role, req->getBody());
    if (bool(err)) {
        auto res = HttpResponse::newHttpResponse(); res->setStatusCode(k400BadRequest); callback(res);
        return;
    }

    auto requesterId = AuthService::getUserIdFromRequest(req);
    if (!requesterId) {
        auto res = HttpResponse::newHttpResponse(); res->setStatusCode(k401Unauthorized); callback(res);
        return;
    }

    AuthService::getUserRoles(*requesterId, [req, callback, userId, role](std::vector<UserRole> myRoles) {
        bool isGlobal = std::any_of(myRoles.begin(), myRoles.end(), [](auto const& r){ return r.role_type == "GLOBAL"; });
        
        bool allowed = false;
        if (isGlobal) {
            allowed = true;
        } else if (role.role_type == "VENUE" && role.target_id) {
            // Check if requester is COUNTRY admin for the venue's country
            auto db = drogon::app().getDbClient();
            db->execSqlAsync(
                "SELECT country_code FROM venues WHERE id::text = $1",
                [myRoles, role, callback, userId, db](const drogon::orm::Result &r) {
                    if (r.size() == 0) {
                        auto res = HttpResponse::newHttpResponse(); res->setStatusCode(k404NotFound); callback(res);
                        return;
                    }
                    std::string venueCountry = r[0]["country_code"].as<std::string>();
                    bool isCountryAdmin = std::any_of(myRoles.begin(), myRoles.end(), [&](auto const& mr){
                        return mr.role_type == "COUNTRY" && mr.target_id && *mr.target_id == venueCountry;
                    });

                    if (!isCountryAdmin) {
                        auto res = HttpResponse::newHttpResponse(); res->setStatusCode(k403Forbidden); callback(res);
                        return;
                    }

                    UserService::assignRole(userId, role,
                        [callback](std::string id) {
                            auto res = HttpResponse::newHttpResponse();
                            res->setStatusCode(k201Created);
                            if (!id.empty()) res->setBody("{\"id\":\"" + id + "\"}");
                            else res->setBody("{}");
                            res->setContentTypeCode(CT_APPLICATION_JSON);
                            callback(res);
                        },
                        [callback](const drogon::orm::DrogonDbException &e) {
                            auto res = HttpResponse::newHttpResponse(); res->setStatusCode(k500InternalServerError); callback(res);
                        }
                    );
                },
                [callback](const drogon::orm::DrogonDbException &e) {
                    auto res = HttpResponse::newHttpResponse(); res->setStatusCode(k500InternalServerError); callback(res);
                },
                *role.target_id
            );
            return;
        }

        if (!allowed) {
            auto res = HttpResponse::newHttpResponse(); res->setStatusCode(k403Forbidden); callback(res);
            return;
        }

        UserService::assignRole(userId, role,
            [callback](std::string id) {
                auto res = HttpResponse::newHttpResponse();
                res->setStatusCode(k201Created);
                if (!id.empty()) res->setBody("{\"id\":\"" + id + "\"}");
                else res->setBody("{}");
                res->setContentTypeCode(CT_APPLICATION_JSON);
                callback(res);
            },
            [callback](const drogon::orm::DrogonDbException &e) {
                auto res = HttpResponse::newHttpResponse(); res->setStatusCode(k500InternalServerError); callback(res);
            }
        );
    });
}

void AdminUserController::revokeRole(const HttpRequestPtr& req, std::function<void(const HttpResponsePtr&)>&& callback, std::string roleId) {
    auto requesterId = AuthService::getUserIdFromRequest(req);
    if (!requesterId) {
        auto res = HttpResponse::newHttpResponse(); res->setStatusCode(k401Unauthorized); callback(res);
        return;
    }

    UserService::getRoleInfo(roleId,
        [req, callback, roleId, requesterId](std::string roleType, std::optional<std::string> targetId) {
            if (roleType.empty()) {
                auto res = HttpResponse::newHttpResponse(); res->setStatusCode(k404NotFound); callback(res);
                return;
            }

            AuthService::getUserRoles(*requesterId, [callback, roleId, roleType, targetId](std::vector<UserRole> myRoles) {
                bool isGlobal = std::any_of(myRoles.begin(), myRoles.end(), [](auto const& r){ return r.role_type == "GLOBAL"; });
                
                bool allowed = false;
                if (isGlobal) {
                    allowed = true;
                } else if (roleType == "VENUE" && targetId) {
                    auto db = drogon::app().getDbClient();
                    db->execSqlAsync(
                        "SELECT country_code FROM venues WHERE id::text = $1",
                        [myRoles, callback, roleId](const drogon::orm::Result &r) {
                            if (r.size() == 0) {
                                auto res = HttpResponse::newHttpResponse(); res->setStatusCode(k403Forbidden); callback(res);
                                return;
                            }
                            std::string venueCountry = r[0]["country_code"].as<std::string>();
                            bool isCountryAdmin = std::any_of(myRoles.begin(), myRoles.end(), [&](auto const& mr){
                                return mr.role_type == "COUNTRY" && mr.target_id && *mr.target_id == venueCountry;
                            });

                            if (!isCountryAdmin) {
                                auto res = HttpResponse::newHttpResponse(); res->setStatusCode(k403Forbidden); callback(res);
                                return;
                            }

                            UserService::revokeRole(roleId,
                                [callback]() {
                                    auto res = HttpResponse::newHttpResponse(); res->setStatusCode(k204NoContent); callback(res);
                                },
                                [callback](const drogon::orm::DrogonDbException &e) {
                                    auto res = HttpResponse::newHttpResponse(); res->setStatusCode(k500InternalServerError); callback(res);
                                }
                            );
                        },
                        [callback](const drogon::orm::DrogonDbException &e) {
                            auto res = HttpResponse::newHttpResponse(); res->setStatusCode(k500InternalServerError); callback(res);
                        },
                        *targetId
                    );
                    return;
                }

                if (!allowed) {
                    auto res = HttpResponse::newHttpResponse(); res->setStatusCode(k403Forbidden); callback(res);
                    return;
                }

                UserService::revokeRole(roleId,
                    [callback]() {
                        auto res = HttpResponse::newHttpResponse(); res->setStatusCode(k204NoContent); callback(res);
                    },
                    [callback](const drogon::orm::DrogonDbException &e) {
                        auto res = HttpResponse::newHttpResponse(); res->setStatusCode(k500InternalServerError); callback(res);
                    }
                );
            });
        },
        [callback](const drogon::orm::DrogonDbException& e) {
            auto res = HttpResponse::newHttpResponse(); res->setStatusCode(k500InternalServerError); callback(res);
        }
    );
}

void AdminUserController::impersonate(const HttpRequestPtr& req, std::function<void(const HttpResponsePtr&)>&& callback, std::string userId) {
    const std::string SOUTH_POLE_TESTER_ID = "1bbb4d58-d561-41fa-a4ce-5e6d153a6e89";

    auto startImpersonation = [req, callback, userId]() {
        UserService::getUserForImpersonation(userId,
            [callback, userId](User user) {
                if (user.id.empty()) {
                    auto res = HttpResponse::newHttpResponse(); res->setStatusCode(k404NotFound); callback(res);
                    return;
                }

                AuthResponse response;
                response.token = "simulated_vidita_jwt_" + user.id;
                
                AuthService::getUserRoles(user.id, [callback, response, user](std::vector<UserRole> roles) mutable {
                    response.user = user;
                    response.user.roles = roles;

                    auto db = drogon::app().getDbClient();
                    db->execSqlAsync(
                        "SELECT total_score, current_level, journal_count, method_count, venue_count, precision_count, last_updated::text "
                        "FROM user_mastery WHERE user_id = (SELECT id FROM users WHERE google_id = $1 OR id::text = $1 LIMIT 1)",
                        [callback, response](const drogon::orm::Result &rm) mutable {
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
                            std::string json = glz::write_json(response).value_or("{}");
                            auto res = HttpResponse::newHttpResponse();
                            res->setBody(json);
                            res->setContentTypeCode(CT_APPLICATION_JSON);
                            callback(res);
                        },
                        user.id
                    );
                });
            },
            [callback](const drogon::orm::DrogonDbException& e) {
                auto res = HttpResponse::newHttpResponse(); res->setStatusCode(k500InternalServerError); callback(res);
            }
        );
    };

    AuthService::verifyRole(req, "GLOBAL", std::nullopt, [req, callback, userId, SOUTH_POLE_TESTER_ID, startImpersonation](bool isGlobal) {
        if (isGlobal) {
            startImpersonation();
        } else if (userId == SOUTH_POLE_TESTER_ID) {
            AuthService::verifyRole(req, "COUNTRY", std::nullopt, [callback, startImpersonation](bool isCountryAdmin) {
                if (isCountryAdmin) {
                    startImpersonation();
                } else {
                    auto res = HttpResponse::newHttpResponse(); res->setStatusCode(k403Forbidden); callback(res);
                }
            });
        } else {
            auto res = HttpResponse::newHttpResponse(); res->setStatusCode(k403Forbidden); callback(res);
        }
    });
}

} // namespace viditacafe
