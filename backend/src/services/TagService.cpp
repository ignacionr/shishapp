#include "TagService.hpp"
#include <algorithm>

namespace shishapp {

void TagService::listAllTags(std::function<void(std::vector<FullTagCategory>)>&& successCallback,
                            std::function<void(const drogon::orm::DrogonDbException&)>&& errorCallback) {
    auto db = drogon::app().getDbClient();
    db->execSqlAsync(
        "SELECT id::text, name, display_order FROM tag_categories ORDER BY display_order ASC",
        [db, successCallback = std::move(successCallback)](const drogon::orm::Result &r1) {
            auto cats = std::make_shared<std::vector<FullTagCategory>>();
            for (auto const &row : r1) {
                FullTagCategory cat;
                cat.id = row["id"].as<std::string>();
                cat.name = row["name"].as<std::string>();
                cat.display_order = row["display_order"].as<int>();
                cats->push_back(cat);
            }

            db->execSqlAsync(
                "SELECT category_id::text, language_code, display_name FROM tag_category_translations",
                [db, cats, successCallback](const drogon::orm::Result &r2) {
                    for (auto const &row : r2) {
                        std::string catId = row["category_id"].as<std::string>();
                        for (auto &cat : *cats) {
                            if (cat.id == catId) {
                                cat.translations[row["language_code"].as<std::string>()] = row["display_name"].as<std::string>();
                                break;
                            }
                        }
                    }

                    db->execSqlAsync(
                        "SELECT id::text, category_id::text, name, display_order, is_active FROM tags ORDER BY display_order ASC",
                        [db, cats, successCallback](const drogon::orm::Result &r3) {
                            for (auto const &row : r3) {
                                FullTag tag;
                                tag.id = row["id"].as<std::string>();
                                tag.name = row["name"].as<std::string>();
                                tag.display_order = row["display_order"].as<int>();
                                tag.is_active = row["is_active"].as<bool>();
                                
                                std::string catId = row["category_id"].as<std::string>();
                                for (auto &cat : *cats) {
                                    if (cat.id == catId) {
                                        cat.tags.push_back(tag);
                                        break;
                                    }
                                }
                            }

                            db->execSqlAsync(
                                "SELECT tag_id::text, language_code, display_name FROM tag_translations",
                                [cats, successCallback](const drogon::orm::Result &r4) {
                                    for (auto const &row : r4) {
                                        std::string tagId = row["tag_id"].as<std::string>();
                                        for (auto &cat : *cats) {
                                            bool found = false;
                                            for (auto &tag : cat.tags) {
                                                if (tag.id == tagId) {
                                                    tag.translations[row["language_code"].as<std::string>()] = row["display_name"].as<std::string>();
                                                    found = true;
                                                    break;
                                                }
                                            }
                                            if (found) break;
                                        }
                                    }
                                    successCallback(*cats);
                                },
                                [](const drogon::orm::DrogonDbException &e) {} // Error handled by top level
                            );
                        },
                        [](const drogon::orm::DrogonDbException &e) {}
                    );
                },
                [](const drogon::orm::DrogonDbException &e) {}
            );
        },
        std::move(errorCallback)
    );
}

void TagService::createTag(const CreateTagRequest& req,
                          std::function<void(std::string tagId)>&& successCallback,
                          std::function<void(const drogon::orm::DrogonDbException&)>&& errorCallback) {
    auto db = drogon::app().getDbClient();
    db->execSqlAsync(
        "INSERT INTO tags (category_id, name, display_order) "
        "VALUES ($1, $2, (SELECT COALESCE(MAX(display_order), 0) + 1 FROM tags WHERE category_id = $1)) "
        "ON CONFLICT (category_id, name) DO UPDATE SET is_active = true "
        "RETURNING id::text",
        [db, successCallback = std::move(successCallback), req](const drogon::orm::Result &r) {
            if (r.size() == 0) {
                successCallback("");
                return;
            }
            std::string tagId = r[0]["id"].as<std::string>();

            db->execSqlAsync(
                "INSERT INTO tag_translations (tag_id, language_code, display_name) "
                "VALUES ($1, $2, $3) "
                "ON CONFLICT (tag_id, language_code) DO UPDATE SET display_name = EXCLUDED.display_name",
                [db, successCallback, tagId, req](const drogon::orm::Result &r2) {
                    if (req.venue_id) {
                        db->execSqlAsync(
                            "INSERT INTO venue_tags (venue_id, tag_id, display_order) "
                            "VALUES ($1, $2, (SELECT COALESCE(MAX(display_order), 0) + 1 FROM venue_tags WHERE venue_id = $1)) "
                            "ON CONFLICT DO NOTHING",
                            [successCallback, tagId](const drogon::orm::Result &r3) {
                                successCallback(tagId);
                            },
                            [](const drogon::orm::DrogonDbException &e) {},
                            *req.venue_id, tagId
                        );
                    } else {
                        successCallback(tagId);
                    }
                },
                [](const drogon::orm::DrogonDbException &e) {},
                tagId, req.language_code, req.display_name
            );
        },
        std::move(errorCallback),
        req.category_id, req.name
    );
}

void TagService::getContextTags(const std::vector<std::string>& allowedCountries, bool isGlobal,
                               const std::vector<UserRole>& myRoles,
                               std::function<void(glz::generic)>&& successCallback,
                               std::function<void(const drogon::orm::DrogonDbException&)>&& errorCallback) {
    auto db = drogon::app().getDbClient();
    
    std::string countrySql = "SELECT country_code, tag_id::text, display_order FROM country_tags ";
    if (!isGlobal) {
        countrySql += "WHERE country_code = ANY('{";
        for (size_t i = 0; i < allowedCountries.size(); ++i) {
            countrySql += allowedCountries[i];
            if (i < allowedCountries.size() - 1) countrySql += ",";
        }
        countrySql += "}')";
    }

    db->execSqlAsync(
        countrySql,
        [db, successCallback = std::move(successCallback), isGlobal, myRoles](const drogon::orm::Result &r1) {
            auto countryConfigs = std::make_shared<std::vector<CountryTagConfig>>();
            for (auto const &row : r1) {
                std::string code = row["country_code"].as<std::string>();
                auto it = std::find_if(countryConfigs->begin(), countryConfigs->end(), [&](auto const& c){ return c.country_code == code; });
                if (it == countryConfigs->end()) {
                    CountryTagConfig cfg;
                    cfg.country_code = code;
                    countryConfigs->push_back(cfg);
                    it = countryConfigs->end() - 1;
                }
                it->tags.push_back({row["tag_id"].as<std::string>(), row["display_order"].as<int>()});
            }

            std::string venueSql = "SELECT vt.venue_id::text, vt.tag_id::text, vt.display_order FROM venue_tags vt "
                                   "JOIN venues v ON vt.venue_id = v.id ";
            if (!isGlobal) {
                venueSql += "WHERE v.country_code = ANY('{";
                std::vector<std::string> managed;
                for (auto const& r : myRoles) if (r.role_type == "COUNTRY" && r.target_id) managed.push_back(*r.target_id);
                for (size_t i = 0; i < managed.size(); ++i) {
                    venueSql += managed[i];
                    if (i < managed.size() - 1) venueSql += ",";
                }
                venueSql += "}')";
            }

            db->execSqlAsync(
                venueSql,
                [successCallback, countryConfigs](const drogon::orm::Result &r2) {
                    std::vector<VenueTagConfig> venueConfigs;
                    for (auto const &row : r2) {
                        std::string vid = row["venue_id"].as<std::string>();
                        auto it = std::find_if(venueConfigs.begin(), venueConfigs.end(), [&](auto const& v){ return v.venue_id == vid; });
                        if (it == venueConfigs.end()) {
                            VenueTagConfig cfg;
                            cfg.venue_id = vid;
                            venueConfigs.push_back(cfg);
                            it = venueConfigs.end() - 1;
                        }
                        it->tags.push_back({row["tag_id"].as<std::string>(), row["display_order"].as<int>()});
                    }

                    glz::generic result;
                    result["countries"] = *countryConfigs;
                    result["venues"] = venueConfigs;
                    successCallback(result);
                },
                [](const drogon::orm::DrogonDbException &e) {}
            );
        },
        std::move(errorCallback)
    );
}

void TagService::setCountryTags(const std::string& countryCode, const std::vector<ContextTagSelection>& tags,
                               std::function<void()>&& successCallback,
                               std::function<void(const drogon::orm::DrogonDbException&)>&& errorCallback) {
    auto db = drogon::app().getDbClient();
    db->execSqlAsync(
        "DELETE FROM country_tags WHERE country_code = $1",
        [db, successCallback = std::move(successCallback), countryCode, tags](const drogon::orm::Result &r) {
            if (tags.empty()) {
                successCallback();
                return;
            }

            auto remaining = std::make_shared<size_t>(tags.size());
            for (auto const& t : tags) {
                db->execSqlAsync(
                    "INSERT INTO country_tags (country_code, tag_id, display_order) VALUES ($1, $2, $3)",
                    [successCallback, remaining](const drogon::orm::Result &r) {
                        (*remaining)--;
                        if (*remaining == 0) {
                            successCallback();
                        }
                    },
                    [](const drogon::orm::DrogonDbException &e) {},
                    countryCode, t.tag_id, t.display_order
                );
            }
        },
        std::move(errorCallback),
        countryCode
    );
}

} // namespace shishapp
