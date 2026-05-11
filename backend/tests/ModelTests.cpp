#include <gtest/gtest.h>
#include "models/models.hpp"
#include "services/AuthService.hpp"
#include <glaze/glaze.hpp>
#include <drogon/HttpRequest.h>

using namespace shishapp;

TEST(AuthServiceTest, TokenExtraction) {
    auto req = drogon::HttpRequest::newHttpRequest();
    
    // 1. Test valid Authorization header
    req->addHeader("Authorization", "Bearer simulated_shishapp_jwt_user123");
    auto id = AuthService::getUserIdFromRequest(req);
    EXPECT_TRUE(id.has_value());
    EXPECT_EQ(*id, "user123");

    // 2. Test valid custom header
    auto req2 = drogon::HttpRequest::newHttpRequest();
    req2->addHeader("X-Shishapp-Token", "simulated_shishapp_jwt_user456");
    auto id2 = AuthService::getUserIdFromRequest(req2);
    EXPECT_TRUE(id2.has_value());
    EXPECT_EQ(*id2, "user456");

    // 3. Test invalid token
    auto req3 = drogon::HttpRequest::newHttpRequest();
    req3->addHeader("Authorization", "Bearer invalid_token");
    auto id3 = AuthService::getUserIdFromRequest(req3);
    EXPECT_FALSE(id3.has_value());
}

TEST(JournalModelTest, Serialization) {
    JournalEntry entry;
    entry.id = "1";
    entry.user_id = "user1";
    entry.date = 1713624000;
    entry.coffee_name = "Ethiopia";
    entry.brewing_method = "V60";
    entry.location = "Home";
    entry.rating = 9.0;
    entry.tags = {"Floral"};

    std::string json = glz::write_json(entry).value_or("");
    EXPECT_TRUE(json.find("Ethiopia") != std::string::npos);
    
    JournalEntry decoded;
    auto ec = glz::read_json(decoded, json);
    EXPECT_FALSE(bool(ec));
    EXPECT_EQ(decoded.coffee_name, "Ethiopia");
}

TEST(EquipmentModelTest, Serialization) {
    Equipment eq = {"1", "V60", "V60", "v60", "brewer", "Desc", "https://img.jpg", false, {}};
    std::string json = glz::write_json(eq).value_or("");
    EXPECT_TRUE(json.find("brewer") != std::string::npos);
}

TEST(FeedModelTest, Serialization) {
    FeedCard card = {"video", "Title", "Content", "id"};
    std::string json = glz::write_json(card).value_or("");
    EXPECT_TRUE(json.find("video") != std::string::npos);
}
