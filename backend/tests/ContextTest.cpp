#include <gtest/gtest.h>
#include "../src/services/ContextService.hpp"
#include <drogon/HttpRequest.h>

using namespace myshisha;

TEST(ContextServiceTest, GetLanguageFromExplicitHeader) {
    auto req = drogon::HttpRequest::newHttpRequest();
    req->addHeader("X-MyShisha.vip-Language", "pt-BR");
    
    EXPECT_EQ(ContextService::getLanguage(req), "pt-BR");
}

TEST(ContextServiceTest, GetLanguageFromAcceptLanguage) {
    // Spanish
    auto reqEs = drogon::HttpRequest::newHttpRequest();
    reqEs->addHeader("Accept-Language", "es-AR,es;q=0.9,en;q=0.8");
    EXPECT_EQ(ContextService::getLanguage(reqEs), "es-419");

    // Portuguese
    auto reqPt = drogon::HttpRequest::newHttpRequest();
    reqPt->addHeader("Accept-Language", "pt-BR,pt;q=0.9");
    EXPECT_EQ(ContextService::getLanguage(reqPt), "pt-BR");

    // Russian
    auto reqRu = drogon::HttpRequest::newHttpRequest();
    reqRu->addHeader("Accept-Language", "ru-RU,ru;q=0.9");
    EXPECT_EQ(ContextService::getLanguage(reqRu), "ru");

    // Georgian
    auto reqKa = drogon::HttpRequest::newHttpRequest();
    reqKa->addHeader("Accept-Language", "ka-GE,ka;q=0.9");
    EXPECT_EQ(ContextService::getLanguage(reqKa), "ka");

    // Arabic
    auto reqAr = drogon::HttpRequest::newHttpRequest();
    reqAr->addHeader("Accept-Language", "ar-SA,ar;q=0.9");
    EXPECT_EQ(ContextService::getLanguage(reqAr), "ar");
}

TEST(ContextServiceTest, GetLanguageFromCountryFallback) {
    auto req = drogon::HttpRequest::newHttpRequest();
    req->addHeader("CF-IPCountry", "AR");
    EXPECT_EQ(ContextService::getLanguage(req), "es-419");

    auto reqBr = drogon::HttpRequest::newHttpRequest();
    reqBr->addHeader("CF-IPCountry", "BR");
    EXPECT_EQ(ContextService::getLanguage(reqBr), "pt-BR");

    auto reqSa = drogon::HttpRequest::newHttpRequest();
    reqSa->addHeader("CF-IPCountry", "SA");
    EXPECT_EQ(ContextService::getLanguage(reqSa), "ar");

    auto reqAe = drogon::HttpRequest::newHttpRequest();
    reqAe->addHeader("CF-IPCountry", "AE");
    EXPECT_EQ(ContextService::getLanguage(reqAe), "ar");

    auto reqEg = drogon::HttpRequest::newHttpRequest();
    reqEg->addHeader("CF-IPCountry", "EG");
    EXPECT_EQ(ContextService::getLanguage(reqEg), "ar");
}

TEST(ContextServiceTest, DefaultToEnglish) {
    auto req = drogon::HttpRequest::newHttpRequest();
    EXPECT_EQ(ContextService::getLanguage(req), "en");
}
