#pragma once
#include <drogon/HttpController.h>
#include "services/CatalogService.hpp"

using namespace drogon;

namespace viditacafe {

class CatalogController : public drogon::HttpController<CatalogController> {
public:
    METHOD_LIST_BEGIN
        ADD_METHOD_TO(CatalogController::listVideos, "/api/v1/admin/videos", Get);
        ADD_METHOD_TO(CatalogController::createVideo, "/api/v1/admin/videos", Post);
        ADD_METHOD_TO(CatalogController::updateVideo, "/api/v1/admin/videos/{1}", Put);
        ADD_METHOD_TO(CatalogController::removeVideo, "/api/v1/admin/videos/{1}", Delete);
        
        ADD_METHOD_TO(CatalogController::listLinks, "/api/v1/admin/links", Get);
        ADD_METHOD_TO(CatalogController::createLink, "/api/v1/admin/links", Post);
        ADD_METHOD_TO(CatalogController::updateLink, "/api/v1/admin/links/{1}", Put);
        ADD_METHOD_TO(CatalogController::removeLink, "/api/v1/admin/links/{1}", Delete);

        ADD_METHOD_TO(CatalogController::listEquipment, "/api/v1/admin/equipment", Get);
        ADD_METHOD_TO(CatalogController::createEquipment, "/api/v1/admin/equipment", Post);
        ADD_METHOD_TO(CatalogController::updateEquipment, "/api/v1/admin/equipment/{1}", Put);
        ADD_METHOD_TO(CatalogController::removeEquipment, "/api/v1/admin/equipment/{1}", Delete);
    METHOD_LIST_END

    void listVideos(const HttpRequestPtr& req, std::function<void(const HttpResponsePtr&)>&& callback);
    void createVideo(const HttpRequestPtr& req, std::function<void(const HttpResponsePtr&)>&& callback);
    void updateVideo(const HttpRequestPtr& req, std::function<void(const HttpResponsePtr&)>&& callback, std::string id);
    void removeVideo(const HttpRequestPtr& req, std::function<void(const HttpResponsePtr&)>&& callback, std::string id);

    void listLinks(const HttpRequestPtr& req, std::function<void(const HttpResponsePtr&)>&& callback);
    void createLink(const HttpRequestPtr& req, std::function<void(const HttpResponsePtr&)>&& callback);
    void updateLink(const HttpRequestPtr& req, std::function<void(const HttpResponsePtr&)>&& callback, std::string id);
    void removeLink(const HttpRequestPtr& req, std::function<void(const HttpResponsePtr&)>&& callback, std::string id);

    void listEquipment(const HttpRequestPtr& req, std::function<void(const HttpResponsePtr&)>&& callback);
    void createEquipment(const HttpRequestPtr& req, std::function<void(const HttpResponsePtr&)>&& callback);
    void updateEquipment(const HttpRequestPtr& req, std::function<void(const HttpResponsePtr&)>&& callback, std::string id);
    void removeEquipment(const HttpRequestPtr& req, std::function<void(const HttpResponsePtr&)>&& callback, std::string id);
};

} // namespace viditacafe
