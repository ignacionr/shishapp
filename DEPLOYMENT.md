# MyShisha.vip Deployment Documentation

## Current Infrastructure
- **Server**: `root@vidita1` (Ubuntu 24.04 LTS with Nix installed)
- **Application Path**: `/opt/myshisha`
- **Port**: 8100
- **Reverse Proxy**: Cloudflare Tunnel (`cloudflared`)
- **Systemd Service**: `myshisha.service`
- **Database**: PostgreSQL (local on the same server)

## Components
- **Backend**: C++ Drogon application. Built using Nix (`backend/flake.nix`).
- **Web**: Next.js static export. Built using Nix (`web/flake.nix`).
- **Integration**: The backend serves the web content from its `www` directory (mapped to `/opt/myshisha/backend/www`).

## Manual Deployment Process (Observed)
1. Files are placed in `/opt/myshisha`.
2. Backend is built using Nix, resulting in a binary in `backend/result/bin/myshisha-backend`.
3. Web app is built using Nix, resulting in a static export.
4. Static export is placed in `backend/www`.
5. Service is restarted: `systemctl restart myshisha`.

## Continuous Deployment (Planned)
GitHub Actions will:
1. Build the backend and web using Nix.
2. Rsync the artifacts to the server.
3. Restart the systemd service.
