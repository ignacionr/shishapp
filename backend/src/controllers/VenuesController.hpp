#pragma once
#include <drogon/HttpController.h>

using namespace drogon;

namespace myshisha {

class VenuesController : public drogon::HttpController<VenuesController> {
public:
    METHOD_LIST_BEGIN
        ADD_METHOD_TO(VenuesController::search, "/api/v1/venues/search", Get);
        ADD_METHOD_TO(VenuesController::get, "/api/v1/venues/{1}", Get);
    METHOD_LIST_END

    void search(const HttpRequestPtr& req, std::function<void(const HttpResponsePtr&)>&& callback);
    void get(const HttpRequestPtr& req, std::function<void(const HttpResponsePtr&)>&& callback, std::string id);
};

} // namespace myshisha
