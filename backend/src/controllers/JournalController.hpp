#pragma once
#include <drogon/HttpController.h>

using namespace drogon;

namespace myshisha {

class JournalController : public drogon::HttpController<JournalController> {
public:
    METHOD_LIST_BEGIN
        ADD_METHOD_TO(JournalController::list, "/api/v1/journal", Get);
        ADD_METHOD_TO(JournalController::list, "/api/v1/journey", Get);
        ADD_METHOD_TO(JournalController::create, "/api/v1/journal", Post);
        ADD_METHOD_TO(JournalController::create, "/api/v1/journey", Post);
        ADD_METHOD_TO(JournalController::get, "/api/v1/journal/{id}", Get);
        ADD_METHOD_TO(JournalController::get, "/api/v1/journey/{id}", Get);
        ADD_METHOD_TO(JournalController::update, "/api/v1/journal/{id}", Put);
        ADD_METHOD_TO(JournalController::update, "/api/v1/journey/{id}", Put);
        ADD_METHOD_TO(JournalController::remove, "/api/v1/journal/{id}", Delete);
        ADD_METHOD_TO(JournalController::remove, "/api/v1/journey/{id}", Delete);
        ADD_METHOD_TO(JournalController::getTags, "/api/v1/journal/tags", Get);
    METHOD_LIST_END

    void list(const HttpRequestPtr& req, std::function<void(const HttpResponsePtr&)>&& callback);
    void create(const HttpRequestPtr& req, std::function<void(const HttpResponsePtr&)>&& callback);
    void get(const HttpRequestPtr& req, std::function<void(const HttpResponsePtr&)>&& callback, std::string id);
    void update(const HttpRequestPtr& req, std::function<void(const HttpResponsePtr&)>&& callback, std::string id);
    void remove(const HttpRequestPtr& req, std::function<void(const HttpResponsePtr&)>&& callback, std::string id);
    void getTags(const HttpRequestPtr& req, std::function<void(const HttpResponsePtr&)>&& callback);
};

} // namespace myshisha
