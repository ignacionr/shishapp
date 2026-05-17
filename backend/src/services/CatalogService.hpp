#pragma once
#include <drogon/drogon.h>
#include <vector>
#include <string>
#include <functional>
#include "models/models.hpp"

namespace myshisha {

class CatalogService {
public:
    // Video operations
    static void listVideos(const std::string& lang,
                          std::function<void(std::vector<Video>)>&& successCallback,
                          std::function<void(const drogon::orm::DrogonDbException&)>&& errorCallback);

    static void createVideo(const Video& video,
                           std::function<void(std::string id)>&& successCallback,
                           std::function<void(const drogon::orm::DrogonDbException&)>&& errorCallback);

    static void updateVideo(const std::string& id, const Video& video,
                           std::function<void()>&& successCallback,
                           std::function<void(const drogon::orm::DrogonDbException&)>&& errorCallback);

    static void removeVideo(const std::string& id,
                           std::function<void()>&& successCallback,
                           std::function<void(const drogon::orm::DrogonDbException&)>&& errorCallback);

    // Link operations
    static void listLinks(std::function<void(std::vector<PurchaseLink>)>&& successCallback,
                         std::function<void(const drogon::orm::DrogonDbException&)>&& errorCallback);

    static void createLink(const PurchaseLink& link,
                          std::function<void(std::string id)>&& successCallback,
                          std::function<void(const drogon::orm::DrogonDbException&)>&& errorCallback);

    static void updateLink(const std::string& id, const PurchaseLink& link,
                          std::function<void()>&& successCallback,
                          std::function<void(const drogon::orm::DrogonDbException&)>&& errorCallback);

    static void removeLink(const std::string& id,
                          std::function<void()>&& successCallback,
                          std::function<void(const drogon::orm::DrogonDbException&)>&& errorCallback);

    static void getLinkCountryCode(const std::string& id,
                                  std::function<void(std::string countryCode)>&& successCallback,
                                  std::function<void(const drogon::orm::DrogonDbException&)>&& errorCallback);

    // Equipment operations
    static void listEquipment(std::function<void(std::vector<Equipment>)>&& successCallback,
                             std::function<void(const drogon::orm::DrogonDbException&)>&& errorCallback);

    static void createEquipment(const Equipment& equipment,
                               std::function<void(std::string id)>&& successCallback,
                               std::function<void(const drogon::orm::DrogonDbException&)>&& errorCallback);

    static void updateEquipment(const std::string& id, const Equipment& equipment,
                               std::function<void()>&& successCallback,
                               std::function<void(const drogon::orm::DrogonDbException&)>&& errorCallback);

    static void removeEquipment(const std::string& id,
                               std::function<void()>&& successCallback,
                               std::function<void(const drogon::orm::DrogonDbException&)>&& errorCallback);
};

} // namespace myshisha
