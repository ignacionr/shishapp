#pragma once
#include <drogon/HttpController.h>
#include "services/ShortLinkService.hpp"

using namespace drogon;

namespace viditacafe {

class AdminShortLinkController : public drogon::HttpController<AdminShortLinkController> {
public:
    METHOD_LIST_BEGIN
        ADD_METHOD_TO(AdminShortLinkController::list, "/api/v1/admin/short-links", Get);
        ADD_METHOD_TO(AdminShortLinkController::getByCode, "/api/v1/admin/short-links/code/{1}", Get);
        ADD_METHOD_TO(AdminShortLinkController::update, "/api/v1/admin/short-links/{1}", Put);
        ADD_METHOD_TO(AdminShortLinkController::assignBlock, "/api/v1/admin/short-links/assign-block", Post);
        ADD_METHOD_TO(AdminShortLinkController::remove, "/api/v1/admin/short-links/{1}", Delete);
    METHOD_LIST_END

    void list(const HttpRequestPtr& req, std::function<void(const HttpResponsePtr&)>&& callback);
    void getByCode(const HttpRequestPtr& req, std::function<void(const HttpResponsePtr&)>&& callback, std::string code);
    void update(const HttpRequestPtr& req, std::function<void(const HttpResponsePtr&)>&& callback, std::string id);
    void assignBlock(const HttpRequestPtr& req, std::function<void(const HttpResponsePtr&)>&& callback);
    void remove(const HttpRequestPtr& req, std::function<void(const HttpResponsePtr&)>&& callback, std::string id);
};

} // namespace viditacafe
