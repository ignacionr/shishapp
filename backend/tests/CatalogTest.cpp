#include <gtest/gtest.h>
#include "models/models.hpp"
#include <glaze/glaze.hpp>

using namespace shishapp;

TEST(CatalogModelTest, VideoSerialization) {
    Video v = {"1", "slug", "Title", "Description", "en"};
    std::string json = glz::write_json(v).value_or("");
    
    EXPECT_NE(json, "");
    EXPECT_TRUE(json.find("slug") != std::string::npos);
    
    Video decoded;
    auto ec = glz::read_json(decoded, json);
    EXPECT_FALSE(bool(ec));
    EXPECT_EQ(decoded.id, "1");
    EXPECT_EQ(decoded.slug, "slug");
}

TEST(CatalogModelTest, EquipmentSerialization) {
    Equipment e;
    e.id = "1";
    e.internal_name = "test_eq";
    e.translations["en"] = {"Test Eq", "Desc"};
    
    std::string json = glz::write_json(e).value_or("");
    EXPECT_TRUE(json.find("test_eq") != std::string::npos);
    EXPECT_TRUE(json.find("Test Eq") != std::string::npos);
}

TEST(CatalogModelTest, PurchaseLinkSerialization) {
    PurchaseLink pl = {"1", "Eq", "Desc", "http://example.com", "US", 9.99};
    std::string json = glz::write_json(pl).value_or("");
    
    EXPECT_TRUE(json.find("http://example.com") != std::string::npos);
    EXPECT_TRUE(json.find("9.99") != std::string::npos);
}
