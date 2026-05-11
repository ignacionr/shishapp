#pragma once
#include <drogon/HttpController.h>

using namespace drogon;

namespace viditacafe {

class AuthController : public drogon::HttpController<AuthController> {
public:
    METHOD_LIST_BEGIN
        ADD_METHOD_TO(AuthController::registerUser, "/api/v1/auth/register", Post);
        ADD_METHOD_TO(AuthController::login, "/api/v1/auth/login", Post);
        ADD_METHOD_TO(AuthController::googleLogin, "/api/v1/auth/google", Post);
        ADD_METHOD_TO(AuthController::me, "/api/v1/auth/me", Get);
        ADD_METHOD_TO(AuthController::updateProfile, "/api/v1/auth/profile", Put);
        ADD_METHOD_TO(AuthController::getContext, "/api/v1/auth/context", Get);
        ADD_METHOD_TO(AuthController::registerDevice, "/api/v1/auth/device", Post);
    METHOD_LIST_END

    void registerUser(const HttpRequestPtr& req, std::function<void(const HttpResponsePtr&)>&& callback);
    void login(const HttpRequestPtr& req, std::function<void(const HttpResponsePtr&)>&& callback);
    void googleLogin(const HttpRequestPtr& req, std::function<void(const HttpResponsePtr&)>&& callback);
    void me(const HttpRequestPtr& req, std::function<void(const HttpResponsePtr&)>&& callback);
    void updateProfile(const HttpRequestPtr& req, std::function<void(const HttpResponsePtr&)>&& callback);
    void getContext(const HttpRequestPtr& req, std::function<void(const HttpResponsePtr&)>&& callback);
    void registerDevice(const HttpRequestPtr& req, std::function<void(const HttpResponsePtr&)>&& callback);
};

} // namespace viditacafe
