#include "BrewingController.hpp"
#include "models/models.hpp"
#include "services/AuthService.hpp"
#include "services/ContextService.hpp"
#include <drogon/HttpAppFramework.h>
#include <glaze/glaze.hpp>
#include <sstream>
#include <map>

namespace myshisha {

void BrewingController::methods(const HttpRequestPtr& req, std::function<void(const HttpResponsePtr&)>&& callback) {
    auto db = drogon::app().getDbClient();
    auto lang = ContextService::getLanguage(req);
    
    // 1. Fetch all steps with translations
    db->execSqlAsync(
        "SELECT s.id::text, s.method_id, s.order_index, s.duration, s.target_water, s.target_temp, "
        "COALESCE(t.instruction, '') as instruction FROM brewing_steps s "
        "LEFT JOIN brewing_step_translations t ON s.id = t.step_id AND t.language_code = $1 "
        "ORDER BY s.method_id, s.order_index",
        [db, callback, lang](const drogon::orm::Result &stepsResult) {
            std::map<std::string, std::vector<BrewingStep>> stepsByMethod;
            for (auto const &row : stepsResult) {
                BrewingStep s;
                s.id = row["id"].as<std::string>();
                s.order_index = row["order_index"].as<int>();
                s.duration = row["duration"].as<int>();
                if (!row["target_water"].isNull()) s.target_water = row["target_water"].as<double>();
                if (!row["target_temp"].isNull()) s.target_temp = row["target_temp"].as<double>();
                s.instruction = row["instruction"].as<std::string>();
                stepsByMethod[row["method_id"].as<std::string>()].push_back(s);
            }

            // 2. Fetch methods
            db->execSqlAsync(
                "SELECT m.id, COALESCE(t.display_name, m.display_name) as display_name, "
                "COALESCE(t.description, m.description) as description, "
                "m.required_equipment, m.optional_equipment, m.consumables FROM brewing_methods m "
                "LEFT JOIN brewing_method_translations t ON m.id = t.method_id AND t.language_code = $1",
                [callback, stepsByMethod](const drogon::orm::Result &result) {
                    std::vector<BrewingMethod> methods;
                    for (auto const &row : result) {
                        BrewingMethod m;
                        m.id = row["id"].as<std::string>();
                        m.displayName = row["display_name"].as<std::string>();
                        m.description = row["description"].as<std::string>();
                        
                        auto split = [](const std::string &s) {
                            std::vector<std::string> v;
                            std::stringstream ss(s);
                            std::string item;
                            while (std::getline(ss, item, ',')) {
                                item.erase(0, item.find_first_not_of(" "));
                                item.erase(item.find_last_not_of(" ") + 1);
                                if (!item.empty()) v.push_back(item);
                            }
                            return v;
                        };

                        m.requiredEquipment = split(row["required_equipment"].as<std::string>());
                        m.optionalEquipment = split(row["optional_equipment"].as<std::string>());
                        m.consumables = split(row["consumables"].isNull() ? "" : row["consumables"].as<std::string>());
                        
                        if (stepsByMethod.count(m.id)) {
                            m.steps = stepsByMethod.at(m.id);
                        }
                        
                        methods.push_back(m);
                    }
                    
                    std::string json = glz::write_json(methods).value_or("[]");
                    auto res = HttpResponse::newHttpResponse();
                    res->setBody(json);
                    res->setContentTypeCode(CT_APPLICATION_JSON);
                    callback(res);
                },
                [callback](const drogon::orm::DrogonDbException &e) {
                    auto res = HttpResponse::newHttpResponse(); res->setStatusCode(k500InternalServerError); callback(res);
                },
                lang
            );
        },
        [callback](const drogon::orm::DrogonDbException &e) {
            auto res = HttpResponse::newHttpResponse(); res->setStatusCode(k500InternalServerError); callback(res);
        },
        lang
    );
}

void BrewingController::listPresets(const HttpRequestPtr& req, std::function<void(const HttpResponsePtr&)>&& callback) {
    auto userId = AuthService::getUserIdFromRequest(req);
    if (!userId) {
        auto res = HttpResponse::newHttpResponse(); res->setStatusCode(k401Unauthorized); callback(res);
        return;
    }

    auto db = drogon::app().getDbClient();
    db->execSqlAsync(
        "SELECT id, name, method_id, coffee_dose, water_yield, ratio, temperature, grind_size FROM brewing_presets WHERE user_id::text = $1 OR user_id IN (SELECT id FROM users WHERE google_id = $1)",
        [callback](const drogon::orm::Result &r) {
            std::vector<BrewingPreset> presets;
            for (auto const &row : r) {
                BrewingPreset p;
                p.id = row["id"].as<std::string>();
                p.name = row["name"].as<std::string>();
                p.method_id = row["method_id"].as<std::string>();
                p.coffee_dose = row["coffee_dose"].as<double>();
                p.water_yield = row["water_yield"].as<double>();
                if (!row["ratio"].isNull()) p.ratio = row["ratio"].as<double>();
                p.temperature = row["temperature"].as<double>();
                p.grind_size = row["grind_size"].as<std::string>();
                presets.push_back(p);
            }
            std::string json = glz::write_json(presets).value_or("[]");
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
}

void BrewingController::createPreset(const HttpRequestPtr& req, std::function<void(const HttpResponsePtr&)>&& callback) {
    auto userId = AuthService::getUserIdFromRequest(req);
    if (!userId) {
        auto res = HttpResponse::newHttpResponse(); res->setStatusCode(k401Unauthorized); callback(res);
        return;
    }

    auto body = req->getBody();
    BrewingPreset p;
    auto ec = glz::read<glz::opts{.error_on_unknown_keys = false}>(p, body);
    if (bool(ec)) {
        auto res = HttpResponse::newHttpResponse(); 
        res->setStatusCode(k400BadRequest);
        res->setBody("JSON Parse Error: " + glz::format_error(ec, body));
        callback(res);
        return;
    }

    auto db = drogon::app().getDbClient();
    db->execSqlAsync(
        "INSERT INTO brewing_presets (user_id, name, method_id, coffee_dose, water_yield, ratio, temperature, grind_size) "
        "VALUES ((SELECT id FROM users WHERE google_id = $1 OR id::text = $1 LIMIT 1), $2, $3, $4, $5, $6, $7, $8) RETURNING id",
        [callback, p](const drogon::orm::Result &r) {
            auto res = HttpResponse::newHttpResponse();
            res->setStatusCode(k201Created);
            if (r.size() > 0) {
                auto id = r[0]["id"].as<std::string>();
                res->setBody("{\"id\":\"" + id + "\"}");
                res->setContentTypeCode(CT_APPLICATION_JSON);
            }
            callback(res);
        },
        [callback](const drogon::orm::DrogonDbException &e) {
            auto res = HttpResponse::newHttpResponse(); res->setStatusCode(k500InternalServerError); callback(res);
        },
        *userId, p.name, p.method_id, p.coffee_dose, p.water_yield, p.ratio.value_or(p.water_yield / (p.coffee_dose > 0 ? p.coffee_dose : 1)), p.temperature, p.grind_size
    );
}

void BrewingController::removePreset(const HttpRequestPtr& req, std::function<void(const HttpResponsePtr&)>&& callback, std::string id) {
    auto userId = AuthService::getUserIdFromRequest(req);
    if (!userId) {
        auto res = HttpResponse::newHttpResponse(); res->setStatusCode(k401Unauthorized); callback(res);
        return;
    }

    auto db = drogon::app().getDbClient();
    db->execSqlAsync(
        "DELETE FROM brewing_presets WHERE id = $1 AND (user_id::text = $2 OR user_id IN (SELECT id FROM users WHERE google_id = $2))",
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

} // namespace myshisha
