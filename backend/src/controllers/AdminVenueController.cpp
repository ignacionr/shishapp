#include "AdminVenueController.hpp"
#include "services/AuthService.hpp"
#include <glaze/glaze.hpp>

namespace shishapp {

void AdminVenueController::list(const HttpRequestPtr& req, std::function<void(const HttpResponsePtr&)>&& callback) {
    auto userId = AuthService::getUserIdFromRequest(req);
    if (!userId) {
        auto res = HttpResponse::newHttpResponse(); res->setStatusCode(k401Unauthorized); callback(res);
        return;
    }

    AuthService::getUserRoles(*userId, [callback](std::vector<UserRole> roles) {
        bool isGlobal = false;
        std::vector<std::string> allowedCountries;
        for (auto const& r : roles) {
            if (r.role_type == "GLOBAL") isGlobal = true;
            if (r.role_type == "COUNTRY" && r.target_id) allowedCountries.push_back(*r.target_id);
        }

        if (!isGlobal && allowedCountries.empty()) {
            auto res = HttpResponse::newHttpResponse(); res->setStatusCode(k403Forbidden); callback(res);
            return;
        }

        VenueService::listVenues(allowedCountries, isGlobal,
            [callback](std::vector<Venue> venues) {
                std::string json = glz::write_json(venues).value_or("[]");
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

void AdminVenueController::search(const HttpRequestPtr& req, std::function<void(const HttpResponsePtr&)>&& callback) {
    auto userId = AuthService::getUserIdFromRequest(req);
    if (!userId) {
        auto res = HttpResponse::newHttpResponse(); res->setStatusCode(k401Unauthorized); callback(res);
        return;
    }

    AuthService::getUserRoles(*userId, [req, callback](std::vector<UserRole> roles) {
        bool isGlobal = false;
        std::vector<std::string> allowedCountries;
        for (auto const& r : roles) {
            if (r.role_type == "GLOBAL") isGlobal = true;
            if (r.role_type == "COUNTRY" && r.target_id) allowedCountries.push_back(*r.target_id);
        }

        if (!isGlobal && allowedCountries.empty()) {
            auto res = HttpResponse::newHttpResponse(); res->setStatusCode(k403Forbidden); callback(res);
            return;
        }

        std::string q = req->getParameter("q");
        VenueService::searchVenues(q, allowedCountries, isGlobal,
            [callback](std::vector<Venue> venues) {
                std::string json = glz::write_json(venues).value_or("[]");
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

void AdminVenueController::create(const HttpRequestPtr& req, std::function<void(const HttpResponsePtr&)>&& callback) {
    auto venue = std::make_shared<Venue>();
    auto err = glz::read_json(*venue, req->getBody());
    if (bool(err)) {
        auto res = HttpResponse::newHttpResponse(); res->setStatusCode(k400BadRequest); callback(res);
        return;
    }

    AuthService::verifyRole(req, "COUNTRY", venue->country_code, [venue, callback](bool allowed) {
        if (!allowed) {
            auto res = HttpResponse::newHttpResponse(); res->setStatusCode(k403Forbidden); callback(res);
            return;
        }

        VenueService::createVenue(*venue,
            [callback, venue](std::string id) {
                auto res = HttpResponse::newHttpResponse();
                res->setStatusCode(k201Created);
                if (!id.empty()) {
                    venue->id = id;
                    res->setBody(glz::write_json(*venue).value_or("{}"));
                }
                res->setContentTypeCode(CT_APPLICATION_JSON);
                callback(res);
            },
            [callback](const drogon::orm::DrogonDbException& e) {
                auto res = HttpResponse::newHttpResponse(); res->setStatusCode(k500InternalServerError); callback(res);
            }
        );
    });
}

void AdminVenueController::update(const HttpRequestPtr& req, std::function<void(const HttpResponsePtr&)>&& callback, std::string id) {
    auto venue = std::make_shared<Venue>();
    auto err = glz::read_json(*venue, req->getBody());
    if (bool(err)) {
        auto res = HttpResponse::newHttpResponse(); res->setStatusCode(k400BadRequest); callback(res);
        return;
    }

    AuthService::verifyRole(req, "COUNTRY", venue->country_code, [id, venue, callback](bool allowed) {
        if (!allowed) {
            auto res = HttpResponse::newHttpResponse(); res->setStatusCode(k403Forbidden); callback(res);
            return;
        }

        VenueService::updateVenue(id, *venue,
            [callback, venue, id]() {
                venue->id = id;
                auto res = HttpResponse::newHttpResponse();
                res->setStatusCode(k200OK);
                res->setBody(glz::write_json(*venue).value_or("{}"));
                res->setContentTypeCode(CT_APPLICATION_JSON);
                callback(res);
            },
            [callback](const drogon::orm::DrogonDbException& e) {
                auto res = HttpResponse::newHttpResponse(); res->setStatusCode(k500InternalServerError); callback(res);
            }
        );
    });
}

void AdminVenueController::remove(const HttpRequestPtr& req, std::function<void(const HttpResponsePtr&)>&& callback, std::string id) {
    auto db = drogon::app().getDbClient();
    db->execSqlAsync(
        "SELECT country_code FROM venues WHERE id::text = $1",
        [req, callback, id](const drogon::orm::Result &r) {
            if (r.size() == 0) {
                auto res = HttpResponse::newHttpResponse(); res->setStatusCode(k404NotFound); callback(res);
                return;
            }
            std::string countryCode = r[0]["country_code"].as<std::string>();
            AuthService::verifyRole(req, "COUNTRY", countryCode, [id, callback](bool allowed) {
                if (!allowed) {
                    auto res = HttpResponse::newHttpResponse(); res->setStatusCode(k403Forbidden); callback(res);
                    return;
                }
                VenueService::removeVenue(id,
                    [callback]() {
                        auto res = HttpResponse::newHttpResponse(); res->setStatusCode(k204NoContent); callback(res);
                    },
                    [callback](const drogon::orm::DrogonDbException& e) {
                        auto res = HttpResponse::newHttpResponse(); res->setStatusCode(k500InternalServerError); callback(res);
                    }
                );
            });
        },
        [callback](const drogon::orm::DrogonDbException &e) {
            auto res = HttpResponse::newHttpResponse(); res->setStatusCode(k500InternalServerError); callback(res);
        },
        id
    );
}

void AdminVenueController::getVenueTags(const HttpRequestPtr& req, std::function<void(const HttpResponsePtr&)>&& callback, std::string venueId) {
    AuthService::verifyRole(req, "VENUE", venueId, [callback, venueId](bool allowed) {
        if (!allowed) {
            auto res = HttpResponse::newHttpResponse(); res->setStatusCode(k403Forbidden); callback(res);
            return;
        }

        VenueService::getVenueTags(venueId,
            [callback](VenueTagConfig cfg) {
                auto res = HttpResponse::newHttpResponse();
                res->setBody(glz::write_json(cfg).value_or("{}"));
                res->setContentTypeCode(CT_APPLICATION_JSON);
                callback(res);
            },
            [callback](const drogon::orm::DrogonDbException& e) {
                auto res = HttpResponse::newHttpResponse(); res->setStatusCode(k500InternalServerError); callback(res);
            }
        );
    });
}

void AdminVenueController::setVenueTags(const HttpRequestPtr& req, std::function<void(const HttpResponsePtr&)>&& callback, std::string venueId) {
    AuthService::verifyRole(req, "VENUE", venueId, [req, callback, venueId](bool allowed) {
        if (!allowed) {
            auto res = HttpResponse::newHttpResponse(); res->setStatusCode(k403Forbidden); callback(res);
            return;
        }

        std::vector<ContextTagSelection> tags;
        auto err = glz::read_json(tags, req->getBody());
        if (bool(err)) {
            auto res = HttpResponse::newHttpResponse(); res->setStatusCode(k400BadRequest); callback(res);
            return;
        }

        VenueService::setVenueTags(venueId, tags,
            [callback]() {
                auto res = HttpResponse::newHttpResponse(); res->setStatusCode(k200OK); callback(res);
            },
            [callback](const drogon::orm::DrogonDbException& e) {
                auto res = HttpResponse::newHttpResponse(); res->setStatusCode(k500InternalServerError); callback(res);
            }
        );
    });
}

} // namespace shishapp
