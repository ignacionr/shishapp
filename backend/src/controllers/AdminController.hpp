#pragma once
#include <drogon/HttpController.h>

using namespace drogon;

namespace myshisha {

class AdminController : public drogon::HttpController<AdminController> {
public:
    METHOD_LIST_BEGIN
        ADD_METHOD_TO(AdminController::stats, "/api/v1/admin/stats", Get);
    METHOD_LIST_END

    void stats(const HttpRequestPtr& req, std::function<void(const HttpResponsePtr&)>&& callback);
};

} // namespace myshisha
