{
  description = "C++ Backend development environment for Vidita Cafe";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = import nixpkgs { inherit system; };
        drogon-postgres = pkgs.drogon.override {
          postgresSupport = true;
          sqliteSupport = true;
        };

        # Wrap the override to add cmake flags if possible
        drogon-shared = drogon-postgres.overrideAttrs (old: {
          cmakeFlags = (old.cmakeFlags or []) ++ [ "-DBUILD_SHARED_LIBS=ON" ];
        });

        shishapp-backend = pkgs.stdenv.mkDerivation {
          pname = "shishapp-backend";
          version = "1.0.0";
          src = ./.;

          nativeBuildInputs = [
            pkgs.cmake
            pkgs.ninja
            pkgs.pkg-config
          ] ++ (if pkgs.stdenv.isDarwin then [] else [ pkgs.gcc14 ]);

          buildInputs = [
            drogon-shared
            pkgs.glaze
            pkgs.libuuid
            pkgs.zlib
            pkgs.sqlite
            pkgs.postgresql
            pkgs.openssl
            pkgs.gtest
            pkgs.libpq
          ] ++ (if pkgs.stdenv.isDarwin then [] else [
            pkgs.gcc14.cc.lib
          ]);

          cmakeFlags = [
            "-DCMAKE_BUILD_TYPE=Release"
            "-DBUILD_SHARED_LIBS=OFF"
            "-DCXX_FILESYSTEM_NO_LINK_NEEDED=ON"
            "-DSTD_FILESYSTEM_FOUND=ON"
          ];

          installPhase = ''
            mkdir -p $out/bin
            cp bin/shishapp-backend $out/bin/
          '';
        };

        dockerImage = pkgs.dockerTools.buildImage {
          name = "shishapp-backend";
          tag = "latest";
          contents = [
            shishapp-backend
            pkgs.cacert
            pkgs.sqlite
            pkgs.postgresql.lib
            pkgs.libuuid
            pkgs.zlib
            pkgs.openssl
          ];
          config = {
            Cmd = [ "${shishapp-backend}/bin/shishapp-backend" ];
            WorkingDir = "/opt/shishapp";
            ExposedPorts = { "8080/tcp" = {}; };
          };
        };
      in
      {
        packages.default = shishapp-backend;
        packages.dockerImage = dockerImage;
        
        devShells.default = pkgs.mkShell {
          buildInputs = [
            pkgs.cmake
            drogon-postgres
            pkgs.glaze
            pkgs.libuuid
            pkgs.zlib
            pkgs.gtest
            pkgs.sqlite
            pkgs.gdb
            pkgs.ninja
            pkgs.postgresql
            pkgs.pkg-config
          ] ++ (if pkgs.stdenv.isDarwin then [] else [
            pkgs.gcc14
            pkgs.gcc14.cc.lib
          ]);

          shellHook = if pkgs.stdenv.isDarwin then ''
            echo "Vidita Cafe C++ Backend Development Environment Loaded (Darwin)"
            cmake --version
          '' else ''
            export LD_LIBRARY_PATH="${pkgs.lib.makeLibraryPath [ pkgs.gcc14.cc.lib ]}:$LD_LIBRARY_PATH"
            export CC=${pkgs.gcc14}/bin/gcc
            export CXX=${pkgs.gcc14}/bin/g++
            echo "Vidita Cafe C++ Backend Development Environment Loaded (Linux)"
            cmake --version
          '';
        };
      });
}
