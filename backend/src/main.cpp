#include <drogon/drogon.h>
#include <iostream>
#include <filesystem>
#include "controllers/VenueAdminController.hpp"

int main() {
    std::cout << "Starting MyShisha.vip Backend..." << std::endl;

    // Load configuration
    try {
        drogon::app().loadConfigFile("./config.json");
        std::cout << "Configuration loaded successfully." << std::endl;
    } catch (const std::exception& e) {
        std::cerr << "FATAL: Failed to load config.json: " << e.what() << std::endl;
        return 1;
    }

    // Initialize database client directly
    // This is the ONLY method that currently works with our Nix-built Drogon
    // Note: host=127.0.0.1 forces TCP, which uses 'trust' auth as configured in pg_hba.conf
    std::string connStr = "host=127.0.0.1 port=5432 dbname=myshisha user=inz client_encoding=UTF8";
    auto db = drogon::orm::DbClient::newPgClient(connStr, 5, "default");
    
    if (!db) {
        std::cerr << "FATAL: Database client 'default' could not be initialized directly." << std::endl;
        return 1;
    }

    std::cout << "Database client initialized and registered as 'default'." << std::endl;

    // Explicitly add listener to ensure we match Cloudflare origin configuration
    std::cout << "Adding listener on 0.0.0.0:8100" << std::endl;
    drogon::app().addListener("0.0.0.0", 8100);

    // SPA Routing & Pretty URLs Handler
    drogon::app().registerPreRoutingAdvice([](const drogon::HttpRequestPtr &req, drogon::AdviceCallback &&acb, drogon::AdviceChainCallback &&accb) {
        std::string path = req->path();
        
        // Skip API and Short Links
        if (path.find("/api/") == 0 || path.find("/dl/") == 0) {
            accb();
            return;
        }

        std::string docRoot = drogon::app().getDocumentRoot();
        std::string fullPath = docRoot + path;

        // 1. If it's a direct file match (like /manifest.json, /sw.js, or /static/...)
        if (std::filesystem::exists(fullPath) && !std::filesystem::is_directory(fullPath)) {
            // Explicitly serve the file to avoid any Drogon internal handler ambiguity
            auto res = drogon::HttpResponse::newFileResponse(fullPath);
            // Add some basic caching for static assets
            if (path.find("/static/") == 0 || path.find("/videos/") == 0) {
                res->addHeader("Cache-Control", "public, max-age=31536000, immutable");
            }
            acb(res);
            return;
        }

        // 2. Check if the path exists as an .html file (for pretty URLs)
        if (path != "/" && std::filesystem::exists(fullPath + ".html")) {
            auto res = drogon::HttpResponse::newFileResponse(fullPath + ".html");
            res->addHeader("Cache-Control", "no-cache, no-store, must-revalidate");
            acb(res);
            return;
        }

        // 3. Special handling for SPA entry points and known routes
        if (path == "/" || path == "/login" || path == "/in" || path == "/profile" || path == "/terms" || path == "/privacy" || path == "/journey" || path == "/brewing" || path == "/equipment" || path == "/search" || path == "/admin") {
            auto res = drogon::HttpResponse::newFileResponse(docRoot + "/index.html");
            res->addHeader("Cache-Control", "no-cache, no-store, must-revalidate");
            acb(res);
            return;
        }

        // 4. Fallback for other SPA routes (anything without an extension)
        if (path.find('.') == std::string::npos) {
            auto res = drogon::HttpResponse::newFileResponse(docRoot + "/index.html");
            res->addHeader("Cache-Control", "no-cache, no-store, must-revalidate");
            acb(res);
            return;
        }

        // 5. If it's a file with extension but reached here, it's a true 404
        std::cout << "DEBUG: 404 for " << path << " (fullPath: " << fullPath << ")" << std::endl;
        accb();
    });

    std::cout << "Starting server loop..." << std::endl;
    drogon::app().run();
    return 0;
}
