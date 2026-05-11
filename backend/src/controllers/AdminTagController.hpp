#pragma once
#include <drogon/HttpController.h>
#include "services/TagService.hpp"

using namespace drogon;

namespace viditacafe {

class AdminTagController : public drogon::HttpController<AdminTagController> {
public:
    METHOD_LIST_BEGIN
        ADD_METHOD_TO(AdminTagController::listAll, "/api/v1/admin/tags/all", Get);
        ADD_METHOD_TO(AdminTagController::create, "/api/v1/admin/tags", Post);
        ADD_METHOD_TO(AdminTagController::getContextTags, "/api/v1/admin/tags/context", Get);
        ADD_METHOD_TO(AdminTagController::setCountryTags, "/api/v1/admin/tags/country/{1}", Post);
    METHOD_LIST_END

    void listAll(const HttpRequestPtr& req, std::function<void(const HttpResponsePtr&)>&& callback);
    void create(const HttpRequestPtr& req, std::function<void(const HttpResponsePtr&)>&& callback);
    void getContextTags(const HttpRequestPtr& req, std::function<void(const HttpResponsePtr&)>&& callback);
    void setCountryTags(const HttpRequestPtr& req, std::function<void(const HttpResponsePtr&)>&& callback, std::string countryCode);
};

} // namespace viditacafe
