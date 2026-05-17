#include <gtest/gtest.h>
#include "models/models.hpp"
#include <glaze/glaze.hpp>

using namespace myshisha;

TEST(VenueModelTest, VenueSerialization) {
    Venue v;
    v.id = "1";
    v.name = "Test Venue";
    v.latitude = 1.23;
    v.longitude = 4.56;
    v.address = "123 Street";
    v.city = "City";
    v.country_code = "GE";
    
    std::string json = glz::write_json(v).value_or("");
    EXPECT_NE(json, "");
    EXPECT_TRUE(json.find("Test Venue") != std::string::npos);
    
    Venue decoded;
    auto ec = glz::read_json(decoded, json);
    EXPECT_FALSE(bool(ec));
    EXPECT_EQ(decoded.name, "Test Venue");
}

TEST(VenueModelTest, VenueTagConfigSerialization) {
    VenueTagConfig cfg;
    cfg.venue_id = "v1";
    cfg.tags.push_back({"t1", 1});
    cfg.inherited_tags.push_back({"t2", 2});
    
    std::string json = glz::write_json(cfg).value_or("");
    EXPECT_TRUE(json.find("v1") != std::string::npos);
    EXPECT_TRUE(json.find("inherited_tags") != std::string::npos);
}
