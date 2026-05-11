#pragma once
#include <drogon/drogon.h>
#include <vector>
#include <string>
#include <functional>
#include "models/models.hpp"

namespace shishapp {

class ShortLinkService {
public:
    static void listShortLinks(std::function<void(std::vector<ShortLink>)>&& successCallback,
                              std::function<void(const drogon::orm::DrogonDbException&)>&& errorCallback);

    static void getShortLinkByCode(const std::string& code,
                                  std::function<void(std::optional<ShortLink>)>&& successCallback,
                                  std::function<void(const drogon::orm::DrogonDbException&)>&& errorCallback);

    static void updateShortLink(const ShortLink& sl,
                               std::function<void(std::string id)>&& successCallback,
                               std::function<void(const drogon::orm::DrogonDbException&)>&& errorCallback);

    static void removeShortLink(const std::string& idOrCode,
                               std::function<void()>&& successCallback,
                               std::function<void(const drogon::orm::DrogonDbException&)>&& errorCallback);

    static void assignShortLinkBlock(const ShortLinkBlockRequest& br,
                                    std::function<void()>&& successCallback,
                                    std::function<void(std::string error)>&& errorCallback,
                                    std::function<void(const drogon::orm::DrogonDbException&)>&& dbErrorCallback);
};

} // namespace shishapp
