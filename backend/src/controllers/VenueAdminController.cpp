#include "VenueAdminController.hpp"
#include <drogon/HttpAppFramework.h>
#include <glaze/glaze.hpp>
#include "models/models.hpp"
#include "services/AuthService.hpp"
#include "services/ContextService.hpp"
#include <sstream>
#include <map>

namespace shishapp {

void VenueAdminController::stats(const HttpRequestPtr& req, std::function<void(const HttpResponsePtr&)>&& callback, std::string venueId, std::string period) {
    AuthService::verifyRole(req, "VENUE", venueId, [callback, venueId, period](bool hasAccess) {
        if (!hasAccess) {
            auto res = HttpResponse::newHttpResponse();
            res->setStatusCode(k403Forbidden);
            callback(res);
            return;
        }

        auto db = drogon::app().getDbClient();
        
        std::string timeFilter;
        if (period == "week") timeFilter = "INTERVAL '7 days'";
        else if (period == "month") timeFilter = "INTERVAL '1 month'";
        else if (period == "year") timeFilter = "INTERVAL '1 year'";
        else timeFilter = "INTERVAL '7 days'";

        db->execSqlAsync(
            "SELECT count(*) as count, AVG(rating) as avg_rating FROM journal_entries WHERE venue_id = $1 AND to_timestamp(date / 1000.0) >= NOW() - " + timeFilter,
            [db, callback, venueId, timeFilter](const drogon::orm::Result &r1) {
                VenueStats stats;
                stats.checkins_count = r1[0]["count"].as<long long>();
                stats.average_rating = r1[0]["avg_rating"].isNull() ? 0.0 : r1[0]["avg_rating"].as<double>();

                // Tags cloud
                db->execSqlAsync(
                    "SELECT tags, rating FROM journal_entries WHERE venue_id = $1 AND to_timestamp(date / 1000.0) >= NOW() - " + timeFilter,
                    [db, callback, stats, venueId, timeFilter](const drogon::orm::Result &r2) mutable {
                        struct TagData { long long count = 0; double total_rating = 0; };
                        std::map<std::string, TagData> tagDataMap;
                        
                        for (auto const &row : r2) {
                            double rating = row["rating"].as<double>();
                            std::vector<std::string> tags = ContextService::parseTags(row["tags"].as<std::string>());
                            for (const auto& tag : tags) {
                                tagDataMap[tag].count++;
                                tagDataMap[tag].total_rating += rating;
                            }
                        }
                        for (auto const& [name, data] : tagDataMap) {
                            stats.tags_cloud.push_back({name, data.count, data.total_rating / data.count});
                        }
                        
                        // Check-ins over time
                        db->execSqlAsync(
                            "SELECT date_trunc('day', to_timestamp(date / 1000.0))::date as day, count(*) as count "
                            "FROM journal_entries WHERE venue_id = $1 AND to_timestamp(date / 1000.0) >= NOW() - " + timeFilter + " "
                            "GROUP BY day ORDER BY day ASC",
                            [db, callback, stats, venueId, timeFilter](const drogon::orm::Result &r3) mutable {
                                for (auto const &row : r3) {
                                    stats.checkins_over_time.push_back({row["day"].as<std::string>(), row["count"].as<long long>()});
                                }
                                
                                // Average Rating per Hour
                                db->execSqlAsync(
                                    "SELECT EXTRACT(HOUR FROM to_timestamp(date / 1000.0))::int as hour, AVG(rating) as avg_rating "
                                    "FROM journal_entries WHERE venue_id = $1 AND to_timestamp(date / 1000.0) >= NOW() - " + timeFilter + " "
                                    "GROUP BY hour ORDER BY hour ASC",
                                    [callback, stats](const drogon::orm::Result &r4) mutable {
                                        for (auto const &row : r4) {
                                            int hour = row["hour"].as<int>();
                                            std::string hourStr = (hour < 10 ? "0" : "") + std::to_string(hour) + ":00";
                                            stats.rating_over_time.push_back({hourStr, 0, row["avg_rating"].as<double>()});
                                        }

                                        std::string json = glz::write_json(stats).value_or("{}");
                                        auto res = HttpResponse::newHttpResponse();
                                        res->setBody(json);
                                        res->setContentTypeCode(CT_APPLICATION_JSON);
                                        callback(res);
                                    },
                                    [callback](const drogon::orm::DrogonDbException &e) {
                                        auto res = HttpResponse::newHttpResponse(); res->setStatusCode(k500InternalServerError); callback(res);
                                    },
                                    venueId
                                );
                            },
                            [callback](const drogon::orm::DrogonDbException &e) {
                                auto res = HttpResponse::newHttpResponse(); res->setStatusCode(k500InternalServerError); callback(res);
                            },
                            venueId
                        );
                    },
                    [callback](const drogon::orm::DrogonDbException &e) {
                        auto res = HttpResponse::newHttpResponse(); res->setStatusCode(k500InternalServerError); callback(res);
                    },
                    venueId
                );
            },
            [callback](const drogon::orm::DrogonDbException &e) {
                auto res = HttpResponse::newHttpResponse(); res->setStatusCode(k500InternalServerError); callback(res);
            },
            venueId
        );
    });
}

void VenueAdminController::listPromotions(const HttpRequestPtr& req, std::function<void(const HttpResponsePtr&)>&& callback, std::string venueId) {
    AuthService::verifyRole(req, "VENUE", venueId, [callback, venueId](bool hasAccess) {
        if (!hasAccess) {
            auto res = HttpResponse::newHttpResponse();
            res->setStatusCode(k403Forbidden);
            callback(res);
            return;
        }

        auto db = drogon::app().getDbClient();
        db->execSqlAsync(
            "SELECT id::text, venue_id::text, type, title, content, image_url, youtube_id, start_date, end_date "
            "FROM venue_promotions WHERE venue_id = $1 ORDER BY created_at DESC",
            [callback](const drogon::orm::Result &r) {
                std::vector<VenuePromotion> proms;
                for (auto const &row : r) {
                    VenuePromotion p;
                    p.id = row["id"].as<std::string>();
                    p.venue_id = row["venue_id"].as<std::string>();
                    p.type = row["type"].as<std::string>();
                    p.title = row["title"].as<std::string>();
                    p.content = row["content"].as<std::string>();
                    if (!row["image_url"].isNull()) p.image_url = row["image_url"].as<std::string>();
                    if (!row["youtube_id"].isNull()) p.youtube_id = row["youtube_id"].as<std::string>();
                    p.start_date = row["start_date"].as<std::string>();
                    if (!row["end_date"].isNull()) p.end_date = row["end_date"].as<std::string>();
                    proms.push_back(p);
                }
                std::string json = glz::write_json(proms).value_or("[]");
                auto res = HttpResponse::newHttpResponse();
                res->setBody(json);
                res->setContentTypeCode(CT_APPLICATION_JSON);
                callback(res);
            },
            [callback](const drogon::orm::DrogonDbException &e) {
                auto res = HttpResponse::newHttpResponse(); res->setStatusCode(k500InternalServerError); callback(res);
            },
            venueId
        );
    });
}

void VenueAdminController::createPromotion(const HttpRequestPtr& req, std::function<void(const HttpResponsePtr&)>&& callback) {
    VenuePromotion prom;
    try {
        auto err = glz::read_json(prom, req->getBody());
        if (err) {
            auto res = HttpResponse::newHttpResponse();
            res->setStatusCode(k400BadRequest);
            callback(res);
            return;
        }
    } catch (...) {
        auto res = HttpResponse::newHttpResponse();
        res->setStatusCode(k400BadRequest);
        callback(res);
        return;
    }

    AuthService::verifyRole(req, "VENUE", prom.venue_id, [prom, callback](bool hasAccess) {
        if (!hasAccess) {
            auto res = HttpResponse::newHttpResponse();
            res->setStatusCode(k403Forbidden);
            callback(res);
            return;
        }

        auto db = drogon::app().getDbClient();
        db->execSqlAsync(
            "INSERT INTO venue_promotions (venue_id, type, title, content, image_url, youtube_id, start_date, end_date) "
            "VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id::text",
            [callback](const drogon::orm::Result &r) {
                auto res = HttpResponse::newHttpResponse();
                res->setStatusCode(k201Created);
                res->setBody("{\"id\":\"" + r[0]["id"].as<std::string>() + "\"}");
                callback(res);
            },
            [callback](const drogon::orm::DrogonDbException &e) {
                auto res = HttpResponse::newHttpResponse(); res->setStatusCode(k500InternalServerError); callback(res);
            },
            prom.venue_id, prom.type, prom.title, prom.content, prom.image_url.value_or(""), prom.youtube_id.value_or(""), prom.start_date, prom.end_date.value_or("")
        );
    });
}

void VenueAdminController::removePromotion(const HttpRequestPtr& req, std::function<void(const HttpResponsePtr&)>&& callback, std::string id) {
    auto db = drogon::app().getDbClient();
    db->execSqlAsync(
        "SELECT venue_id::text FROM venue_promotions WHERE id = $1",
        [req, callback, db, id](const drogon::orm::Result &r) {
            if (r.empty()) {
                auto res = HttpResponse::newHttpResponse(); res->setStatusCode(k404NotFound); callback(res);
                return;
            }
            std::string venueId = r[0]["venue_id"].as<std::string>();
            AuthService::verifyRole(req, "VENUE", venueId, [callback, db, id](bool hasAccess) {
                if (!hasAccess) {
                    auto res = HttpResponse::newHttpResponse(); res->setStatusCode(k403Forbidden); callback(res);
                    return;
                }
                db->execSqlAsync(
                    "DELETE FROM venue_promotions WHERE id = $1",
                    [callback](const drogon::orm::Result &r) {
                        auto res = HttpResponse::newHttpResponse(); res->setStatusCode(k204NoContent); callback(res);
                    },
                    [callback](const drogon::orm::DrogonDbException &e) {
                        auto res = HttpResponse::newHttpResponse(); res->setStatusCode(k500InternalServerError); callback(res);
                    },
                    id
                );
            });
        },
        [callback](const drogon::orm::DrogonDbException &e) {
            auto res = HttpResponse::newHttpResponse(); res->setStatusCode(k500InternalServerError); callback(res);
        },
        id
    );
}

} // namespace shishapp
