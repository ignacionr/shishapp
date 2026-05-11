#pragma once
#include <drogon/HttpController.h>
#include <string>
#include <optional>
#include <vector>
#include <functional>
#include "models/models.hpp"

namespace viditacafe {

class AuthService {
public:
    static std::optional<std::string> getUserIdFromRequest(const drogon::HttpRequestPtr& req);
    
    static void getUserRoles(const std::string& userId, std::function<void(std::vector<UserRole>)> callback);
    
    static void verifyRole(const drogon::HttpRequestPtr& req, 
                           const std::string& roleType, 
                           const std::optional<std::string>& targetId, 
                           std::function<void(bool)> callback);

    static void hasAdminAccess(const drogon::HttpRequestPtr& req,
                               std::function<void(bool)> callback);
};

} // namespace viditacafe
