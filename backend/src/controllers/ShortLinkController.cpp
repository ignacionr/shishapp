#include "ShortLinkController.hpp"
#include <drogon/HttpAppFramework.h>

namespace shishapp {

void ShortLinkController::redirect(const HttpRequestPtr& req, std::function<void(const HttpResponsePtr&)>&& callback, const std::string& code) {
    auto db = drogon::app().getDbClient();
    
    db->execSqlAsync(
        "SELECT target_path FROM short_links WHERE code = $1",
        [callback](const drogon::orm::Result &r) {
            if (r.size() > 0) {
                auto target = r[0]["target_path"].as<std::string>();
                auto res = HttpResponse::newRedirectionResponse(target, k302Found);
                callback(res);
            } else {
                // Fallback to venues page if code not found
                auto res = HttpResponse::newRedirectionResponse("/for-venues", k302Found);
                callback(res);
            }
        },
        [callback](const drogon::orm::DrogonDbException &e) {
            auto res = HttpResponse::newHttpResponse();
            res->setStatusCode(k500InternalServerError);
            callback(res);
        },
        code
    );
}

} // namespace shishapp
