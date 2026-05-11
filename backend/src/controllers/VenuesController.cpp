#include "VenuesController.hpp"
#include "models/models.hpp"
#include "services/ContextService.hpp"
#include <glaze/glaze.hpp>
#include <drogon/orm/DbClient.h>
#include <sstream>
#include <cmath>
#include <string>

namespace shishapp {

void VenuesController::search(const HttpRequestPtr& req, std::function<void(const HttpResponsePtr&)>&& callback) {
    auto latStr = req->getParameter("lat");
    auto lonStr = req->getParameter("lon");

    if (latStr.empty() || lonStr.empty()) {
        auto res = HttpResponse::newHttpResponse();
        res->setStatusCode(k400BadRequest);
        res->setBody("Missing lat or lon parameters");
        callback(res);
        return;
    }

    try {
        double lat = std::stod(latStr);
        double lon = std::stod(lonStr);
        
        std::cout << "SEARCH_DEBUG: Venue search hit: lat=" << lat << ", lon=" << lon << std::endl;

        auto dbClient = drogon::app().getDbClient();
        
        // Using Haversine formula for accurate distance sorting
        dbClient->execSqlAsync(
            "SELECT id, name, latitude, longitude, tags, address, city, country_code, "
            "6371 * 2 * ASIN(SQRT("
            "  POWER(SIN((latitude - $1) * pi() / 180 / 2), 2) + "
            "  COS($1 * pi() / 180) * COS(latitude * pi() / 180) * "
            "  POWER(SIN((longitude - $2) * pi() / 180 / 2), 2)"
            ")) as distance "
            "FROM venues ORDER BY distance ASC LIMIT 10",
            [callback](const drogon::orm::Result &r) {
                std::vector<Venue> venues;
                for (auto const &row : r) {
                    Venue venue;
                    venue.id = row["id"].as<std::string>();
                    venue.name = row["name"].as<std::string>();
                    venue.latitude = row["latitude"].as<double>();
                    venue.longitude = row["longitude"].as<double>();
                    venue.address = row["address"].as<std::string>();
                    venue.city = row["city"].as<std::string>();
                    venue.country_code = row["country_code"].as<std::string>();
                    
                    venue.tags = ContextService::parseTags(row["tags"].as<std::string>());
                    venues.push_back(venue);
                }
                
                std::string json = glz::write_json(venues).value_or("[]");
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
            lat, lon
        );
    } catch (const std::exception& e) {
        auto res = HttpResponse::newHttpResponse();
        res->setStatusCode(k400BadRequest);
        res->setBody("Invalid lat or lon format");
        callback(res);
    }
}

void VenuesController::get(const HttpRequestPtr& req, std::function<void(const HttpResponsePtr&)>&& callback, std::string id) {
    auto dbClient = drogon::app().getDbClient();
    
    dbClient->execSqlAsync(
        "SELECT id::text, name, latitude, longitude, tags, address, city FROM venues WHERE id::text = $1",
        [callback](const drogon::orm::Result &r) {
            if (r.size() == 0) {
                auto res = HttpResponse::newHttpResponse();
                res->setStatusCode(k404NotFound);
                callback(res);
                return;
            }

            auto const &row = r[0];
            Venue venue;
            venue.id = row["id"].as<std::string>();
            venue.name = row["name"].as<std::string>();
            venue.latitude = row["latitude"].as<double>();
            venue.longitude = row["longitude"].as<double>();
            venue.address = row["address"].as<std::string>();
            venue.city = row["city"].as<std::string>();
            
            venue.tags = ContextService::parseTags(row["tags"].as<std::string>());

            std::string json = glz::write_json(venue).value_or("{}");
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
        id
    );
}

} // namespace shishapp
