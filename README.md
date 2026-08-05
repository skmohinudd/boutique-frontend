# boutique-frontend

Provides the customer-facing Boutique web application.

## Overview

- **Type:** React frontend
- **Stack:** React, Vite, Node.js, Docker

## Flow

```text
Client / service → Controller → Business logic → Database / events / downstream services
```

## Configuration

```text
TARGETARCH
TARGETOS
```

## Run

```bash
cd react-app
npm ci
npm run dev
```

## Docker

```bash
docker build -t boutique-frontend:local .
```

## CI/CD

This repository is built and deployed independently through its own GitHub Actions workflow.
