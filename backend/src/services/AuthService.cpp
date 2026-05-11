#include "AuthService.hpp"
#include <drogon/drogon.h>

namespace viditacafe {

std::optional<std::string> AuthService::getUserIdFromRequest(const drogon::HttpRequestPtr& req) {
    std::string authHeader = req->getHeader("Authorization");
    if (authHeader.find("Bearer ") == 0) {
        std::string token = authHeader.substr(7);
        if (token.find("simulated_vidita_jwt_") == 0) {
            return token.substr(21);
        }
    }

    std::string customToken = req->getHeader("X-Vidita-Token");
    if (customToken.find("simulated_vidita_jwt_") == 0) {
        return customToken.substr(21);
    }

    return std::nullopt;
}

void AuthService::getUserRoles(const std::string& userId, std::function<void(std::vector<UserRole>)> callback) {
    auto db = drogon::app().getDbClient();
    db->execSqlAsync(
        "SELECT id::text, role_type, target_id FROM user_roles WHERE user_id = (SELECT id FROM users WHERE google_id = $1 OR id::text = $1 LIMIT 1)",
        [callback](const drogon::orm::Result &r) {
            std::vector<UserRole> roles;
            for (auto const &row : r) {
                UserRole role;
                role.id = row["id"].as<std::string>();
                role.role_type = row["role_type"].as<std::string>();
                if (!row["target_id"].isNull()) {
                    role.target_id = row["target_id"].as<std::string>();
                }
                roles.push_back(role);
            }
            callback(roles);
        },
        [callback](const drogon::orm::DrogonDbException &e) {
            callback({});
        },
        userId
    );
}

void AuthService::verifyRole(const drogon::HttpRequestPtr& req, 
                           const std::string& roleType, 
                           const std::optional<std::string>& targetId, 
                           std::function<void(bool)> callback) {
    auto userId = getUserIdFromRequest(req);
    if (!userId) {
        callback(false);
        return;
    }

    auto db = drogon::app().getDbClient();
    // A user has access if they are a GLOBAL admin, OR they have the specific role for the specific target
    std::string sql = "SELECT 1 FROM user_roles ur JOIN users u ON ur.user_id = u.id "
                      "WHERE (u.google_id = $1 OR u.id::text = $1) AND "
                      "(ur.role_type = 'GLOBAL' OR (ur.role_type = $2 AND (ur.target_id IS NULL OR ur.target_id = $3)))";
    
    db->execSqlAsync(
        sql,
        [callback](const drogon::orm::Result &r) {
            callback(r.size() > 0);
        },
        [callback](const drogon::orm::DrogonDbException &e) {
            callback(false);
        },
        *userId, roleType, targetId.value_or("")
    );
}

void AuthService::hasAdminAccess(const drogon::HttpRequestPtr& req,
                               std::function<void(bool)> callback) {
    auto userId = getUserIdFromRequest(req);
    if (!userId) {
        callback(false);
        return;
    }

    auto db = drogon::app().getDbClient();
    // Check if user has ANY role or is_admin (for legacy support)
    db->execSqlAsync(
        "SELECT 1 FROM users WHERE (google_id = $1 OR id::text = $1) AND is_admin = TRUE "
        "UNION "
        "SELECT 1 FROM user_roles ur JOIN users u ON ur.user_id = u.id "
        "WHERE (u.google_id = $1 OR u.id::text = $1)",
        [callback](const drogon::orm::Result &r) {
            callback(r.size() > 0);
        },
        [callback](const drogon::orm::DrogonDbException &e) {
            callback(false);
        },
        *userId
    );
}

} // namespace viditacafe
