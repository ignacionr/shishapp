# Build stage
FROM debian:bookworm-slim AS builder

# Install build dependencies
RUN apt-get update && apt-get install -y \
    cmake \
    ninja-build \
    g++-13 \
    git \
    libjsoncpp-dev \
    uuid-dev \
    zlib1g-dev \
    libssl-dev \
    libsqlite3-dev \
    libpq-dev \
    pkg-config \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Set GCC 13 as default
RUN update-alternatives --install /usr/bin/gcc gcc /usr/bin/gcc-13 100 --slave /usr/bin/g++ g++ /usr/bin/g++-13

# Install Glaze (Header only, but we'll fetch a specific version)
RUN git clone https://github.com/stephenberry/glaze.git /opt/glaze && \
    cd /opt/glaze && mkdir build && cd build && cmake .. && make install

# Install Drogon
RUN git clone https://github.com/drogonframework/drogon.git /opt/drogon && \
    cd /opt/drogon && \
    git submodule update --init && \
    mkdir build && cd build && \
    cmake .. -DCMAKE_BUILD_TYPE=Release && \
    make -j$(nproc) install

# Copy source code
WORKDIR /app
COPY . .

# Build the project
WORKDIR /app/build
RUN cmake .. -GNinja -DCMAKE_BUILD_TYPE=Release -DCXX_FILESYSTEM_NO_LINK_NEEDED=ON && \
    ninja

# Final stage
FROM debian:bookworm-slim

# Install runtime dependencies
RUN apt-get update && apt-get install -y \
    libjsoncpp25 \
    libuuid1 \
    zlib1g \
    libssl3 \
    libsqlite3-0 \
    libpq5 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY --from=builder /app/build/bin/viditacafe-backend .
COPY --from=builder /app/config.json .
# The www folder is handled by the CD workflow separately

EXPOSE 8080

CMD ["./viditacafe-backend"]
