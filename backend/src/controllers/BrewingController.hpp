#pragma once
#include <drogon/HttpController.h>

using namespace drogon;

namespace viditacafe {

class BrewingController : public drogon::HttpController<BrewingController> {
public:
    METHOD_LIST_BEGIN
        ADD_METHOD_TO(BrewingController::methods, "/api/v1/brewing/methods", Get);
        ADD_METHOD_TO(BrewingController::methods, "/api/v1/brewing/method", Get);
        ADD_METHOD_TO(BrewingController::methods, "/api/v1/methods", Get);
        ADD_METHOD_TO(BrewingController::methods, "/api/v1/method", Get);
        ADD_METHOD_TO(BrewingController::listPresets, "/api/v1/brewing/presets", Get);
        ADD_METHOD_TO(BrewingController::createPreset, "/api/v1/brewing/presets", Post);
        ADD_METHOD_TO(BrewingController::removePreset, "/api/v1/brewing/presets/{id}", Delete);
    METHOD_LIST_END

    void methods(const HttpRequestPtr& req, std::function<void(const HttpResponsePtr&)>&& callback);
    void listPresets(const HttpRequestPtr& req, std::function<void(const HttpResponsePtr&)>&& callback);
    void createPreset(const HttpRequestPtr& req, std::function<void(const HttpResponsePtr&)>&& callback);
    void removePreset(const HttpRequestPtr& req, std::function<void(const HttpResponsePtr&)>&& callback, std::string id);
};

} // namespace viditacafe
