#include "UserService.hpp"
#include <glaze/glaze.hpp>

namespace viditacafe {

void UserService::listUsers(const std::string& q,
                           std::function<void(std::vector<User>)>&& successCallback,
                           std::function<void(const drogon::orm::DrogonDbException&)>&& errorCallback) {
    auto db = drogon::app().getDbClient();
    std::string sql = "SELECT u.id::text, u.name, u.email, u.country, u.created_at::text, "
                      "json_agg(json_build_object('id', ur.id, 'role_type', ur.role_type, 'target_id', ur.target_id)) FILTER (WHERE ur.id IS NOT NULL) as roles "
                      "FROM users u LEFT JOIN user_roles ur ON u.id = ur.user_id ";
    
    std::vector<std::string> params;
    if (!q.empty()) {
        sql += "WHERE u.email ILIKE $1 OR u.name ILIKE $1 ";
        params.push_back("%" + q + "%");
    }
    
    sql += "GROUP BY u.id ORDER BY u.created_at DESC LIMIT 20";

    auto onResult = [successCallback = std::move(successCallback)](const drogon::orm::Result &r) {
        std::vector<User> users;
        for (auto const &row : r) {
            User u;
            u.id = row["id"].as<std::string>();
            u.name = row["name"].as<std::string>();
            u.email = row["email"].as<std::string>();
            u.country = row["country"].as<std::string>();
            u.created_at = row["created_at"].as<std::string>();
            
            if (!row["roles"].isNull()) {
                auto rolesJson = row["roles"].as<std::string>();
                auto err = glz::read_json(u.roles, rolesJson);
                if (bool(err)) {
                    LOG_ERROR << "Failed to parse roles JSON: " << glz::format_error(err, rolesJson);
                }
            }
            users.push_back(u);
        }
        successCallback(users);
    };

    if (params.empty()) db->execSqlAsync(sql, onResult, std::move(errorCallback));
    else db->execSqlAsync(sql, onResult, std::move(errorCallback), params[0]);
}

void UserService::assignRole(const std::string& userId, const UserRole& role,
                            std::function<void(std::string roleId)>&& successCallback,
                            std::function<void(const drogon::orm::DrogonDbException&)>&& errorCallback) {
    auto db = drogon::app().getDbClient();
    db->execSqlAsync(
        "INSERT INTO user_roles (user_id, role_type, target_id) VALUES ($1, $2, $3) "
        "ON CONFLICT (user_id, role_type, target_id) DO NOTHING RETURNING id::text",
        [successCallback = std::move(successCallback)](const drogon::orm::Result &r) {
            if (r.size() > 0) successCallback(r[0]["id"].as<std::string>());
            else successCallback("");
        },
        std::move(errorCallback),
        userId, role.role_type, role.target_id.value_or("")
    );
}

void UserService::revokeRole(const std::string& roleId,
                            std::function<void()>&& successCallback,
                            std::function<void(const drogon::orm::DrogonDbException&)>&& errorCallback) {
    auto db = drogon::app().getDbClient();
    db->execSqlAsync(
        "DELETE FROM user_roles WHERE id = $1",
        [successCallback = std::move(successCallback)](const drogon::orm::Result &r) {
            successCallback();
        },
        std::move(errorCallback),
        roleId
    );
}

void UserService::getRoleInfo(const std::string& roleId,
                             std::function<void(std::string roleType, std::optional<std::string> targetId)>&& successCallback,
                             std::function<void(const drogon::orm::DrogonDbException&)>&& errorCallback) {
    auto db = drogon::app().getDbClient();
    db->execSqlAsync(
        "SELECT role_type, target_id FROM user_roles WHERE id = $1",
        [successCallback = std::move(successCallback)](const drogon::orm::Result &r) {
            if (r.size() == 0) {
                successCallback("", std::nullopt);
                return;
            }
            std::optional<std::string> targetId;
            if (!r[0]["target_id"].isNull()) targetId = r[0]["target_id"].as<std::string>();
            successCallback(r[0]["role_type"].as<std::string>(), targetId);
        },
        std::move(errorCallback),
        roleId
    );
}

void UserService::getUserForImpersonation(const std::string& userId,
                                         std::function<void(User user)>&& successCallback,
                                         std::function<void(const drogon::orm::DrogonDbException&)>&& errorCallback) {
    auto db = drogon::app().getDbClient();
    db->execSqlAsync(
        "SELECT id::text, google_id, email, name, picture, country, language, is_admin FROM users WHERE id::text = $1 OR google_id = $1",
        [successCallback = std::move(successCallback), db](const drogon::orm::Result &r) {
            if (r.size() == 0) {
                successCallback(User{});
                return;
            }
            auto const &row = r[0];
            User u;
            u.id = row["google_id"].isNull() ? row["id"].as<std::string>() : row["google_id"].as<std::string>();
            u.google_id = row["google_id"].isNull() ? std::nullopt : std::optional<std::string>(row["google_id"].as<std::string>());
            u.email = row["email"].as<std::string>();
            u.name = row["name"].as<std::string>();
            if (!row["picture"].isNull()) u.picture = row["picture"].as<std::string>();
            u.country = row["country"].as<std::string>();
            u.language = row["language"].as<std::string>();
            u.is_admin = row["is_admin"].as<bool>();
            successCallback(u);
        },
        std::move(errorCallback),
        userId
    );
}

} // namespace viditacafe
