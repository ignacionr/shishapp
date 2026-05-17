#pragma once
#include <string>
#include <string_view>
#include <drogon/HttpAppFramework.h>
#include <drogon/HttpClient.h>
#include <fstream>
#include <filesystem>
#include <future>
#include <algorithm>
#include <vector>

namespace myshisha {

class StorageService {
private:
    static std::string detectExtensionFromMagicBytes(std::string_view body) {
        if (body.size() >= 2 && (unsigned char)body[0] == 0xFF && (unsigned char)body[1] == 0xD8) {
            return ".jpg";
        }
        if (body.size() >= 8 && body.substr(0, 8) == "\x89PNG\r\n\x1A\n") {
            return ".png";
        }
        if (body.size() >= 6 && (body.substr(0, 6) == "GIF87a" || body.substr(0, 6) == "GIF89a")) {
            return ".gif";
        }
        if (body.size() >= 12 && body.substr(0, 4) == "RIFF" && body.substr(8, 4) == "WEBP") {
            return ".png"; // Asset Hack: serve webp as .png
        }
        return "";
    }

public:
    static void downloadImage(const std::string& url, const std::string& nameHint, std::function<void(std::string)>&& callback) {
        if (url.find("http") != 0) {
            LOG_DEBUG << "Skipping download, not a URL: " << url;
            callback(url);
            return;
        }

        LOG_INFO << "Starting download for: " << url;
        auto client = drogon::HttpClient::newHttpClient(url);
        auto req = drogon::HttpRequest::newHttpRequest();
        req->setMethod(drogon::Get);
        // Pretend to be a modern browser to bypass basic bot protection
        req->addHeader("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");
        req->addHeader("Accept", "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8");
        req->addHeader("Accept-Language", "en-US,en;q=0.9");
        
        client->sendRequest(req, [url, nameHint, callback = std::move(callback)](drogon::ReqResult result, const drogon::HttpResponsePtr &res) {
            if (result != drogon::ReqResult::Ok || !res) {
                LOG_ERROR << "Request failed or no response for " << url;
                callback(url);
                return;
            }

            // Handle basic redirects manually if client doesn't (Drogon HttpClient follows redirects automatically in recent versions, but just in case)
            if (res->statusCode() == 301 || res->statusCode() == 302 || res->statusCode() == 307 || res->statusCode() == 308) {
                std::string loc = res->getHeader("Location");
                if (!loc.empty()) {
                    LOG_INFO << "Redirected to: " << loc;
                    // For simplicity, if we hit a redirect, we'll just fail gracefully for now 
                    // since recursive async calls in this context require a bit more plumbing.
                    // Usually Drogon's client handles this if configured.
                    LOG_ERROR << "Manual redirect following not implemented. URL: " << url;
                    callback(url);
                    return;
                }
            }

            if (res->statusCode() != drogon::k200OK) {
                LOG_ERROR << "HTTP Error " << res->statusCode() << " for " << url;
                callback(url);
                return;
            }

            auto body = res->body();
            LOG_INFO << "Successfully downloaded " << url << " (Size: " << body.size() << ")";

            // 1. Try Magic Bytes (Most Reliable)
            std::string ext = detectExtensionFromMagicBytes(body);
            
            // 2. Fallback to Content-Type
            if (ext.empty()) {
                std::string contentType = res->getHeader("content-type");
                if (contentType.empty()) contentType = res->getHeader("Content-Type");
                
                std::string ctypeLower = contentType;
                std::transform(ctypeLower.begin(), ctypeLower.end(), ctypeLower.begin(), ::tolower);
                
                LOG_WARN << "Magic bytes failed. Falling back to Content-Type: " << contentType;

                if (ctypeLower.find("webp") != std::string::npos) ext = ".png";
                else if (ctypeLower.find("jpeg") != std::string::npos || ctypeLower.find("jpg") != std::string::npos) ext = ".jpg";
                else if (ctypeLower.find("png") != std::string::npos) ext = ".png";
                else if (ctypeLower.find("gif") != std::string::npos) ext = ".gif";
                else if (ctypeLower.find("html") != std::string::npos) {
                    LOG_ERROR << "Downloaded content is HTML, likely bot protection. URL: " << url;
                    callback(url); // Don't save HTML as an image
                    return;
                }
            }

            // 3. Fallback to URL extension
            if (ext.empty()) {
                size_t lastDot = url.find_last_of('.');
                size_t lastSlash = url.find_last_of('/');
                if (lastDot != std::string::npos && (lastSlash == std::string::npos || lastDot > lastSlash)) {
                    std::string urlExt = url.substr(lastDot);
                    size_t queryParam = urlExt.find('?');
                    if (queryParam != std::string::npos) urlExt = urlExt.substr(0, queryParam);
                    if (urlExt.size() <= 5 && urlExt.size() >= 3) {
                        std::transform(urlExt.begin(), urlExt.end(), urlExt.begin(), ::tolower);
                        if (urlExt == ".jpeg") ext = ".jpg";
                        else ext = urlExt;
                    }
                }
            }

            if (ext.empty()) ext = ".png"; // Absolute fallback
            
            LOG_INFO << "Final extension decided: " << ext << " for " << url;

            std::string safeName = nameHint;
            for (auto &c : safeName) {
                if (c == ' ') c = '_';
                else if (std::isalnum((unsigned char)c)) c = std::tolower((unsigned char)c);
                else c = '_';
            }
            
            std::string filename = safeName + "_" + std::to_string(std::chrono::system_clock::now().time_since_epoch().count() % 100000) + ext;
            std::string relativePath = "/static/images/" + filename;
            std::string fullPath = "./www" + relativePath;

            try {
                std::filesystem::create_directories("./www/static/images");
                std::ofstream file(fullPath, std::ios::binary);
                file.write(body.data(), body.size());
                file.close();
                LOG_INFO << "Successfully saved image to " << fullPath;
                callback(relativePath);
            } catch (const std::exception& e) {
                LOG_ERROR << "Failed to save image: " << e.what();
                callback(url);
            }
        });
    }
};

} // namespace myshisha
