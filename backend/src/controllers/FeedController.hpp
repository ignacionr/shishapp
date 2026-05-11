#pragma once
#include <drogon/HttpController.h>

using namespace drogon;

namespace viditacafe {

class FeedController : public drogon::HttpController<FeedController> {
public:
    METHOD_LIST_BEGIN
        ADD_METHOD_TO(FeedController::feed, "/api/v1/feed", Get);
    METHOD_LIST_END

    void feed(const HttpRequestPtr& req, std::function<void(const HttpResponsePtr&)>&& callback);
};

} // namespace viditacafe
