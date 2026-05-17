#pragma once
#include <drogon/drogon.h>
#include <vector>
#include <string>
#include <functional>
#include "models/models.hpp"

namespace myshisha {

class UserService {
public:
    static void listUsers(const std::string& query,
                         std::function<void(std::vector<User>)>&& successCallback,
                         std::function<void(const drogon::orm::DrogonDbException&)>&& errorCallback);

    static void assignRole(const std::string& userId, const UserRole& role,
                          std::function<void(std::string roleId)>&& successCallback,
                          std::function<void(const drogon::orm::DrogonDbException&)>&& errorCallback);

    static void revokeRole(const std::string& roleId,
                          std::function<void()>&& successCallback,
                          std::function<void(const drogon::orm::DrogonDbException&)>&& errorCallback);

    static void getRoleInfo(const std::string& roleId,
                           std::function<void(std::string roleType, std::optional<std::string> targetId)>&& successCallback,
                           std::function<void(const drogon::orm::DrogonDbException&)>&& errorCallback);

    static void getUserForImpersonation(const std::string& userId,
                                       std::function<void(User user)>&& successCallback,
                                       std::function<void(const drogon::orm::DrogonDbException&)>&& errorCallback);
};

} // namespace myshisha
