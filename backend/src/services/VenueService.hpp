#pragma once
#include <drogon/drogon.h>
#include <vector>
#include <string>
#include <functional>
#include "models/models.hpp"

namespace viditacafe {

class VenueService {
public:
    static void listVenues(const std::vector<std::string>& allowedCountries, bool isGlobal,
                          std::function<void(std::vector<Venue>)>&& successCallback,
                          std::function<void(const drogon::orm::DrogonDbException&)>&& errorCallback);

    static void createVenue(const Venue& venue,
                           std::function<void(std::string id)>&& successCallback,
                           std::function<void(const drogon::orm::DrogonDbException&)>&& errorCallback);

    static void updateVenue(const std::string& id, const Venue& venue,
                           std::function<void()>&& successCallback,
                           std::function<void(const drogon::orm::DrogonDbException&)>&& errorCallback);

    static void removeVenue(const std::string& id,
                           std::function<void()>&& successCallback,
                           std::function<void(const drogon::orm::DrogonDbException&)>&& errorCallback);

    static void searchVenues(const std::string& query, const std::vector<std::string>& allowedCountries, bool isGlobal,
                            std::function<void(std::vector<Venue>)>&& successCallback,
                            std::function<void(const drogon::orm::DrogonDbException&)>&& errorCallback);

    static void getVenueTags(const std::string& venueId,
                            std::function<void(VenueTagConfig)>&& successCallback,
                            std::function<void(const drogon::orm::DrogonDbException&)>&& errorCallback);

    static void setVenueTags(const std::string& venueId, const std::vector<ContextTagSelection>& tags,
                            std::function<void()>&& successCallback,
                            std::function<void(const drogon::orm::DrogonDbException&)>&& errorCallback);
};

} // namespace viditacafe
