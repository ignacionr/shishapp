#pragma once
#include <drogon/HttpController.h>

using namespace drogon;

namespace shishapp {

class ShortLinkController : public drogon::HttpController<ShortLinkController> {
public:
    METHOD_LIST_BEGIN
        ADD_METHOD_TO(ShortLinkController::redirect, "/dl/{1}", Get);
    METHOD_LIST_END

    void redirect(const HttpRequestPtr& req, std::function<void(const HttpResponsePtr&)>&& callback, const std::string& code);
};

} // namespace shishapp
