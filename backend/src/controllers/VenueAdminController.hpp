#pragma once
#include <drogon/HttpController.h>

using namespace drogon;

namespace viditacafe {

class VenueAdminController : public drogon::HttpController<VenueAdminController> {
public:
    METHOD_LIST_BEGIN
        ADD_METHOD_TO(VenueAdminController::stats, "/api/v1/venue-admin/stats?venue_id={1}&period={2}", Get);
        ADD_METHOD_TO(VenueAdminController::listPromotions, "/api/v1/venue-admin/promotions?venue_id={1}", Get);
        ADD_METHOD_TO(VenueAdminController::createPromotion, "/api/v1/venue-admin/promotions", Post);
        ADD_METHOD_TO(VenueAdminController::removePromotion, "/api/v1/venue-admin/promotions/{1}", Delete);
    METHOD_LIST_END

    void stats(const HttpRequestPtr& req, std::function<void(const HttpResponsePtr&)>&& callback, std::string venueId, std::string period);
    void listPromotions(const HttpRequestPtr& req, std::function<void(const HttpResponsePtr&)>&& callback, std::string venueId);
    void createPromotion(const HttpRequestPtr& req, std::function<void(const HttpResponsePtr&)>&& callback);
    void removePromotion(const HttpRequestPtr& req, std::function<void(const HttpResponsePtr&)>&& callback, std::string id);
};

} // namespace viditacafe
