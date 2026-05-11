#include "AdminShortLinkController.hpp"
#include "services/AuthService.hpp"
#include <glaze/glaze.hpp>

namespace viditacafe {

void AdminShortLinkController::list(const HttpRequestPtr& req, std::function<void(const HttpResponsePtr&)>&& callback) {
    AuthService::hasAdminAccess(req, [callback](bool isAdmin) {
        if (!isAdmin) {
            auto res = HttpResponse::newHttpResponse(); res->setStatusCode(k403Forbidden); callback(res);
            return;
        }

        ShortLinkService::listShortLinks(
            [callback](std::vector<ShortLink> links) {
                std::string json = glz::write_json(links).value_or("[]");
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

void AdminShortLinkController::getByCode(const HttpRequestPtr& req, std::function<void(const HttpResponsePtr&)>&& callback, std::string code) {
    AuthService::hasAdminAccess(req, [code, callback](bool isAdmin) {
        if (!isAdmin) {
            auto res = HttpResponse::newHttpResponse(); res->setStatusCode(k403Forbidden); callback(res);
            return;
        }

        ShortLinkService::getShortLinkByCode(code,
            [callback](std::optional<ShortLink> sl) {
                if (!sl) {
                    auto res = HttpResponse::newHttpResponse(); res->setStatusCode(k404NotFound); callback(res);
                    return;
                }
                std::string json = glz::write_json(*sl).value_or("{}");
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

void AdminShortLinkController::update(const HttpRequestPtr& req, std::function<void(const HttpResponsePtr&)>&& callback, std::string id) {
    AuthService::verifyRole(req, "COUNTRY", std::nullopt, [req, callback, id](bool hasAccess) {
        if (!hasAccess) {
            auto res = HttpResponse::newHttpResponse(); res->setStatusCode(k403Forbidden); callback(res);
            return;
        }

        ShortLink sl;
        auto err = glz::read<glz::opts{.error_on_unknown_keys = false}>(sl, req->getBody());
        if (bool(err)) {
            auto res = HttpResponse::newHttpResponse(); res->setStatusCode(k400BadRequest); callback(res);
            return;
        }

        ShortLinkService::updateShortLink(sl,
            [callback](std::string id) {
                auto res = HttpResponse::newHttpResponse();
                res->setStatusCode(k200OK);
                if (!id.empty()) res->setBody("{\"id\":\"" + id + "\"}");
                res->setContentTypeCode(CT_APPLICATION_JSON);
                callback(res);
            },
            [callback](const drogon::orm::DrogonDbException& e) {
                auto res = HttpResponse::newHttpResponse(); res->setStatusCode(k500InternalServerError); callback(res);
            }
        );
    });
}

void AdminShortLinkController::assignBlock(const HttpRequestPtr& req, std::function<void(const HttpResponsePtr&)>&& callback) {
    AuthService::verifyRole(req, "COUNTRY", std::nullopt, [req, callback](bool hasAccess) {
        if (!hasAccess) {
            auto res = HttpResponse::newHttpResponse(); res->setStatusCode(k403Forbidden); callback(res);
            return;
        }

        ShortLinkBlockRequest br;
        auto err = glz::read<glz::opts{.error_on_unknown_keys = false}>(br, req->getBody());
        if (bool(err)) {
            auto res = HttpResponse::newHttpResponse(); res->setStatusCode(k400BadRequest); callback(res);
            return;
        }

        ShortLinkService::assignShortLinkBlock(br,
            [callback]() {
                auto res = HttpResponse::newHttpResponse();
                res->setStatusCode(k200OK);
                res->setBody("{\"status\":\"ok\"}");
                res->setContentTypeCode(CT_APPLICATION_JSON);
                callback(res);
            },
            [callback](std::string error) {
                auto res = HttpResponse::newHttpResponse();
                res->setStatusCode(k400BadRequest);
                res->setBody("{\"error\":\"" + error + "\"}");
                res->setContentTypeCode(CT_APPLICATION_JSON);
                callback(res);
            },
            [callback](const drogon::orm::DrogonDbException& e) {
                auto res = HttpResponse::newHttpResponse(); res->setStatusCode(k500InternalServerError); callback(res);
            }
        );
    });
}

void AdminShortLinkController::remove(const HttpRequestPtr& req, std::function<void(const HttpResponsePtr&)>&& callback, std::string id) {
    AuthService::verifyRole(req, "GLOBAL", std::nullopt, [callback, id](bool hasAccess) {
        if (!hasAccess) {
            auto res = HttpResponse::newHttpResponse(); res->setStatusCode(k403Forbidden); callback(res);
            return;
        }

        ShortLinkService::removeShortLink(id,
            [callback]() {
                auto res = HttpResponse::newHttpResponse(); res->setStatusCode(k204NoContent); callback(res);
            },
            [callback](const drogon::orm::DrogonDbException& e) {
                auto res = HttpResponse::newHttpResponse(); res->setStatusCode(k500InternalServerError); callback(res);
            }
        );
    });
}

} // namespace viditacafe
