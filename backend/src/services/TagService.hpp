#pragma once
#include <drogon/drogon.h>
#include <vector>
#include <string>
#include <functional>
#include <map>
#include "models/models.hpp"

namespace myshisha {

class TagService {
public:
    static void listAllTags(std::function<void(std::vector<FullTagCategory>)>&& successCallback,
                           std::function<void(const drogon::orm::DrogonDbException&)>&& errorCallback);

    static void createTag(const CreateTagRequest& req,
                         std::function<void(std::string tagId)>&& successCallback,
                         std::function<void(const drogon::orm::DrogonDbException&)>&& errorCallback);

    static void getContextTags(const std::vector<std::string>& allowedCountries, bool isGlobal,
                              const std::vector<UserRole>& myRoles,
                              std::function<void(glz::generic)>&& successCallback,
                              std::function<void(const drogon::orm::DrogonDbException&)>&& errorCallback);

    static void setCountryTags(const std::string& countryCode, const std::vector<ContextTagSelection>& tags,
                              std::function<void()>&& successCallback,
                              std::function<void(const drogon::orm::DrogonDbException&)>&& errorCallback);
};

} // namespace myshisha
