#include "CatalogController.hpp"
#include "services/AuthService.hpp"
#include "services/StorageService.hpp"
#include <glaze/glaze.hpp>

namespace myshisha {

void CatalogController::listVideos(const HttpRequestPtr& req, std::function<void(const HttpResponsePtr&)>&& callback) {
    AuthService::hasAdminAccess(req, [req, callback](bool isAdmin) {
        if (!isAdmin) {
            auto res = HttpResponse::newHttpResponse(); res->setStatusCode(k403Forbidden); callback(res);
            return;
        }

        std::string lang = req->getParameter("lang");
        CatalogService::listVideos(lang,
            [callback](std::vector<Video> videos) {
                std::string json = glz::write_json(videos).value_or("[]");
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

void CatalogController::createVideo(const HttpRequestPtr& req, std::function<void(const HttpResponsePtr&)>&& callback) {
    AuthService::verifyRole(req, "GLOBAL", std::nullopt, [req, callback](bool hasAccess) {
        if (!hasAccess) {
            auto res = HttpResponse::newHttpResponse(); res->setStatusCode(k403Forbidden); callback(res);
            return;
        }

        Video v;
        auto err = glz::read<glz::opts{.error_on_unknown_keys = false}>(v, req->getBody());
        if (bool(err)) {
            auto res = HttpResponse::newHttpResponse(); res->setStatusCode(k400BadRequest); callback(res);
            return;
        }

        CatalogService::createVideo(v,
            [callback, v](std::string id) {
                auto res = HttpResponse::newHttpResponse();
                res->setStatusCode(k201Created);
                if (!id.empty()) {
                    auto fullVideo = v;
                    fullVideo.id = id;
                    std::string json = glz::write_json(fullVideo).value_or("{}");
                    res->setBody(json);
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

void CatalogController::updateVideo(const HttpRequestPtr& req, std::function<void(const HttpResponsePtr&)>&& callback, std::string id) {
    AuthService::verifyRole(req, "GLOBAL", std::nullopt, [req, callback, id](bool hasAccess) {
        if (!hasAccess) {
            auto res = HttpResponse::newHttpResponse(); res->setStatusCode(k403Forbidden); callback(res);
            return;
        }

        Video v;
        auto err = glz::read<glz::opts{.error_on_unknown_keys = false}>(v, req->getBody());
        if (bool(err)) {
            auto res = HttpResponse::newHttpResponse(); res->setStatusCode(k400BadRequest); callback(res);
            return;
        }

        CatalogService::updateVideo(id, v,
            [callback, v, id]() {
                auto fullVideo = v;
                fullVideo.id = id;
                std::string json = glz::write_json(fullVideo).value_or("{}");
                auto res = HttpResponse::newHttpResponse();
                res->setStatusCode(k200OK);
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

void CatalogController::removeVideo(const HttpRequestPtr& req, std::function<void(const HttpResponsePtr&)>&& callback, std::string id) {
    AuthService::verifyRole(req, "GLOBAL", std::nullopt, [callback, id](bool hasAccess) {
        if (!hasAccess) {
            auto res = HttpResponse::newHttpResponse(); res->setStatusCode(k403Forbidden); callback(res);
            return;
        }

        CatalogService::removeVideo(id,
            [callback]() {
                auto res = HttpResponse::newHttpResponse(); res->setStatusCode(k204NoContent); callback(res);
            },
            [callback](const drogon::orm::DrogonDbException& e) {
                auto res = HttpResponse::newHttpResponse(); res->setStatusCode(k500InternalServerError); callback(res);
            }
        );
    });
}

void CatalogController::listLinks(const HttpRequestPtr& req, std::function<void(const HttpResponsePtr&)>&& callback) {
    AuthService::hasAdminAccess(req, [callback](bool isAdmin) {
        if (!isAdmin) {
            auto res = HttpResponse::newHttpResponse(); res->setStatusCode(k403Forbidden); callback(res);
            return;
        }

        CatalogService::listLinks(
            [callback](std::vector<PurchaseLink> links) {
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

void CatalogController::createLink(const HttpRequestPtr& req, std::function<void(const HttpResponsePtr&)>&& callback) {
    PurchaseLink pl;
    auto err = glz::read<glz::opts{.error_on_unknown_keys = false}>(pl, req->getBody());
    if (bool(err)) {
        auto res = HttpResponse::newHttpResponse(); res->setStatusCode(k400BadRequest); callback(res);
        return;
    }

    AuthService::verifyRole(req, "COUNTRY", pl.countryCode, [req, callback, pl](bool hasAccess) {
        if (!hasAccess) {
            auto res = HttpResponse::newHttpResponse(); res->setStatusCode(k403Forbidden); callback(res);
            return;
        }

        CatalogService::createLink(pl,
            [callback](std::string id) {
                auto res = HttpResponse::newHttpResponse();
                res->setStatusCode(k201Created);
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

void CatalogController::updateLink(const HttpRequestPtr& req, std::function<void(const HttpResponsePtr&)>&& callback, std::string id) {
    PurchaseLink pl;
    auto err = glz::read<glz::opts{.error_on_unknown_keys = false}>(pl, req->getBody());
    if (bool(err)) {
        auto res = HttpResponse::newHttpResponse(); res->setStatusCode(k400BadRequest); callback(res);
        return;
    }

    AuthService::verifyRole(req, "COUNTRY", pl.countryCode, [req, callback, pl, id](bool hasAccess) {
        if (!hasAccess) {
            auto res = HttpResponse::newHttpResponse(); res->setStatusCode(k403Forbidden); callback(res);
            return;
        }

        CatalogService::updateLink(id, pl,
            [callback]() {
                auto res = HttpResponse::newHttpResponse(); res->setStatusCode(k200OK); callback(res);
            },
            [callback](const drogon::orm::DrogonDbException& e) {
                auto res = HttpResponse::newHttpResponse(); res->setStatusCode(k500InternalServerError); callback(res);
            }
        );
    });
}

void CatalogController::removeLink(const HttpRequestPtr& req, std::function<void(const HttpResponsePtr&)>&& callback, std::string id) {
    CatalogService::getLinkCountryCode(id,
        [req, callback, id](std::string countryCode) {
            if (countryCode.empty()) {
                auto res = HttpResponse::newHttpResponse(); res->setStatusCode(k404NotFound); callback(res);
                return;
            }

            AuthService::verifyRole(req, "COUNTRY", countryCode, [callback, id](bool hasAccess) {
                if (!hasAccess) {
                    auto res = HttpResponse::newHttpResponse(); res->setStatusCode(k403Forbidden); callback(res);
                    return;
                }

                CatalogService::removeLink(id,
                    [callback]() {
                        auto res = HttpResponse::newHttpResponse(); res->setStatusCode(k204NoContent); callback(res);
                    },
                    [callback](const drogon::orm::DrogonDbException& e) {
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

void CatalogController::listEquipment(const HttpRequestPtr& req, std::function<void(const HttpResponsePtr&)>&& callback) {
    AuthService::hasAdminAccess(req, [callback](bool isAdmin) {
        if (!isAdmin) {
            auto res = HttpResponse::newHttpResponse(); res->setStatusCode(k403Forbidden); callback(res);
            return;
        }

        CatalogService::listEquipment(
            [callback](std::vector<Equipment> equipment) {
                std::string json = glz::write_json(equipment).value_or("[]");
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

void CatalogController::createEquipment(const HttpRequestPtr& req, std::function<void(const HttpResponsePtr&)>&& callback) {
    AuthService::verifyRole(req, "GLOBAL", std::nullopt, [req, callback](bool hasAccess) {
        if (!hasAccess) {
            auto res = HttpResponse::newHttpResponse(); res->setStatusCode(k403Forbidden); callback(res);
            return;
        }

        auto e = std::make_shared<Equipment>();
        auto err = glz::read<glz::opts{.error_on_unknown_keys = false}>(*e, req->getBody());
        if (bool(err)) {
            auto res = HttpResponse::newHttpResponse(); res->setStatusCode(k400BadRequest); callback(res);
            return;
        }

        StorageService::downloadImage(e->imageUrl, e->name, [e, callback](std::string finalImageUrl) {
            e->imageUrl = finalImageUrl;
            CatalogService::createEquipment(*e,
                [callback](std::string id) {
                    if (id.empty()) {
                        auto res = HttpResponse::newHttpResponse(); res->setStatusCode(k500InternalServerError); callback(res);
                        return;
                    }
                    auto res = HttpResponse::newHttpResponse();
                    res->setStatusCode(k201Created);
                    res->setBody("{\"id\":\"" + id + "\"}");
                    res->setContentTypeCode(CT_APPLICATION_JSON);
                    callback(res);
                },
                [callback](const drogon::orm::DrogonDbException& e) {
                    auto res = HttpResponse::newHttpResponse(); res->setStatusCode(k500InternalServerError); callback(res);
                }
            );
        });
    });
}

void CatalogController::updateEquipment(const HttpRequestPtr& req, std::function<void(const HttpResponsePtr&)>&& callback, std::string id) {
    AuthService::verifyRole(req, "GLOBAL", std::nullopt, [req, callback, id](bool hasAccess) {
        if (!hasAccess) {
            auto res = HttpResponse::newHttpResponse(); res->setStatusCode(k403Forbidden); callback(res);
            return;
        }

        auto e = std::make_shared<Equipment>();
        auto err = glz::read<glz::opts{.error_on_unknown_keys = false}>(*e, req->getBody());
        if (bool(err)) {
            auto res = HttpResponse::newHttpResponse(); res->setStatusCode(k400BadRequest); callback(res);
            return;
        }

        StorageService::downloadImage(e->imageUrl, e->name, [e, callback, id](std::string finalImageUrl) {
            e->imageUrl = finalImageUrl;
            CatalogService::updateEquipment(id, *e,
                [callback]() {
                    auto res = HttpResponse::newHttpResponse(); res->setStatusCode(k200OK); callback(res);
                },
                [callback](const drogon::orm::DrogonDbException& e) {
                    auto res = HttpResponse::newHttpResponse(); res->setStatusCode(k500InternalServerError); callback(res);
                }
            );
        });
    });
}

void CatalogController::removeEquipment(const HttpRequestPtr& req, std::function<void(const HttpResponsePtr&)>&& callback, std::string id) {
    AuthService::verifyRole(req, "GLOBAL", std::nullopt, [callback, id](bool hasAccess) {
        if (!hasAccess) {
            auto res = HttpResponse::newHttpResponse(); res->setStatusCode(k403Forbidden); callback(res);
            return;
        }

        CatalogService::removeEquipment(id,
            [callback]() {
                auto res = HttpResponse::newHttpResponse(); res->setStatusCode(k204NoContent); callback(res);
            },
            [callback](const drogon::orm::DrogonDbException& e) {
                auto res = HttpResponse::newHttpResponse(); res->setStatusCode(k500InternalServerError); callback(res);
            }
        );
    });
}

} // namespace myshisha
