#include "CatalogService.hpp"

namespace shishapp {

void CatalogService::listVideos(const std::string& lang,
                               std::function<void(std::vector<Video>)>&& successCallback,
                               std::function<void(const drogon::orm::DrogonDbException&)>&& errorCallback) {
    auto db = drogon::app().getDbClient();
    std::string sql = "SELECT id::text, slug, title, COALESCE(description, '') as description, language_code FROM videos";
    bool hasLang = !lang.empty();
    if (hasLang) {
        sql += " WHERE language_code = $1";
    }
    sql += " ORDER BY created_at DESC";

    auto onResult = [successCallback = std::move(successCallback)](const drogon::orm::Result &r) {
        std::vector<Video> videos;
        for (auto const &row : r) {
            Video v;
            v.id = row["id"].as<std::string>();
            v.slug = row["slug"].as<std::string>();
            v.title = row["title"].as<std::string>();
            v.description = row["description"].as<std::string>();
            v.language_code = row["language_code"].as<std::string>();
            videos.push_back(v);
        }
        successCallback(videos);
    };

    if (hasLang) {
        db->execSqlAsync(sql, onResult, std::move(errorCallback), lang);
    } else {
        db->execSqlAsync(sql, onResult, std::move(errorCallback));
    }
}

void CatalogService::createVideo(const Video& v,
                                std::function<void(std::string id)>&& successCallback,
                                std::function<void(const drogon::orm::DrogonDbException&)>&& errorCallback) {
    auto db = drogon::app().getDbClient();
    db->execSqlAsync(
        "INSERT INTO videos (slug, title, description, language_code) VALUES ($1, $2, $3, $4) RETURNING id::text",
        [successCallback = std::move(successCallback)](const drogon::orm::Result &r) {
            if (r.size() > 0) {
                successCallback(r[0]["id"].as<std::string>());
            } else {
                successCallback("");
            }
        },
        std::move(errorCallback),
        v.slug, v.title, v.description, v.language_code
    );
}

void CatalogService::updateVideo(const std::string& id, const Video& v,
                                std::function<void()>&& successCallback,
                                std::function<void(const drogon::orm::DrogonDbException&)>&& errorCallback) {
    auto db = drogon::app().getDbClient();
    db->execSqlAsync(
        "UPDATE videos SET slug = $1, title = $2, description = $3, language_code = $4 WHERE id = $5",
        [successCallback = std::move(successCallback)](const drogon::orm::Result &r) {
            successCallback();
        },
        std::move(errorCallback),
        v.slug, v.title, v.description, v.language_code, id
    );
}

void CatalogService::removeVideo(const std::string& id,
                                std::function<void()>&& successCallback,
                                std::function<void(const drogon::orm::DrogonDbException&)>&& errorCallback) {
    auto db = drogon::app().getDbClient();
    db->execSqlAsync(
        "DELETE FROM videos WHERE id = $1",
        [successCallback = std::move(successCallback)](const drogon::orm::Result &r) {
            successCallback();
        },
        std::move(errorCallback),
        id
    );
}

void CatalogService::listLinks(std::function<void(std::vector<PurchaseLink>)>&& successCallback,
                              std::function<void(const drogon::orm::DrogonDbException&)>&& errorCallback) {
    auto db = drogon::app().getDbClient();
    db->execSqlAsync(
        "SELECT id::text, equipment_name, description, url, country_code, price FROM purchase_links ORDER BY equipment_name ASC, country_code ASC",
        [successCallback = std::move(successCallback)](const drogon::orm::Result &r) {
            std::vector<PurchaseLink> links;
            for (auto const &row : r) {
                PurchaseLink pl;
                pl.id = row["id"].as<std::string>();
                pl.equipmentName = row["equipment_name"].as<std::string>();
                pl.description = row["description"].as<std::string>();
                pl.url = row["url"].as<std::string>();
                pl.countryCode = row["country_code"].as<std::string>();
                pl.price = row["price"].as<double>();
                links.push_back(pl);
            }
            successCallback(links);
        },
        std::move(errorCallback)
    );
}

void CatalogService::createLink(const PurchaseLink& pl,
                               std::function<void(std::string id)>&& successCallback,
                               std::function<void(const drogon::orm::DrogonDbException&)>&& errorCallback) {
    auto db = drogon::app().getDbClient();
    db->execSqlAsync(
        "INSERT INTO purchase_links (equipment_name, description, url, country_code, price) VALUES ($1, $2, $3, $4, $5) RETURNING id::text",
        [successCallback = std::move(successCallback)](const drogon::orm::Result &r) {
            if (r.size() > 0) successCallback(r[0]["id"].as<std::string>());
            else successCallback("");
        },
        std::move(errorCallback),
        pl.equipmentName, pl.description, pl.url, pl.countryCode, pl.price
    );
}

void CatalogService::updateLink(const std::string& id, const PurchaseLink& pl,
                               std::function<void()>&& successCallback,
                               std::function<void(const drogon::orm::DrogonDbException&)>&& errorCallback) {
    auto db = drogon::app().getDbClient();
    db->execSqlAsync(
        "UPDATE purchase_links SET equipment_name = $1, description = $2, url = $3, country_code = $4, price = $5 WHERE id = $6",
        [successCallback = std::move(successCallback)](const drogon::orm::Result &r) {
            successCallback();
        },
        std::move(errorCallback),
        pl.equipmentName, pl.description, pl.url, pl.countryCode, pl.price, id
    );
}

void CatalogService::removeLink(const std::string& id,
                               std::function<void()>&& successCallback,
                               std::function<void(const drogon::orm::DrogonDbException&)>&& errorCallback) {
    auto db = drogon::app().getDbClient();
    db->execSqlAsync(
        "DELETE FROM purchase_links WHERE id = $1",
        [successCallback = std::move(successCallback)](const drogon::orm::Result &r) {
            successCallback();
        },
        std::move(errorCallback),
        id
    );
}

void CatalogService::getLinkCountryCode(const std::string& id,
                                       std::function<void(std::string countryCode)>&& successCallback,
                                       std::function<void(const drogon::orm::DrogonDbException&)>&& errorCallback) {
    auto db = drogon::app().getDbClient();
    db->execSqlAsync(
        "SELECT country_code FROM purchase_links WHERE id = $1",
        [successCallback = std::move(successCallback)](const drogon::orm::Result &r) {
            if (r.size() > 0) successCallback(r[0]["country_code"].as<std::string>());
            else successCallback("");
        },
        std::move(errorCallback),
        id
    );
}

void CatalogService::listEquipment(std::function<void(std::vector<Equipment>)>&& successCallback,
                                  std::function<void(const drogon::orm::DrogonDbException&)>&& errorCallback) {
    auto db = drogon::app().getDbClient();
    db->execSqlAsync(
        "SELECT e.id::text, e.name as internal_name, e.slug, e.category, e.description, e.image_url, "
        "t.language_code, t.name as trans_name, t.description as trans_desc "
        "FROM equipment e LEFT JOIN equipment_translations t ON e.id = t.equipment_id "
        "ORDER BY e.category, e.name",
        [successCallback = std::move(successCallback)](const drogon::orm::Result &r) {
            std::map<std::string, Equipment> equipmentMap;
            for (auto const &row : r) {
                std::string id = row["id"].as<std::string>();
                if (equipmentMap.find(id) == equipmentMap.end()) {
                    Equipment e;
                    e.id = id;
                    e.internal_name = row["internal_name"].as<std::string>();
                    e.name = e.internal_name;
                    e.slug = row["slug"].as<std::string>();
                    e.category = row["category"].as<std::string>();
                    e.description = row["description"].as<std::string>();
                    e.imageUrl = row["image_url"].as<std::string>();
                    equipmentMap[id] = e;
                }

                if (!row["language_code"].isNull()) {
                    TranslationEntry te;
                    te.name = row["trans_name"].as<std::string>();
                    te.description = row["trans_desc"].as<std::string>();
                    equipmentMap[id].translations[row["language_code"].as<std::string>()] = te;
                }
            }

            std::vector<Equipment> list;
            for (auto const &[id, e] : equipmentMap) list.push_back(e);
            successCallback(list);
        },
        std::move(errorCallback)
    );
}

void CatalogService::createEquipment(const Equipment& e,
                                    std::function<void(std::string id)>&& successCallback,
                                    std::function<void(const drogon::orm::DrogonDbException&)>&& errorCallback) {
    auto db = drogon::app().getDbClient();
    db->execSqlAsync(
        "INSERT INTO equipment (name, category, description, image_url, slug) VALUES ($1, $2, $3, $4, $5) RETURNING id::text",
        [db, successCallback = std::move(successCallback), e](const drogon::orm::Result &r) {
            if (r.size() == 0) {
                successCallback("");
                return;
            }
            std::string equipmentId = r[0]["id"].as<std::string>();

            for (auto const &[lang, trans] : e.translations) {
                db->execSqlAsync(
                    "INSERT INTO equipment_translations (equipment_id, language_code, name, description) VALUES ($1, $2, $3, $4)",
                    [](const drogon::orm::Result &r){},
                    [](const drogon::orm::DrogonDbException &e){},
                    equipmentId, lang, trans.name, trans.description
                );
            }

            for (auto const &link : e.purchaseLinks) {
                db->execSqlAsync(
                    "INSERT INTO purchase_links (equipment_name, description, url, country_code, price) VALUES ($1, $2, $3, $4, $5)",
                    [](const drogon::orm::Result &r){},
                    [](const drogon::orm::DrogonDbException &e){},
                    e.name, link.description, link.url, link.countryCode, link.price
                );
            }

            successCallback(equipmentId);
        },
        std::move(errorCallback),
        e.internal_name, e.category, e.description, e.imageUrl, e.slug
    );
}

void CatalogService::updateEquipment(const std::string& id, const Equipment& e,
                                    std::function<void()>&& successCallback,
                                    std::function<void(const drogon::orm::DrogonDbException&)>&& errorCallback) {
    auto db = drogon::app().getDbClient();
    db->execSqlAsync(
        "UPDATE equipment SET name = $1, category = $2, description = $3, image_url = $4, slug = $5 WHERE id = $6",
        [db, id, e, successCallback = std::move(successCallback)](const drogon::orm::Result &r) {
            // Delete old translations and links
            db->execSqlAsync("DELETE FROM equipment_translations WHERE equipment_id = $1", [](const drogon::orm::Result &r){}, [](const drogon::orm::DrogonDbException &e){}, id);
            
            // Re-insert translations
            for (auto const &[lang, trans] : e.translations) {
                db->execSqlAsync(
                    "INSERT INTO equipment_translations (equipment_id, language_code, name, description) VALUES ($1, $2, $3, $4)",
                    [](const drogon::orm::Result &r){},
                    [](const drogon::orm::DrogonDbException &e){},
                    id, lang, trans.name, trans.description
                );
            }

            successCallback();
        },
        std::move(errorCallback),
        e.internal_name, e.category, e.description, e.imageUrl, e.slug, id
    );
}

void CatalogService::removeEquipment(const std::string& id,
                                    std::function<void()>&& successCallback,
                                    std::function<void(const drogon::orm::DrogonDbException&)>&& errorCallback) {
    auto db = drogon::app().getDbClient();
    db->execSqlAsync(
        "DELETE FROM equipment WHERE id = $1",
        [successCallback = std::move(successCallback)](const drogon::orm::Result &r) {
            successCallback();
        },
        std::move(errorCallback),
        id
    );
}

} // namespace shishapp
