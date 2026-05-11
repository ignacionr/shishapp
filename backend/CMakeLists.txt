cmake_minimum_required(VERSION 3.10)
project(shishapp-backend CXX)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

if(CMAKE_SYSTEM_NAME STREQUAL "Linux")
    set(CMAKE_REQUIRED_LIBRARIES stdc++fs)
endif()

# Find dependencies
find_package(glaze REQUIRED)
find_package(GTest REQUIRED)
find_package(Threads REQUIRED)
find_package(PostgreSQL REQUIRED)

find_package(Drogon REQUIRED)

# Force shared linking for core dependencies
set(BUILD_SHARED_LIBS ON)

# Include directories
include_directories(${PROJECT_SOURCE_DIR}/src)
include_directories(${PROJECT_SOURCE_DIR}/src/models)

# Source files
file(GLOB_RECURSE SOURCES "src/*.cpp")

# Main executable
add_executable(${PROJECT_NAME} ${SOURCES})
target_link_libraries(${PROJECT_NAME} PRIVATE 
    Drogon::Drogon
    glaze::glaze
    PostgreSQL::PostgreSQL
)

if(CMAKE_SYSTEM_NAME STREQUAL "Linux")
    target_link_libraries(${PROJECT_NAME} PRIVATE 
        stdc++fs
        -Wl,--whole-archive Drogon::Drogon -Wl,--no-whole-archive
    )
endif()

# Set the output directory for the binary
set_target_properties(${PROJECT_NAME} PROPERTIES
    RUNTIME_OUTPUT_DIRECTORY ${CMAKE_BINARY_DIR}/bin
)

# Testing
enable_testing()
file(GLOB_RECURSE TEST_SOURCES "tests/*.cpp")
# Filter out main.cpp from TEST_SOURCES if needed, but here we just need controllers
set(CORE_SOURCES ${SOURCES})
list(REMOVE_ITEM CORE_SOURCES "${PROJECT_SOURCE_DIR}/src/main.cpp")

add_executable(shishapp_tests ${TEST_SOURCES} ${CORE_SOURCES})
target_link_libraries(shishapp_tests PRIVATE 
    Drogon::Drogon
    glaze::glaze
    PostgreSQL::PostgreSQL
    GTest::GTest
    GTest::Main
)

# Set the output directory for tests
set_target_properties(shishapp_tests PROPERTIES
    RUNTIME_OUTPUT_DIRECTORY ${CMAKE_BINARY_DIR}/bin
)
