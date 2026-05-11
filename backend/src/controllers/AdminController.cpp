#include "AdminController.hpp"
#include "models/models.hpp"
#include "services/AuthService.hpp"
#include "services/StorageService.hpp"
#include <drogon/HttpAppFramework.h>
#include <glaze/glaze.hpp>
#include <memory>
#include <map>
#include <set>
#include <algorithm>

namespace viditacafe {

void AdminController::stats(const HttpRequestPtr& req, std::function<void(const HttpResponsePtr&)>&& callback) {
    auto userId = AuthService::getUserIdFromRequest(req);
    if (!userId) {
        auto res = HttpResponse::newHttpResponse(); res->setStatusCode(k401Unauthorized); callback(res);
        return;
    }

    AuthService::getUserRoles(*userId, [userId, callback](std::vector<UserRole> roles) {
        bool isGlobal = false;
        std::set<std::string> allowedCountries;
        for (auto const& r : roles) {
            if (r.role_type == "GLOBAL") isGlobal = true;
            if (r.role_type == "COUNTRY" && r.target_id) allowedCountries.insert(*r.target_id);
        }

        if (!isGlobal && allowedCountries.empty()) {
            auto res = HttpResponse::newHttpResponse(); res->setStatusCode(k403Forbidden); callback(res);
            return;
        }

        auto db = drogon::app().getDbClient();
        auto stats = std::make_shared<AdminStats>();

        // Build filtering conditions
        std::string userFilter = "1=1";
        std::string journalFilter = "1=1";
        std::string presetFilter = "1=1";
        std::string testVenueExclude = "(venue_id IS NULL OR venue_id != '947d1853-c407-4b03-a855-c167979dc00d')";

        if (!isGlobal) {
            std::string countries;
            for (auto const& c : allowedCountries) {
                if (!countries.empty()) countries += ",";
                countries += "'" + c + "'";
            }
            userFilter = "country IN (" + countries + ")";
            presetFilter = "user_id IN (SELECT id FROM users WHERE country IN (" + countries + "))";
            journalFilter = "(venue_id IN (SELECT id FROM venues WHERE country_code IN (" + countries + ")) OR (venue_id IS NULL AND user_id IN (SELECT id FROM users WHERE country IN (" + countries + "))))";
        }
        
        journalFilter = "(" + journalFilter + " AND " + testVenueExclude + ")";

        db->execSqlAsync(
            "SELECT (SELECT count(*) FROM users WHERE " + userFilter + ") as users, "
            "(SELECT count(*) FROM journal_entries WHERE " + journalFilter + ") as journals, "
            "(SELECT count(*) FROM brewing_presets WHERE " + presetFilter + ") as presets",
            [db, callback, stats, userFilter, journalFilter, presetFilter](const drogon::orm::Result &r) {
                if (r.size() > 0) {
                    stats->total_users = r[0]["users"].as<long long>();
                    stats->total_journals = r[0]["journals"].as<long long>();
                    stats->total_presets = r[0]["presets"].as<long long>();
                }

                db->execSqlAsync(
                    "SELECT coffee_name, count(*) as count FROM journal_entries WHERE " + journalFilter + " GROUP BY coffee_name ORDER BY count DESC LIMIT 5",
                    [db, callback, stats, userFilter, journalFilter](const drogon::orm::Result &r) {
                        for (auto const &row : r) {
                            stats->popular_coffee.push_back({row["coffee_name"].as<std::string>(), row["count"].as<long long>()});
                        }

                        db->execSqlAsync(
                            "SELECT brewing_method, count(*) as count FROM journal_entries WHERE " + journalFilter + " GROUP BY brewing_method ORDER BY count DESC LIMIT 5",
                            [db, callback, stats, userFilter, journalFilter](const drogon::orm::Result &r) {
                                for (auto const &row : r) {
                                    std::string method = row["brewing_method"].isNull() ? "Unknown" : row["brewing_method"].as<std::string>();
                                    stats->popular_methods.push_back({method, row["count"].as<long long>()});
                                }

                                db->execSqlAsync(
                                    "SELECT country, count(*) as count FROM users WHERE " + userFilter + " GROUP BY country ORDER BY count DESC",
                                    [db, callback, stats, userFilter, journalFilter](const drogon::orm::Result &r) {
                                        for (auto const &row : r) {
                                            stats->users_by_country.push_back({row["country"].as<std::string>(), row["count"].as<long long>()});
                                        }

                                        db->execSqlAsync(
                                            "SELECT venue, count(*) as count FROM journal_entries WHERE " + journalFilter + " AND venue IS NOT NULL AND venue != '' GROUP BY venue ORDER BY count DESC LIMIT 5",
                                            [db, callback, stats, userFilter](const drogon::orm::Result &r) {
                                                for (auto const &row : r) {
                                                    stats->popular_venues.push_back({row["venue"].as<std::string>(), row["count"].as<long long>()});
                                                }

                                                db->execSqlAsync(
                                                    "SELECT id::text, name, email, country, created_at::text FROM users WHERE " + userFilter + " ORDER BY created_at DESC LIMIT 10",
                                                    [callback, stats](const drogon::orm::Result &r) {
                                                        for (auto const &row : r) {
                                                            UserBasic ub;
                                                            ub.id = row["id"].as<std::string>();
                                                            ub.name = row["name"].as<std::string>();
                                                            ub.email = row["email"].as<std::string>();
                                                            ub.country = row["country"].as<std::string>();
                                                            ub.created_at = row["created_at"].as<std::string>();
                                                            stats->recent_users.push_back(ub);
                                                        }

                                                        std::string json = glz::write_json(*stats).value_or("{}");
                                                        auto res = HttpResponse::newHttpResponse();
                                                        res->setBody(json);
                                                        res->setContentTypeCode(CT_APPLICATION_JSON);
                                                        callback(res);
                                                    },
                                                    [callback](const drogon::orm::DrogonDbException &e) {
                                                        auto res = HttpResponse::newHttpResponse(); res->setStatusCode(k500InternalServerError); callback(res);
                                                    }
                                                );
                                            },
                                            [callback](const drogon::orm::DrogonDbException &e) {
                                                auto res = HttpResponse::newHttpResponse(); res->setStatusCode(k500InternalServerError); callback(res);
                                            }
                                        );
                                    },
                                    [callback](const drogon::orm::DrogonDbException &e) {
                                        auto res = HttpResponse::newHttpResponse(); res->setStatusCode(k500InternalServerError); callback(res);
                                    }
                                );
                            },
                            [callback](const drogon::orm::DrogonDbException &e) {
                                auto res = HttpResponse::newHttpResponse(); res->setStatusCode(k500InternalServerError); callback(res);
                            }
                        );
                    },
                    [callback](const drogon::orm::DrogonDbException &e) {
                        auto res = HttpResponse::newHttpResponse(); res->setStatusCode(k500InternalServerError); callback(res);
                    }
                );
            },
            [callback](const drogon::orm::DrogonDbException &e) {
                auto res = HttpResponse::newHttpResponse(); res->setStatusCode(k500InternalServerError); callback(res);
            }
        );
    });
}

} // namespace viditacafe
