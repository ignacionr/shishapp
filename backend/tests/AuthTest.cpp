#include <gtest/gtest.h>
#include "models/models.hpp"
#include <glaze/glaze.hpp>

using namespace viditacafe;

TEST(AuthModelTest, Serialization) {
    User user = {"1", "test@example.com", "Test User"};
    std::string json = glz::write_json(user).value_or("");
    
    EXPECT_NE(json, "");
    EXPECT_TRUE(json.find("test@example.com") != std::string::npos);
    
    User decoded;
    auto ec = glz::read_json(decoded, json);
    EXPECT_FALSE(bool(ec));
    EXPECT_EQ(decoded.id, "1");
    EXPECT_EQ(decoded.email, "test@example.com");
}

TEST(AuthResponseTest, Serialization) {
    AuthResponse response;
    response.token = "test_token";
    response.user = {"1", "test@example.com", "Test User"};
    
    std::string json = glz::write_json(response).value_or("");
    EXPECT_TRUE(json.find("test_token") != std::string::npos);
}
