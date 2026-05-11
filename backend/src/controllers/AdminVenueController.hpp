#pragma once
#include <drogon/HttpController.h>
#include "services/VenueService.hpp"

using namespace drogon;

namespace viditacafe {

class AdminVenueController : public drogon::HttpController<AdminVenueController> {
public:
    METHOD_LIST_BEGIN
        ADD_METHOD_TO(AdminVenueController::list, "/api/v1/admin/venues", Get);
        ADD_METHOD_TO(AdminVenueController::search, "/api/v1/admin/venues/search", Get);
        ADD_METHOD_TO(AdminVenueController::create, "/api/v1/admin/venues", Post);
        ADD_METHOD_TO(AdminVenueController::update, "/api/v1/admin/venues/{1}", Put);
        ADD_METHOD_TO(AdminVenueController::remove, "/api/v1/admin/venues/{1}", Delete);
        
        ADD_METHOD_TO(AdminVenueController::getVenueTags, "/api/v1/admin/tags/venue/{1}", Get);
        ADD_METHOD_TO(AdminVenueController::setVenueTags, "/api/v1/admin/tags/venue/{1}", Post);
    METHOD_LIST_END

    void list(const HttpRequestPtr& req, std::function<void(const HttpResponsePtr&)>&& callback);
    void search(const HttpRequestPtr& req, std::function<void(const HttpResponsePtr&)>&& callback);
    void create(const HttpRequestPtr& req, std::function<void(const HttpResponsePtr&)>&& callback);
    void update(const HttpRequestPtr& req, std::function<void(const HttpResponsePtr&)>&& callback, std::string id);
    void remove(const HttpRequestPtr& req, std::function<void(const HttpResponsePtr&)>&& callback, std::string id);

    void getVenueTags(const HttpRequestPtr& req, std::function<void(const HttpResponsePtr&)>&& callback, std::string venueId);
    void setVenueTags(const HttpRequestPtr& req, std::function<void(const HttpResponsePtr&)>&& callback, std::string venueId);
};

} // namespace viditacafe
