# LDSChurch.Stream

A tool to help congregations of The Church of Jesus Christ of Latter-Day Saints provide YouTube streams of their sacrament meetings.

## Quick Start

### Development Setup

1. **Prerequisites**
   - Docker and Docker Compose
   - Node.js 18+ (for local development)

2. **Start Development Environment**

   ```bash
   docker compose up --watch
   ```

3. **Access Applications**
   - Landing Page: http://ldschurch.traefik.me
   - Stream Dashboard: http://dashboard.traefik.me
   - API Documentation: http://api.traefik.me/api/docs
   - Database Admin: http://db.traefik.me
   - Email Testing: http://mail.traefik.me
   - OBS Proxy: http://obs-proxy.traefik.me
   - Stream Access: http://blacksburg-va.traefik.me (example)

### Production Deployment

Deploy to Kubernetes cluster:

```bash
kubectl apply -f k8s/
```

## Architecture

- **API**: Node.js/Express backend with MongoDB
- **Dashboard**: React app for stream specialists
- **Access**: React app for stream attendees (subdomain-based)
- **Landing**: Marketing/info site

```mermaid
graph TB
    %% External Services
    YT[YouTube API]
    SG[SendGrid API]

    %% Load Balancer
    TR[Traefik Proxy]

    %% Frontend Applications
    LAND[Landing Page<br/>React + Vite]
    DASH[Dashboard<br/>React + Vite]
    ACC[Access App<br/>React + Vite]

    %% Backend Services
    API[API Service<br/>Node.js + Express]
    OBS[OBS Proxy<br/>WebSocket Service]

    %% Data Layer
    DB[(MongoDB)]

    %% Mock Services (Development)
    YTM[YouTube Mock]
    SGM[SendGrid Mock]
    MH[MailHog]

    %% User Interactions
    USERS[Stream Attendees] --> TR
    SPEC[Stream Specialists] --> TR
    ADMIN[Global Admins] --> TR

    %% Routing
    TR --> LAND
    TR --> DASH
    TR --> ACC
    TR --> API
    TR --> OBS

    %% API Dependencies
    API --> DB
    API --> YT
    API --> SG

    %% Development Mocks
    API -.-> YTM
    API -.-> SGM
    API -.-> MH

    %% WebSocket Connections
    OBS -.-> DASH

    %% Styling
    classDef frontend fill:#e1f5fe
    classDef backend fill:#f3e5f5
    classDef data fill:#e8f5e8
    classDef external fill:#fff3e0
    classDef mock fill:#fce4ec,stroke-dasharray: 5 5

    class LAND,DASH,ACC frontend
    class API,OBS backend
    class DB data
    class YT,SG external
    class YTM,SGM,MH mock
```

## Key Features

- YouTube Live stream management
- Remote OBS control via WebSocket proxy
- Automated attendance reporting
- Subdomain-based unit access
- Weekly email reports to leadership
- Automated stream cleanup (24-hour retention)

## Church Guidelines Compliance

- Stream recordings deleted within 24 hours
- Unlisted YouTube events for privacy
- Honesty-based attendance (no identity verification)

---

**Note**: This is not an official product of The Church of Jesus Christ of Latter-Day Saints.
