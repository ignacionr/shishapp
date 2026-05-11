{
  description = "Web development environment for Vidita Cafe";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = import nixpkgs { inherit system; };
        
        shishapp-web = pkgs.stdenv.mkDerivation {
          pname = "shishapp-web";
          version = "1.0.0";
          src = ./.;
          
          buildInputs = [ pkgs.nodejs_22 ];
          
          buildPhase = ''
            export HOME=$PWD
            npm install
            npm run build
          '';
          
          installPhase = ''
            mkdir -p $out
            cp -r out/* $out/
          '';
        };
      in
      {
        packages.default = shishapp-web;
        
        devShells.default = pkgs.mkShell {
          buildInputs = [
            pkgs.nodejs_22
          ];

          shellHook = ''
            export PATH="$PWD/node_modules/.bin:$PATH"
            echo "Vidita Cafe Web Development Environment Loaded"
            node --version
            npm --version
          '';
        };
      });
}
