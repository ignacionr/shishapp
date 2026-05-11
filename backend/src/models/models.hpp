#pragma once
#include <string>
#include <vector>
#include <optional>
#include <glaze/glaze.hpp>

namespace viditacafe {

struct UserMastery {
    double total_score = 0;
    int current_level = 1;
    int journal_count = 0;
    int method_count = 0;
    int venue_count = 0;
    int precision_count = 0;
    std::string last_updated;
};

struct UserRole {
    std::string id;
    std::string role_type; // GLOBAL, COUNTRY, VENUE
    std::optional<std::string> target_id;
};

struct User {
    std::string id;
    std::string email;
    std::string name;
    std::optional<std::string> picture;
    std::string country;
    std::string language;
    std::optional<std::string> google_id;
    bool is_admin = false;
    std::string created_at;
    std::optional<UserMastery> mastery;
    std::vector<UserRole> roles;
};

struct JournalEntry {
    std::optional<std::string> id;
    std::optional<std::string> user_id;
    long long date;
    std::string coffee_name;
    std::optional<std::string> brewing_method;
    std::string location;
    std::string venue;
    std::optional<std::string> location_type;
    std::optional<std::string> venue_id;
    double rating;
    std::vector<std::string> tags;
    std::optional<bool> is_synced;
};

struct PurchaseLink {
    std::string id;
    std::string equipmentName;
    std::string description;
    std::string url;
    std::string countryCode;
    double price;
};

struct TranslationEntry {
    std::string name;
    std::string description;
};

struct Equipment {
    std::string id;
    std::string name; // Localized name for display
    std::string internal_name; // Stable English key for logic
    std::string slug; // URL-friendly key
    std::string category;
    std::string description;
    std::string imageUrl;
    bool isOwned = false;
    std::vector<PurchaseLink> purchaseLinks;
    std::map<std::string, TranslationEntry> translations;
};

struct BrewingStep {
    std::string id;
    int order_index;
    int duration; // seconds
    std::optional<double> target_water;
    std::optional<double> target_temp;
    std::string instruction;
};

struct BrewingMethod {
    std::string id;
    std::string displayName;
    std::string description;
    std::vector<std::string> requiredEquipment; // names or ids
    std::vector<std::string> optionalEquipment; // names or ids
    std::vector<std::string> consumables; // names or ids
    std::vector<BrewingStep> steps;
};

struct BrewingPreset {
    std::optional<std::string> id;
    std::optional<std::string> user_id;
    std::string name;
    std::string method_id;
    double coffee_dose;
    double water_yield;
    std::optional<double> ratio;
    double temperature;
    std::string grind_size;
    std::optional<uint64_t> created_at;
};

struct FeedCard {
    std::string id;
    std::string type; // "insight", "video", "suggestion", "quiz"
    std::string title;
    std::string content;
    std::string metadata; // e.g., YouTube ID or link
};

struct AuthResponse {
    std::string token;
    User user;
};

struct StatEntry {
    std::string name;
    long long count;
    double average_rating = 0;
};

struct Video {
    std::string id;
    std::string slug;
    std::string title;
    std::string description;
    std::string language_code;
};

struct Venue {
    std::string id;
    std::string name;
    double latitude;
    double longitude;
    std::vector<std::string> tags;
    std::string address;
    std::string city;
    std::string country_code;
};

struct UserBasic {
    std::string id;
    std::string name;
    std::string email;
    std::string country;
    std::string created_at;
};

struct ShortLink {
    std::string id;
    std::string code;
    std::string target_path;
    std::string description;
    std::string created_at;
};

struct ShortLinkBlockRequest {
    std::string start_code;
    std::string end_code;
    std::string target_path;
    std::string description;
};

struct VenuePromotion {
    std::string id;
    std::string venue_id;
    std::string type;
    std::string title;
    std::string content;
    std::optional<std::string> image_url;
    std::optional<std::string> youtube_id;
    std::string start_date;
    std::optional<std::string> end_date;
};

struct Tag {
    std::string id;
    std::string name; // Internal key
    std::string display_name; // Localized name
    int display_order;
};

struct TagCategory {
    std::string id;
    std::string name; // Internal key
    std::string display_name; // Localized name
    int display_order;
    std::vector<Tag> tags;
};

struct FullTag {
    std::string id;
    std::string name;
    int display_order;
    bool is_active;
    std::map<std::string, std::string> translations;
};

struct FullTagCategory {
    std::string id;
    std::string name;
    int display_order;
    std::map<std::string, std::string> translations;
    std::vector<FullTag> tags;
};

struct CreateTagRequest {
    std::string category_id;
    std::string name;
    std::string display_name;
    std::string language_code;
    std::optional<std::string> venue_id;
};

struct ContextTagSelection {
    std::string tag_id;
    int display_order;
};

struct VenueTagConfig {
    std::string venue_id;
    std::vector<ContextTagSelection> tags;
    std::vector<ContextTagSelection> inherited_tags;
};

struct VenueStats {
    long long checkins_count = 0;
    double average_rating = 0;
    std::vector<StatEntry> tags_cloud;
    std::vector<StatEntry> checkins_over_time;
    std::vector<StatEntry> rating_over_time;
};

struct AdminStats {
    long long total_users = 0;
    long long total_journals = 0;
    long long total_presets = 0;
    std::vector<StatEntry> popular_coffee;
    std::vector<StatEntry> popular_methods;
    std::vector<StatEntry> users_by_country;
    std::vector<StatEntry> popular_venues;
    std::vector<UserBasic> recent_users;
};

struct CountryTagConfig {
    std::string country_code;
    std::vector<ContextTagSelection> tags;
};

} // namespace viditacafe
