#include "JournalController.hpp"
#include "models/models.hpp"
#include "services/AuthService.hpp"
#include "services/ContextService.hpp"
#include <glaze/glaze.hpp>
#include <drogon/orm/DbClient.h>
#include <sstream>

namespace viditacafe {

void JournalController::list(const HttpRequestPtr& req, std::function<void(const HttpResponsePtr&)>&& callback) {
    auto userId = AuthService::getUserIdFromRequest(req);
    if (!userId) {
        auto res = HttpResponse::newHttpResponse();
        res->setStatusCode(k401Unauthorized);
        callback(res);
        return;
    }

    auto dbClient = drogon::app().getDbClient();
    dbClient->execSqlAsync(
        "SELECT id, user_id, date, coffee_name, brewing_method, location, venue, location_type, venue_id, rating, tags FROM journal_entries WHERE user_id::text = $1 OR user_id IN (SELECT id FROM users WHERE google_id = $1) ORDER BY date DESC",
        [callback](const drogon::orm::Result &r) {
            std::vector<JournalEntry> entries;
            for (auto const &row : r) {
                JournalEntry entry;
                entry.id = row["id"].as<std::string>();
                entry.user_id = row["user_id"].as<std::string>();
                entry.date = row["date"].as<long long>();
                entry.coffee_name = row["coffee_name"].as<std::string>();
                entry.brewing_method = row["brewing_method"].isNull() ? std::nullopt : std::optional<std::string>(row["brewing_method"].as<std::string>());
                entry.location = row["location"].as<std::string>();
                entry.venue = row["venue"].isNull() ? "" : row["venue"].as<std::string>();
                entry.location_type = row["location_type"].isNull() ? "home" : row["location_type"].as<std::string>();
                entry.venue_id = row["venue_id"].isNull() ? "" : row["venue_id"].as<std::string>();
                entry.rating = row["rating"].as<double>();
                
                // Parse tags
                entry.tags = ContextService::parseTags(row["tags"].as<std::string>());
                
                entries.push_back(entry);
            }
            
            std::string json = glz::write_json(entries).value_or("[]");
            auto res = HttpResponse::newHttpResponse();
            res->setBody(json);
            res->setContentTypeCode(CT_APPLICATION_JSON);
            callback(res);
        },
        [callback](const drogon::orm::DrogonDbException &e) {
            auto res = HttpResponse::newHttpResponse();
            res->setStatusCode(k500InternalServerError);
            res->setBody(e.base().what());
            callback(res);
        },
        *userId
    );
}

void JournalController::create(const HttpRequestPtr& req, std::function<void(const HttpResponsePtr&)>&& callback) {
    auto userId = AuthService::getUserIdFromRequest(req);
    
    JournalEntry entry;
    // Use permissive reading to ignore extra fields (like is_synced)
    auto ec = glz::read<glz::opts{.error_on_unknown_keys = false}>(entry, req->getBody());
    
    if (bool(ec)) {
        auto res = HttpResponse::newHttpResponse();
        res->setStatusCode(k400BadRequest);
        res->setBody("JSON Parse Error: " + glz::format_error(ec, req->getBody()));
        callback(res);
        return;
    }

    std::optional<std::string> venueId;
    if (entry.venue_id && !entry.venue_id->empty()) venueId = *entry.venue_id;

    // Anonymous check-ins are allowed only if a venue_id is provided
    if (!userId && !venueId) {
        auto res = HttpResponse::newHttpResponse();
        res->setStatusCode(k401Unauthorized);
        res->setBody("Authentication required for non-venue entries");
        callback(res);
        return;
    }

    // Convert tags to comma-separated string
    std::string tagsStr = "";
    for (size_t i = 0; i < entry.tags.size(); ++i) {
        tagsStr += entry.tags[i];
        if (i < entry.tags.size() - 1) tagsStr += ",";
    }

    auto dbClient = drogon::app().getDbClient();
    
    std::string userIdValue = userId.value_or("");

    dbClient->execSqlAsync(
        "INSERT INTO journal_entries (user_id, date, coffee_name, brewing_method, location, venue, location_type, venue_id, rating, tags) "
        "VALUES ((SELECT id FROM users WHERE google_id = $1 OR id::text = $1 LIMIT 1), $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id",
        [callback, entry](const drogon::orm::Result &r) {
            auto res = HttpResponse::newHttpResponse();
            if (r.size() > 0) {
                res->setStatusCode(k201Created);
                res->setBody("{\"id\": \"" + r[0]["id"].as<std::string>() + "\"}");
            } else {
                res->setStatusCode(k500InternalServerError);
            }
            res->setContentTypeCode(CT_APPLICATION_JSON);
            callback(res);
        },
        [callback](const drogon::orm::DrogonDbException &e) {
            auto res = HttpResponse::newHttpResponse();
            res->setStatusCode(k500InternalServerError);
            res->setBody(e.base().what());
            callback(res);
        },
        userIdValue, entry.date, entry.coffee_name, entry.brewing_method, entry.location, entry.venue, 
        entry.location_type.value_or("home"),
        venueId,
        entry.rating, tagsStr
    );
}

void JournalController::get(const HttpRequestPtr& req, std::function<void(const HttpResponsePtr&)>&& callback, std::string id) {
    auto userId = AuthService::getUserIdFromRequest(req);
    if (!userId) {
        auto res = HttpResponse::newHttpResponse(); res->setStatusCode(k401Unauthorized); callback(res);
        return;
    }

    auto dbClient = drogon::app().getDbClient();
    dbClient->execSqlAsync(
        "SELECT id, user_id, date, coffee_name, brewing_method, location, venue, location_type, venue_id, rating, tags FROM journal_entries WHERE id = $1 AND (user_id::text = $2 OR user_id IN (SELECT id FROM users WHERE google_id = $2))",
        [callback](const drogon::orm::Result &r) {
            if (r.size() == 0) {
                auto res = HttpResponse::newHttpResponse(); res->setStatusCode(k404NotFound); callback(res);
                return;
            }
            auto const &row = r[0];
            JournalEntry entry;
            entry.id = row["id"].as<std::string>();
            entry.user_id = row["user_id"].as<std::string>();
            entry.date = row["date"].as<long long>();
            entry.coffee_name = row["coffee_name"].as<std::string>();
            entry.brewing_method = row["brewing_method"].isNull() ? std::nullopt : std::optional<std::string>(row["brewing_method"].as<std::string>());
            entry.location = row["location"].as<std::string>();
            entry.venue = row["venue"].isNull() ? "" : row["venue"].as<std::string>();
            entry.location_type = row["location_type"].isNull() ? "home" : row["location_type"].as<std::string>();
            entry.venue_id = row["venue_id"].isNull() ? "" : row["venue_id"].as<std::string>();
            entry.rating = row["rating"].as<double>();
            
            entry.tags = ContextService::parseTags(row["tags"].as<std::string>());
            
            std::string json = glz::write_json(entry).value_or("{}");
            auto res = HttpResponse::newHttpResponse();
            res->setBody(json);
            res->setContentTypeCode(CT_APPLICATION_JSON);
            callback(res);
        },
        [callback](const drogon::orm::DrogonDbException &e) {
            auto res = HttpResponse::newHttpResponse(); res->setStatusCode(k500InternalServerError); callback(res);
        },
        id, *userId
    );
}

void JournalController::update(const HttpRequestPtr& req, std::function<void(const HttpResponsePtr&)>&& callback, std::string id) {
    auto userId = AuthService::getUserIdFromRequest(req);
    if (!userId) {
        auto res = HttpResponse::newHttpResponse(); res->setStatusCode(k401Unauthorized); callback(res);
        return;
    }

    JournalEntry entry;
    auto ec = glz::read<glz::opts{.error_on_unknown_keys = false}>(entry, req->getBody());
    if (bool(ec)) {
        auto res = HttpResponse::newHttpResponse(); res->setStatusCode(k400BadRequest); callback(res);
        return;
    }

    std::string tagsStr = "";
    for (size_t i = 0; i < entry.tags.size(); ++i) {
        tagsStr += entry.tags[i];
        if (i < entry.tags.size() - 1) tagsStr += ",";
    }

    auto dbClient = drogon::app().getDbClient();
    std::optional<std::string> venueId;
    if (entry.venue_id && !entry.venue_id->empty()) venueId = *entry.venue_id;

    dbClient->execSqlAsync(
        "UPDATE journal_entries SET user_id = (SELECT id FROM users WHERE google_id = $10 OR id::text = $10 LIMIT 1), coffee_name = $1, brewing_method = $2, location = $3, venue = $4, location_type = $5, venue_id = $6, rating = $7, tags = $8 "
        "WHERE id = $9 AND (user_id IS NULL OR user_id::text = $10 OR user_id IN (SELECT id FROM users WHERE google_id = $10))",
        [callback](const drogon::orm::Result &r) {
            auto res = HttpResponse::newHttpResponse();
            res->setStatusCode(k200OK);
            callback(res);
        },
        [callback](const drogon::orm::DrogonDbException &e) {
            auto res = HttpResponse::newHttpResponse(); res->setStatusCode(k500InternalServerError); callback(res);
        },
        entry.coffee_name, entry.brewing_method, entry.location, entry.venue, 
        entry.location_type.value_or("home"),
        venueId,
        entry.rating, tagsStr, id, *userId
    );
}

void JournalController::remove(const HttpRequestPtr& req, std::function<void(const HttpResponsePtr&)>&& callback, std::string id) {
    auto userId = AuthService::getUserIdFromRequest(req);
    if (!userId) {
        auto res = HttpResponse::newHttpResponse(); res->setStatusCode(k401Unauthorized); callback(res);
        return;
    }

    auto dbClient = drogon::app().getDbClient();
    dbClient->execSqlAsync(
        "DELETE FROM journal_entries WHERE id = $1 AND (user_id IS NULL OR user_id::text = $2 OR user_id IN (SELECT id FROM users WHERE google_id = $2))",
        [callback](const drogon::orm::Result &r) {
            auto res = HttpResponse::newHttpResponse();
            res->setStatusCode(k204NoContent);
            callback(res);
        },
        [callback](const drogon::orm::DrogonDbException &e) {
            auto res = HttpResponse::newHttpResponse(); res->setStatusCode(k500InternalServerError); callback(res);
        },
        id, *userId
    );
}

void JournalController::getTags(const HttpRequestPtr& req, std::function<void(const HttpResponsePtr&)>&& callback) {
    std::string lang = req->getParameter("lang");
    if (lang.empty()) {
        std::string acceptLang = req->getHeader("accept-language");
        if (acceptLang.length() >= 2) lang = acceptLang.substr(0, 2);
        else lang = "en";
    }

    std::string venueId = req->getParameter("venue_id");
    std::string country = req->getParameter("country");

    auto db = drogon::app().getDbClient();
    
    // Logic:
    // 1. If venue_id is provided and has tags in venue_tags, return those.
    // 2. If country is provided and has tags in country_tags, return those.
    // 3. Otherwise return all active tags.
    
    std::string sql = 
        "WITH selected_tags AS ("
        "  SELECT tag_id, display_order FROM venue_tags WHERE venue_id::text = $2 "
        "  UNION ALL "
        "  SELECT tag_id, display_order FROM country_tags "
        "  WHERE country_code = $3 AND NOT EXISTS (SELECT 1 FROM venue_tags WHERE venue_id::text = $2) "
        "  UNION ALL "
        "  SELECT id as tag_id, display_order FROM tags "
        "  WHERE is_active = true "
        "  AND NOT EXISTS (SELECT 1 FROM venue_tags WHERE venue_id::text = $2) "
        "  AND NOT EXISTS (SELECT 1 FROM country_tags WHERE country_code = $3)"
        ") "
        "SELECT "
        "  c.id::text as cat_id, c.name as cat_name, "
        "  COALESCE(ct.display_name, ct_en.display_name, c.name) as cat_display_name, "
        "  c.display_order as cat_order, "
        "  t.id::text as tag_id, t.name as tag_name, "
        "  COALESCE(tt.display_name, tt_en.display_name, t.name) as tag_display_name, "
        "  st.display_order as tag_order "
        "FROM tag_categories c "
        "JOIN tags t ON c.id = t.category_id "
        "JOIN selected_tags st ON t.id = st.tag_id "
        "LEFT JOIN tag_category_translations ct ON c.id = ct.category_id AND ct.language_code = $1 "
        "LEFT JOIN tag_category_translations ct_en ON c.id = ct_en.category_id AND ct_en.language_code = 'en' "
        "LEFT JOIN tag_translations tt ON t.id = tt.tag_id AND tt.language_code = $1 "
        "LEFT JOIN tag_translations tt_en ON t.id = tt_en.tag_id AND tt_en.language_code = 'en' "
        "ORDER BY c.display_order ASC, st.display_order ASC";

    db->execSqlAsync(
        sql,
        [callback](const drogon::orm::Result &r) {
            std::vector<TagCategory> categories;
            std::string lastCatId;

            for (auto const &row : r) {
                std::string catId = row["cat_id"].as<std::string>();
                if (catId != lastCatId) {
                    TagCategory cat;
                    cat.id = catId;
                    cat.name = row["cat_name"].as<std::string>();
                    cat.display_name = row["cat_display_name"].as<std::string>();
                    cat.display_order = row["cat_order"].as<int>();
                    categories.push_back(cat);
                    lastCatId = catId;
                }
                
                Tag tag;
                tag.id = row["tag_id"].as<std::string>();
                tag.name = row["tag_name"].as<std::string>();
                tag.display_name = row["tag_display_name"].as<std::string>();
                tag.display_order = row["tag_order"].as<int>();
                categories.back().tags.push_back(tag);
            }

            std::string json = glz::write_json(categories).value_or("[]");
            auto res = HttpResponse::newHttpResponse();
            res->setBody(json);
            res->setContentTypeCode(CT_APPLICATION_JSON);
            callback(res);
        },
        [callback](const drogon::orm::DrogonDbException &e) {
            auto res = HttpResponse::newHttpResponse();
            res->setStatusCode(k500InternalServerError);
            callback(res);
        },
        lang, venueId, country
    );
}

} // namespace viditacafe
