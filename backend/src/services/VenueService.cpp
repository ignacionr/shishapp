#include "VenueService.hpp"
#include <algorithm>

namespace shishapp {

void VenueService::listVenues(const std::vector<std::string>& allowedCountries, bool isGlobal,
                             std::function<void(std::vector<Venue>)>&& successCallback,
                             std::function<void(const drogon::orm::DrogonDbException&)>&& errorCallback) {
    auto db = drogon::app().getDbClient();
    std::string sql = "SELECT id::text, name, latitude, longitude, address, city, country_code, created_at::text FROM venues ";
    
    if (!isGlobal) {
        sql += "WHERE country_code = ANY('{";
        for (size_t i = 0; i < allowedCountries.size(); ++i) {
            sql += allowedCountries[i];
            if (i < allowedCountries.size() - 1) sql += ",";
        }
        sql += "}') ";
    }
    
    sql += "ORDER BY created_at DESC";

    db->execSqlAsync(sql, [successCallback = std::move(successCallback)](const drogon::orm::Result &r) {
        std::vector<Venue> venues;
        for (auto const &row : r) {
            Venue v;
            v.id = row["id"].as<std::string>();
            v.name = row["name"].as<std::string>();
            v.latitude = row["latitude"].as<double>();
            v.longitude = row["longitude"].as<double>();
            v.address = row["address"].as<std::string>();
            v.city = row["city"].as<std::string>();
            v.country_code = row["country_code"].as<std::string>();
            venues.push_back(v);
        }
        successCallback(venues);
    }, std::move(errorCallback));
}

void VenueService::createVenue(const Venue& v,
                              std::function<void(std::string id)>&& successCallback,
                              std::function<void(const drogon::orm::DrogonDbException&)>&& errorCallback) {
    auto db = drogon::app().getDbClient();
    db->execSqlAsync(
        "INSERT INTO venues (name, latitude, longitude, address, city, country_code) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id::text",
        [successCallback = std::move(successCallback)](const drogon::orm::Result &r) {
            if (r.size() > 0) successCallback(r[0]["id"].as<std::string>());
            else successCallback("");
        },
        std::move(errorCallback),
        v.name, v.latitude, v.longitude, v.address, v.city, v.country_code
    );
}

void VenueService::updateVenue(const std::string& id, const Venue& v,
                              std::function<void()>&& successCallback,
                              std::function<void(const drogon::orm::DrogonDbException&)>&& errorCallback) {
    auto db = drogon::app().getDbClient();
    db->execSqlAsync(
        "UPDATE venues SET name = $1, latitude = $2, longitude = $3, address = $4, city = $5, country_code = $6 WHERE id::text = $7",
        [successCallback = std::move(successCallback)](const drogon::orm::Result &r) {
            successCallback();
        },
        std::move(errorCallback),
        v.name, v.latitude, v.longitude, v.address, v.city, v.country_code, id
    );
}

void VenueService::removeVenue(const std::string& id,
                              std::function<void()>&& successCallback,
                              std::function<void(const drogon::orm::DrogonDbException&)>&& errorCallback) {
    auto db = drogon::app().getDbClient();
    db->execSqlAsync(
        "DELETE FROM venues WHERE id::text = $1",
        [successCallback = std::move(successCallback)](const drogon::orm::Result &r) {
            successCallback();
        },
        std::move(errorCallback),
        id
    );
}

void VenueService::searchVenues(const std::string& q, const std::vector<std::string>& allowedCountries, bool isGlobal,
                               std::function<void(std::vector<Venue>)>&& successCallback,
                               std::function<void(const drogon::orm::DrogonDbException&)>&& errorCallback) {
    auto db = drogon::app().getDbClient();
    
    std::string countriesArray = "{";
    for (size_t i = 0; i < allowedCountries.size(); ++i) {
        countriesArray += "\"" + allowedCountries[i] + "\"";
        if (i < allowedCountries.size() - 1) countriesArray += ",";
    }
    countriesArray += "}";

    std::string sql = "SELECT id::text, name, latitude, longitude, address, city, country_code FROM venues ";
    std::vector<std::string> params;
    
    if (isGlobal) {
        if (!q.empty()) {
            sql += "WHERE name ILIKE $1 OR city ILIKE $1 OR address ILIKE $1 ";
            params.push_back("%" + q + "%");
        }
    } else {
        sql += "WHERE country_code = ANY($1) ";
        if (!q.empty()) {
            sql += "AND (name ILIKE $2 OR city ILIKE $2 OR address ILIKE $2) ";
            params.push_back("%" + q + "%");
        }
    }
    
    sql += "ORDER BY name ASC LIMIT 20";

    auto onResult = [successCallback = std::move(successCallback)](const drogon::orm::Result &r) {
        std::vector<Venue> venues;
        for (auto const &row : r) {
            Venue v;
            v.id = row["id"].as<std::string>();
            v.name = row["name"].as<std::string>();
            v.latitude = row["latitude"].as<double>();
            v.longitude = row["longitude"].as<double>();
            v.address = row["address"].as<std::string>();
            v.city = row["city"].as<std::string>();
            v.country_code = row["country_code"].as<std::string>();
            venues.push_back(v);
        }
        successCallback(venues);
    };

    if (isGlobal) {
        if (params.empty()) db->execSqlAsync(sql, onResult, std::move(errorCallback));
        else db->execSqlAsync(sql, onResult, std::move(errorCallback), params[0]);
    } else {
        if (params.empty()) db->execSqlAsync(sql, onResult, std::move(errorCallback), countriesArray);
        else db->execSqlAsync(sql, onResult, std::move(errorCallback), countriesArray, params[0]);
    }
}

void VenueService::getVenueTags(const std::string& venueId,
                               std::function<void(VenueTagConfig)>&& successCallback,
                               std::function<void(const drogon::orm::DrogonDbException&)>&& errorCallback) {
    auto db = drogon::app().getDbClient();
    std::string sql = 
        "WITH venue_info AS ("
        "    SELECT country_code FROM venues WHERE id::text = $1"
        "),"
        "venue_overrides AS ("
        "    SELECT tag_id, display_order, true as is_override FROM venue_tags WHERE venue_id::text = $1"
        "),"
        "inherited_tags AS ("
        "    SELECT tag_id, display_order, false as is_override "
        "    FROM country_tags ct "
        "    JOIN venue_info vi ON ct.country_code = vi.country_code "
        "    WHERE NOT EXISTS (SELECT 1 FROM venue_overrides) "
        "    UNION ALL "
        "    SELECT id as tag_id, display_order, false as is_override "
        "    FROM tags "
        "    WHERE is_active = true "
        "    AND NOT EXISTS (SELECT 1 FROM venue_overrides) "
        "    AND NOT EXISTS ( "
        "        SELECT 1 FROM country_tags ct  "
        "        JOIN venue_info vi ON ct.country_code = vi.country_code "
        "    ) "
        ") "
        "SELECT tag_id::text, display_order, is_override FROM venue_overrides "
        "UNION ALL "
        "SELECT tag_id::text, display_order, is_override FROM inherited_tags "
        "ORDER BY display_order ASC";

    db->execSqlAsync(
        sql,
        [successCallback = std::move(successCallback), venueId](const drogon::orm::Result &r) {
            VenueTagConfig cfg;
            cfg.venue_id = venueId;
            for (auto const &row : r) {
                bool isOverride = row["is_override"].as<bool>();
                if (isOverride) {
                    cfg.tags.push_back({row["tag_id"].as<std::string>(), row["display_order"].as<int>()});
                } else {
                    cfg.inherited_tags.push_back({row["tag_id"].as<std::string>(), row["display_order"].as<int>()});
                }
            }
            successCallback(cfg);
        },
        std::move(errorCallback),
        venueId
    );
}

void VenueService::setVenueTags(const std::string& venueId, const std::vector<ContextTagSelection>& tags,
                               std::function<void()>&& successCallback,
                               std::function<void(const drogon::orm::DrogonDbException&)>&& errorCallback) {
    auto db = drogon::app().getDbClient();
    db->execSqlAsync(
        "DELETE FROM venue_tags WHERE venue_id::text = $1",
        [db, successCallback = std::move(successCallback), venueId, tags](const drogon::orm::Result &r) {
            if (tags.empty()) {
                successCallback();
                return;
            }

            auto remaining = std::make_shared<size_t>(tags.size());
            for (auto const& t : tags) {
                db->execSqlAsync(
                    "INSERT INTO venue_tags (venue_id, tag_id, display_order) VALUES ($1, $2, $3)",
                    [successCallback, remaining](const drogon::orm::Result &r) {
                        (*remaining)--;
                        if (*remaining == 0) {
                            successCallback();
                        }
                    },
                    [](const drogon::orm::DrogonDbException &e) {},
                    venueId, t.tag_id, t.display_order
                );
            }
        },
        std::move(errorCallback),
        venueId
    );
}

} // namespace shishapp
