#include "FeedController.hpp"
#include <drogon/HttpAppFramework.h>
#include <glaze/glaze.hpp>
#include "models/models.hpp"
#include "services/AuthService.hpp"
#include "services/ContextService.hpp"

namespace myshisha {

void FeedController::feed(const HttpRequestPtr& req, std::function<void(const HttpResponsePtr&)>&& callback) {
    auto db = drogon::app().getDbClient();
    auto lang = ContextService::getLanguage(req);
    auto userId = AuthService::getUserIdFromRequest(req);
    
    // 1. Fetch videos from DB filtered by language
    db->execSqlAsync(
        "SELECT id::text, slug, title, COALESCE(description, '') as description FROM videos WHERE language_code = $1 ORDER BY created_at DESC",
        [db, callback, userId, lang](const drogon::orm::Result &r1) {
            std::vector<FeedCard> feedList;
            
            for (auto const &row : r1) {
                FeedCard card;
                card.id = row["id"].as<std::string>();
                card.type = "video";
                card.title = row["title"].as<std::string>();
                card.content = row["description"].as<std::string>();
                card.metadata = row["slug"].as<std::string>(); // YouTube Slug
                feedList.push_back(card);
            }

            // 2. Fetch Venue Promotions if user is logged in
            if (userId) {
                db->execSqlAsync(
                    "SELECT DISTINCT p.id::text, p.type, p.title, p.content, p.image_url, p.youtube_id "
                    "FROM venue_promotions p "
                    "JOIN journal_entries j ON p.venue_id = j.venue_id "
                    "WHERE (j.user_id::text = $1 OR j.user_id IN (SELECT id FROM users WHERE google_id = $1)) "
                    "AND p.start_date <= NOW() AND (p.end_date IS NULL OR p.end_date >= NOW())",
                    [callback, feedList](const drogon::orm::Result &r2) mutable {
                        for (auto const &row : r2) {
                            FeedCard card;
                            card.id = row["id"].as<std::string>();
                            card.type = row["type"].as<std::string>();
                            card.title = row["title"].as<std::string>();
                            card.content = row["content"].as<std::string>();
                            if (!row["youtube_id"].isNull() && !row["youtube_id"].as<std::string>().empty()) {
                                card.metadata = row["youtube_id"].as<std::string>();
                            } else if (!row["image_url"].isNull()) {
                                card.metadata = row["image_url"].as<std::string>();
                            }
                            // Insert at the beginning or mix them? Let's put them at the top.
                            feedList.insert(feedList.begin(), card);
                        }

                        // Final Fallback
                        if (feedList.empty()) {
                            FeedCard welcome;
                            welcome.id = "welcome";
                            welcome.type = "insight";
                            welcome.title = "Welcome to Vidita Cafe";
                            welcome.content = "Start your journey by exploring brewing methods or equipment.";
                            feedList.push_back(welcome);
                        }

                        std::string json = glz::write_json(feedList).value_or("[]");
                        auto res = HttpResponse::newHttpResponse();
                        res->setBody(json);
                        res->setContentTypeCode(CT_APPLICATION_JSON);
                        callback(res);
                    },
                    [callback](const drogon::orm::DrogonDbException &e) {
                        auto res = HttpResponse::newHttpResponse(); res->setStatusCode(k500InternalServerError); callback(res);
                    },
                    *userId
                );
            } else {
                // Not logged in, just return videos
                if (feedList.empty()) {
                    FeedCard welcome;
                    welcome.id = "welcome";
                    welcome.type = "insight";
                    welcome.title = "Welcome to Vidita Cafe";
                    welcome.content = "Start your journey by exploring brewing methods or equipment.";
                    feedList.push_back(welcome);
                }
                std::string json = glz::write_json(feedList).value_or("[]");
                auto res = HttpResponse::newHttpResponse();
                res->setBody(json);
                res->setContentTypeCode(CT_APPLICATION_JSON);
                callback(res);
            }
        },
        [callback](const drogon::orm::DrogonDbException &e) {
            auto res = HttpResponse::newHttpResponse(); res->setStatusCode(k500InternalServerError); callback(res);
        },
        lang
    );
}

} // namespace myshisha
