#pragma once
#include <drogon/HttpController.h>

using namespace drogon;

namespace shishapp {

class EquipmentController : public drogon::HttpController<EquipmentController> {
public:
    METHOD_LIST_BEGIN
        ADD_METHOD_TO(EquipmentController::list, "/api/v1/equipment", Get);
        ADD_METHOD_TO(EquipmentController::list, "/api/v1/equipments", Get);
        ADD_METHOD_TO(EquipmentController::list, "/api/v1/equipment/list", Get);
        ADD_METHOD_TO(EquipmentController::owned, "/api/v1/equipment/owned", Get);
        ADD_METHOD_TO(EquipmentController::toggle, "/api/v1/equipment/{id}/toggle", Post);
    METHOD_LIST_END

    void list(const HttpRequestPtr& req, std::function<void(const HttpResponsePtr&)>&& callback);
    void owned(const HttpRequestPtr& req, std::function<void(const HttpResponsePtr&)>&& callback);
    void toggle(const HttpRequestPtr& req, std::function<void(const HttpResponsePtr&)>&& callback, std::string id);
};

} // namespace shishapp
