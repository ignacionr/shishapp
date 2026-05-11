#pragma once
#include <drogon/HttpController.h>
#include "services/UserService.hpp"

using namespace drogon;

namespace shishapp {

class AdminUserController : public drogon::HttpController<AdminUserController> {
public:
    METHOD_LIST_BEGIN
        ADD_METHOD_TO(AdminUserController::list, "/api/v1/admin/users", Get);
        ADD_METHOD_TO(AdminUserController::assignRole, "/api/v1/admin/users/{1}/roles", Post);
        ADD_METHOD_TO(AdminUserController::revokeRole, "/api/v1/admin/users/roles/{1}", Delete);
        ADD_METHOD_TO(AdminUserController::impersonate, "/api/v1/admin/users/{1}/impersonate", Post);
    METHOD_LIST_END

    void list(const HttpRequestPtr& req, std::function<void(const HttpResponsePtr&)>&& callback);
    void assignRole(const HttpRequestPtr& req, std::function<void(const HttpResponsePtr&)>&& callback, std::string userId);
    void revokeRole(const HttpRequestPtr& req, std::function<void(const HttpResponsePtr&)>&& callback, std::string roleId);
    void impersonate(const HttpRequestPtr& req, std::function<void(const HttpResponsePtr&)>&& callback, std::string userId);
};

} // namespace shishapp
