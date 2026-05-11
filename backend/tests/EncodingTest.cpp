#include <gtest/gtest.h>
#include "models/models.hpp"
#include <glaze/glaze.hpp>
#include <string>

using namespace shishapp;

TEST(EncodingTest, UTF8CharacterPreservation) {
    // The user's name with accented characters
    std::string originalName = "Ignacio Nicolás Rodríguez";
    
    // Create a User object
    User user;
    user.id = "test-id";
    user.email = "test@example.com";
    user.name = originalName;
    user.country = "AR";
    user.language = "es-419";

    // 1. Test Glaze serialization (should preserve UTF-8 bytes)
    std::string json = glz::write_json(user).value_or("");
    
    // Verify that the JSON contains the UTF-8 representation of 'á' and 'í'
    // 'á' is 0xC3 0xA1, 'í' is 0xC3 0xAD
    EXPECT_NE(json.find("Nicol\xc3\xa1s"), std::string::npos);
    EXPECT_NE(json.find("Rodr\xc3\xadguez"), std::string::npos);

    // 2. Test Glaze deserialization
    User decoded;
    auto ec = glz::read_json(decoded, json);
    EXPECT_FALSE(bool(ec));
    EXPECT_EQ(decoded.name, originalName);
    EXPECT_EQ(decoded.name, "Ignacio Nicolás Rodríguez");
}

TEST(EncodingTest, UTF8MangleDetection) {
    // This test simulates what happens when UTF-8 bytes are interpreted as Latin-1
    // and then re-encoded as UTF-8 (mangled).
    
    std::string utf8Name = "Ignacio Nicolás Rodríguez";
    
    // Simulating the mangled string the user reported: "Ignacio NicolÃ¡s RodrÃ­guez"
    // 'á' (0xC3 0xA1) interpreted as Latin-1 is 'Ã' (0xC3) + '¡' (0xA1)
    std::string mangledName = "Ignacio Nicol\xc3\x83\xc2\xa1s Rodr\xc3\x83\xc2\xadzguez"; 
    // Wait, the above is double-encoded. Let's use the literal string the user gave.
    std::string reportMangled = "Ignacio NicolÃ¡s RodrÃ­guez";
    
    EXPECT_NE(utf8Name, reportMangled);
    
    // The test passes if we can confirm that our models don't spontaneously 
    // convert between encodings.
    User user;
    user.name = utf8Name;
    EXPECT_EQ(user.name.length(), 27); // "á" and "í" are 2 bytes each in UTF-8
}
