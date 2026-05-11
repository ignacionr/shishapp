#include "ShortLinkService.hpp"
#include <algorithm>
#include <cctype>

namespace shishapp {

void ShortLinkService::listShortLinks(std::function<void(std::vector<ShortLink>)>&& successCallback,
                                     std::function<void(const drogon::orm::DrogonDbException&)>&& errorCallback) {
    auto db = drogon::app().getDbClient();
    db->execSqlAsync(
        "SELECT id::text, code, target_path, COALESCE(description, '') as description, created_at::text FROM short_links ORDER BY created_at DESC",
        [successCallback = std::move(successCallback)](const drogon::orm::Result &r) {
            std::vector<ShortLink> links;
            for (auto const &row : r) {
                ShortLink sl;
                sl.id = row["id"].as<std::string>();
                sl.code = row["code"].as<std::string>();
                sl.target_path = row["target_path"].as<std::string>();
                sl.description = row["description"].as<std::string>();
                sl.created_at = row["created_at"].as<std::string>();
                links.push_back(sl);
            }
            successCallback(links);
        },
        std::move(errorCallback)
    );
}

void ShortLinkService::getShortLinkByCode(const std::string& code,
                                         std::function<void(std::optional<ShortLink>)>&& successCallback,
                                         std::function<void(const drogon::orm::DrogonDbException&)>&& errorCallback) {
    auto db = drogon::app().getDbClient();
    db->execSqlAsync(
        "SELECT id::text, code, target_path, COALESCE(description, '') as description, created_at::text FROM short_links WHERE code = $1",
        [successCallback = std::move(successCallback)](const drogon::orm::Result &r) {
            if (r.size() == 0) {
                successCallback(std::nullopt);
                return;
            }
            ShortLink sl;
            sl.id = r[0]["id"].as<std::string>();
            sl.code = r[0]["code"].as<std::string>();
            sl.target_path = r[0]["target_path"].as<std::string>();
            sl.description = r[0]["description"].as<std::string>();
            sl.created_at = r[0]["created_at"].as<std::string>();
            successCallback(sl);
        },
        std::move(errorCallback),
        code
    );
}

void ShortLinkService::updateShortLink(const ShortLink& sl,
                                      std::function<void(std::string id)>&& successCallback,
                                      std::function<void(const drogon::orm::DrogonDbException&)>&& errorCallback) {
    auto db = drogon::app().getDbClient();
    db->execSqlAsync(
        "INSERT INTO short_links (code, target_path, description) VALUES ($1, $2, $3) "
        "ON CONFLICT (code) DO UPDATE SET target_path = EXCLUDED.target_path, description = EXCLUDED.description RETURNING id::text",
        [successCallback = std::move(successCallback)](const drogon::orm::Result &r) {
            if (r.size() > 0) successCallback(r[0]["id"].as<std::string>());
            else successCallback("");
        },
        std::move(errorCallback),
        sl.code, sl.target_path, sl.description
    );
}

void ShortLinkService::removeShortLink(const std::string& idOrCode,
                                      std::function<void()>&& successCallback,
                                      std::function<void(const drogon::orm::DrogonDbException&)>&& errorCallback) {
    auto db = drogon::app().getDbClient();
    db->execSqlAsync(
        "DELETE FROM short_links WHERE id::text = $1 OR code = $1",
        [successCallback = std::move(successCallback)](const drogon::orm::Result &r) {
            successCallback();
        },
        std::move(errorCallback),
        idOrCode
    );
}

void ShortLinkService::assignShortLinkBlock(const ShortLinkBlockRequest& br,
                                           std::function<void()>&& successCallback,
                                           std::function<void(std::string error)>&& errorCallback,
                                           std::function<void(const drogon::orm::DrogonDbException&)>&& dbErrorCallback) {
    auto parse = [](std::string const& s) -> std::pair<std::string, long long> {
        std::string prefix;
        std::string numStr;
        for (char c : s) {
            if (std::isdigit(c)) numStr += c;
            else prefix += c;
        }
        return {prefix, numStr.empty() ? 0 : std::stoll(numStr)};
    };

    auto [startPrefix, startNum] = parse(br.start_code);
    auto [endPrefix, endNum] = parse(br.end_code);

    if (startPrefix != endPrefix || startNum > endNum || (endNum - startNum) > 1000) {
        errorCallback("Invalid range or different prefixes. Max 1000 at once.");
        return;
    }

    auto db = drogon::app().getDbClient();
    auto total = endNum - startNum + 1;
    auto remaining = std::make_shared<size_t>(total);
    auto hasError = std::make_shared<bool>(false);

    for (long long i = startNum; i <= endNum; ++i) {
        std::string startNumStr;
        for (char c : br.start_code) if (std::isdigit(c)) startNumStr += c;
        
        std::string currentNumStr = std::to_string(i);
        if (currentNumStr.length() < startNumStr.length()) {
            currentNumStr = std::string(startNumStr.length() - currentNumStr.length(), '0') + currentNumStr;
        }
        
        std::string code = startPrefix + currentNumStr;

        db->execSqlAsync(
            "INSERT INTO short_links (code, target_path, description) VALUES ($1, $2, $3) "
            "ON CONFLICT (code) DO UPDATE SET target_path = EXCLUDED.target_path, description = EXCLUDED.description",
            [successCallback, remaining, hasError](const drogon::orm::Result &r) {
                if (*hasError) return;
                (*remaining)--;
                if (*remaining == 0) {
                    successCallback();
                }
            },
            [dbErrorCallback, hasError](const drogon::orm::DrogonDbException &e) {
                if (*hasError) return;
                *hasError = true;
                dbErrorCallback(e);
            },
            code, br.target_path, br.description
        );
    }
}

} // namespace shishapp
