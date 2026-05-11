#include "EquipmentController.hpp"
#include "models/models.hpp"
#include "services/AuthService.hpp"
#include "services/ContextService.hpp"
#include <drogon/HttpAppFramework.h>
#include <glaze/glaze.hpp>
#include <map>

namespace shishapp {

void EquipmentController::list(const HttpRequestPtr& req, std::function<void(const HttpResponsePtr&)>&& callback) {
    auto db = drogon::app().getDbClient();
    auto userId = AuthService::getUserIdFromRequest(req);
    auto lang = ContextService::getLanguage(req);
    
    db->execSqlAsync(
        "SELECT id, equipment_name, description, url, country_code, price FROM purchase_links",
        [db, callback, userId, lang](const drogon::orm::Result &linksResult) {
            std::map<std::string, std::vector<PurchaseLink>> linksByEquipment;
            for (auto const &row : linksResult) {
                PurchaseLink pl;
                pl.id = row["id"].as<std::string>();
                pl.equipmentName = row["equipment_name"].as<std::string>();
                pl.description = row["description"].as<std::string>();
                pl.url = row["url"].as<std::string>();
                pl.countryCode = row["country_code"].as<std::string>();
                pl.price = row["price"].as<double>();
                linksByEquipment[pl.equipmentName].push_back(pl);
            }

            std::string mainQuery = 
                "SELECT DISTINCT e.id, e.name as internal_name, e.slug, COALESCE(t.name, e.name) as name, e.category, "
                "COALESCE(t.description, e.description) as description, e.image_url";
            
            if (userId) {
                mainQuery += ", (ue.user_id IS NOT NULL) as is_owned FROM equipment e "
                            "LEFT JOIN equipment_translations t ON e.id = t.equipment_id AND t.language_code = $2 "
                            "LEFT JOIN user_equipment ue ON e.id = ue.equipment_id AND (ue.user_id::text = $1 OR ue.user_id IN (SELECT id FROM users WHERE google_id = $1))";
            } else {
                mainQuery += ", false as is_owned FROM equipment e "
                            "LEFT JOIN equipment_translations t ON e.id = t.equipment_id AND t.language_code = $1";
            }

            auto handler = [callback, linksByEquipment](const drogon::orm::Result &result) {
                std::vector<Equipment> equipment;
                for (auto const &row : result) {
                    Equipment e;
                    e.id = row["id"].as<std::string>();
                    e.name = row["name"].as<std::string>();
                    e.internal_name = row["internal_name"].as<std::string>();
                    e.slug = row["slug"].as<std::string>();
                    e.category = row["category"].as<std::string>();
                    e.description = row["description"].as<std::string>();
                    e.imageUrl = row["image_url"].as<std::string>();
                    e.isOwned = row["is_owned"].as<bool>();
                    
                    if (linksByEquipment.count(e.internal_name)) {
                        e.purchaseLinks = linksByEquipment.at(e.internal_name);
                    }
                    equipment.push_back(e);
                }
                
                std::string json = glz::write_json(equipment).value_or("[]");
                auto res = HttpResponse::newHttpResponse();
                res->setBody(json);
                res->setContentTypeCode(CT_APPLICATION_JSON);
                callback(res);
            };

            if (userId) {
                db->execSqlAsync(mainQuery, handler, [callback](const drogon::orm::DrogonDbException &e) {
                    auto res = HttpResponse::newHttpResponse(); res->setStatusCode(k500InternalServerError); callback(res);
                }, *userId, lang);
            } else {
                db->execSqlAsync(mainQuery, handler, [callback](const drogon::orm::DrogonDbException &e) {
                    auto res = HttpResponse::newHttpResponse(); res->setStatusCode(k500InternalServerError); callback(res);
                }, lang);
            }
        },
        [callback](const drogon::orm::DrogonDbException &e) {
            auto res = HttpResponse::newHttpResponse(); res->setStatusCode(k500InternalServerError); callback(res);
        }
    );
}

void EquipmentController::owned(const HttpRequestPtr& req, std::function<void(const HttpResponsePtr&)>&& callback) {
    auto userId = AuthService::getUserIdFromRequest(req);
    if (!userId) {
        auto res = HttpResponse::newHttpResponse(); res->setStatusCode(k401Unauthorized); callback(res);
        return;
    }

    auto db = drogon::app().getDbClient();
    db->execSqlAsync(
        "SELECT equipment_id FROM user_equipment WHERE user_id::text = $1 OR user_id IN (SELECT id FROM users WHERE google_id = $1)",
        [callback](const drogon::orm::Result &r) {
            std::vector<std::string> ownedIds;
            for (auto const &row : r) ownedIds.push_back(row["equipment_id"].as<std::string>());
            
            std::string json = glz::write_json(ownedIds).value_or("[]");
            auto res = HttpResponse::newHttpResponse();
            res->setBody(json);
            res->setContentTypeCode(CT_APPLICATION_JSON);
            res->addHeader("Cache-Control", "private, no-cache"); // Never cache private ownership
            callback(res);
        },
        [callback](const drogon::orm::DrogonDbException &e) {
            auto res = HttpResponse::newHttpResponse(); res->setStatusCode(k500InternalServerError); callback(res);
        },
        *userId
    );
}

void EquipmentController::toggle(const HttpRequestPtr& req, std::function<void(const HttpResponsePtr&)>&& callback, std::string id) {
    auto userId = AuthService::getUserIdFromRequest(req);
    if (!userId) {
        auto res = HttpResponse::newHttpResponse(); res->setStatusCode(k401Unauthorized); callback(res);
        return;
    }

    auto db = drogon::app().getDbClient();
    
    // Toggle relationship
    db->execSqlAsync(
        "SELECT 1 FROM user_equipment WHERE (user_id::text = $1 OR user_id IN (SELECT id FROM users WHERE google_id = $1)) AND equipment_id = $2",
        [db, callback, userId, id](const drogon::orm::Result &r) {
            std::string sql;
            if (r.size() > 0) {
                sql = "DELETE FROM user_equipment WHERE (user_id::text = $1 OR user_id IN (SELECT id FROM users WHERE google_id = $1)) AND equipment_id = $2";
            } else {
                sql = "INSERT INTO user_equipment (user_id, equipment_id) VALUES ((SELECT id FROM users WHERE google_id = $1 OR id::text = $1 LIMIT 1), $2)";
            }
            
            db->execSqlAsync(sql, [callback](const drogon::orm::Result &r) {
                auto res = HttpResponse::newHttpResponse(); res->setStatusCode(k200OK); callback(res);
            }, [callback](const drogon::orm::DrogonDbException &e) {
                auto res = HttpResponse::newHttpResponse(); res->setStatusCode(k500InternalServerError); callback(res);
            }, *userId, id);
        },
        [callback](const drogon::orm::DrogonDbException &e) {
            auto res = HttpResponse::newHttpResponse(); res->setStatusCode(k500InternalServerError); callback(res);
        },
        *userId, id
    );
}

} // namespace shishapp
