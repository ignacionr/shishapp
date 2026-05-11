#include "AdminTagController.hpp"
#include "services/AuthService.hpp"
#include <glaze/glaze.hpp>

namespace shishapp {

void AdminTagController::listAll(const HttpRequestPtr& req, std::function<void(const HttpResponsePtr&)>&& callback) {
    AuthService::hasAdminAccess(req, [callback](bool isAdmin) {
        if (!isAdmin) {
            auto res = HttpResponse::newHttpResponse(); res->setStatusCode(k403Forbidden); callback(res);
            return;
        }

        TagService::listAllTags(
            [callback](std::vector<FullTagCategory> cats) {
                std::string json = glz::write_json(cats).value_or("[]");
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

void AdminTagController::create(const HttpRequestPtr& req, std::function<void(const HttpResponsePtr&)>&& callback) {
    auto requesterId = AuthService::getUserIdFromRequest(req);
    if (!requesterId) {
        auto res = HttpResponse::newHttpResponse(); res->setStatusCode(k401Unauthorized); callback(res);
        return;
    }

    auto reqBody = glz::read_json<CreateTagRequest>(req->getBody());
    if (!reqBody) {
        auto res = HttpResponse::newHttpResponse(); res->setStatusCode(k400BadRequest); callback(res);
        return;
    }

    auto action = [reqBody, callback](bool allowed) {
        if (!allowed) {
            auto res = HttpResponse::newHttpResponse(); res->setStatusCode(k403Forbidden); callback(res);
            return;
        }

        TagService::createTag(*reqBody,
            [callback](std::string tagId) {
                if (tagId.empty()) {
                    auto res = HttpResponse::newHttpResponse(); res->setStatusCode(k500InternalServerError); callback(res);
                    return;
                }
                auto res = HttpResponse::newHttpResponse();
                res->setBody("{\"id\":\"" + tagId + "\"}");
                res->setStatusCode(k201Created);
                callback(res);
            },
            [callback](const drogon::orm::DrogonDbException& e) {
                auto res = HttpResponse::newHttpResponse(); res->setStatusCode(k500InternalServerError); callback(res);
            }
        );
    };

    if (reqBody->venue_id) {
        AuthService::verifyRole(req, "VENUE", *reqBody->venue_id, action);
    } else {
        AuthService::hasAdminAccess(req, action);
    }
}

void AdminTagController::getContextTags(const HttpRequestPtr& req, std::function<void(const HttpResponsePtr&)>&& callback) {
    auto requesterId = AuthService::getUserIdFromRequest(req);
    if (!requesterId) {
        auto res = HttpResponse::newHttpResponse(); res->setStatusCode(k401Unauthorized); callback(res);
        return;
    }

    AuthService::getUserRoles(*requesterId, [callback](std::vector<UserRole> myRoles) {
        bool isGlobal = std::any_of(myRoles.begin(), myRoles.end(), [](auto const& r){ return r.role_type == "GLOBAL"; });
        std::vector<std::string> allowedCountries;
        for (auto const& r : myRoles) if (r.role_type == "COUNTRY" && r.target_id) allowedCountries.push_back(*r.target_id);

        if (!isGlobal && allowedCountries.empty()) {
            auto res = HttpResponse::newHttpResponse(); res->setStatusCode(k403Forbidden); callback(res);
            return;
        }

        TagService::getContextTags(allowedCountries, isGlobal, myRoles,
            [callback](glz::generic result) {
                auto res = HttpResponse::newHttpResponse();
                res->setBody(glz::write_json(result).value_or("{}"));
                res->setContentTypeCode(CT_APPLICATION_JSON);
                callback(res);
            },
            [callback](const drogon::orm::DrogonDbException& e) {
                auto res = HttpResponse::newHttpResponse(); res->setStatusCode(k500InternalServerError); callback(res);
            }
        );
    });
}

void AdminTagController::setCountryTags(const HttpRequestPtr& req, std::function<void(const HttpResponsePtr&)>&& callback, std::string countryCode) {
    auto requesterId = AuthService::getUserIdFromRequest(req);
    if (!requesterId) {
        auto res = HttpResponse::newHttpResponse(); res->setStatusCode(k401Unauthorized); callback(res);
        return;
    }

    AuthService::verifyRole(req, "COUNTRY", countryCode, [req, callback, countryCode](bool allowed) {
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

        TagService::setCountryTags(countryCode, tags,
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
