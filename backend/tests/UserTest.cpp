#include <gtest/gtest.h>
#include "models/models.hpp"
#include <glaze/glaze.hpp>

using namespace myshisha;

TEST(UserModelTest, UserSerialization) {
    User u;
    u.id = "1";
    u.name = "Test User";
    u.email = "test@example.com";
    u.country = "GE";
    u.created_at = "2024-01-01";
    u.roles.push_back({"r1", "GLOBAL", std::nullopt});
    
    std::string json = glz::write_json(u).value_or("");
    EXPECT_NE(json, "");
    EXPECT_TRUE(json.find("test@example.com") != std::string::npos);
    EXPECT_TRUE(json.find("GLOBAL") != std::string::npos);
}

TEST(UserModelTest, UserRoleSerialization) {
    UserRole role = {"1", "COUNTRY", "GE"};
    std::string json = glz::write_json(role).value_or("");
    EXPECT_TRUE(json.find("COUNTRY") != std::string::npos);
    EXPECT_TRUE(json.find("GE") != std::string::npos);
}
