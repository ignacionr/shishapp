#pragma once
#include <drogon/HttpRequest.h>
#include <string>
#include <vector>
#include <sstream>
#include <algorithm>

namespace myshisha {

class ContextService {
public:
    static std::string getCountry(const drogon::HttpRequestPtr& req) {
        std::string cfCountry = req->getHeader("CF-IPCountry");
        if (!cfCountry.empty()) return cfCountry;
        return "WW";
    }

    static std::string getLanguage(const drogon::HttpRequestPtr& req) {
        // 1. Explicit Header
        auto lang = req->getHeader("X-MyShisha.vip-Language");
        if (!lang.empty()) return lang;

        // 2. Browser Preferences (Highest Signal)
        auto accept = req->getHeader("Accept-Language");
        if (accept.find("ar") != std::string::npos) return "ar";
        if (accept.find("es") != std::string::npos) return "es-419";
        if (accept.find("pt") != std::string::npos) return "pt-BR";
        if (accept.find("ru") != std::string::npos) return "ru";
        if (accept.find("ka") != std::string::npos) return "ka";
        if (accept.find("it") != std::string::npos) return "it";

        // 3. Inferred from Country (Fallback)
        std::string country = getCountry(req);
        if (country == "SA" || country == "AE" || country == "EG" || country == "JO" || 
            country == "LB" || country == "KW" || country == "QA" || country == "OM" || 
            country == "BH" || country == "IQ" || country == "SY" || country == "YE") return "ar";
        if (country == "AR" || country == "UY" || country == "ES" || country == "MX") return "es-419";
        if (country == "BR") return "pt-BR";
        if (country == "RU") return "ru";
        if (country == "GE") return "ka";
        if (country == "IT") return "it";

        return "en";
    }

    static std::vector<std::string> parseTags(const std::string& tagsStr) {
        if (tagsStr.empty()) return {};
        
        std::string cleaned = tagsStr;
        // Strip PostgreSQL array curly braces {}
        if (!cleaned.empty() && cleaned.front() == '{') cleaned.erase(0, 1);
        if (!cleaned.empty() && cleaned.back() == '}') cleaned.pop_back();

        std::vector<std::string> tags;
        std::stringstream ss(cleaned);
        std::string tag;
        while (std::getline(ss, tag, ',')) {
            // Strip quotes if they exist (PostgreSQL array format with special chars)
            if (tag.size() >= 2 && tag.front() == '"' && tag.back() == '"') {
                tag = tag.substr(1, tag.size() - 2);
            }
            // Trim whitespace
            tag.erase(0, tag.find_first_not_of(" \t\n\r"));
            tag.erase(tag.find_last_not_of(" \t\n\r") + 1);
            if (!tag.empty()) {
                tags.push_back(tag);
            }
        }
        return tags;
    }
};

} // namespace myshisha
