#include <gtest/gtest.h>
#include "models/models.hpp"
#include <glaze/glaze.hpp>

using namespace myshisha;

TEST(TagModelTest, TagSerialization) {
    FullTag t;
    t.id = "1";
    t.name = "Test Tag";
    t.display_order = 1;
    t.translations["en"] = "English Tag";
    
    std::string json = glz::write_json(t).value_or("");
    EXPECT_TRUE(json.find("English Tag") != std::string::npos);
}

TEST(TagModelTest, CategorySerialization) {
    FullTagCategory cat;
    cat.id = "c1";
    cat.name = "Cat";
    cat.tags.push_back({"t1", "Tag", 1, true, {{"en", "ET"}}});
    
    std::string json = glz::write_json(cat).value_or("");
    EXPECT_TRUE(json.find("ET") != std::string::npos);
}
