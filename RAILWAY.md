# Railway Deployment Guide

## Prerequisites

- [Railway CLI](https://docs.railway.app/guides/cli) installed (`npm i -g @railway/cli`)
- Railway account (https://railway.app)
- Git repository pushed to GitHub

## Project Setup

### 1. Create Railway Project

```bash
railway login
railway init
```

### 2. Add MongoDB

In the Railway dashboard, click **+ New** → **Database** → **MongoDB**.

Copy the `MONGODB_URI` connection string from the MongoDB service variables.

### 3. Create API Service

In the Railway dashboard:

1. Click **+ New** → **GitHub Repo** → select this repository
2. Rename the service to `api`
3. Go to **Settings**:
   - Set **Dockerfile Path** to `Dockerfile.api`
4. Go to **Variables** and add:

```
PORT=5000
MONGODB_URI=<from MongoDB service, use variable reference: ${{MongoDB.MONGODB_URL}}>
JWT_SECRET=<generate a secure 64-char string>
JWT_REFRESH_SECRET=<generate a different secure 64-char string>
JWT_ACCESS_TOKEN_EXPIRATION=15m
JWT_REFRESH_TOKEN_EXPIRATION_SHORT=7d
JWT_REFRESH_TOKEN_EXPIRATION_LONG=30d
FRONTEND_URL=<will be set after web service is deployed>
NODE_ENV=production
```

### 4. Create Web Service

1. Click **+ New** → **GitHub Repo** → select the same repository
2. Rename the service to `web`
3. Go to **Settings**:
   - Set **Dockerfile Path** to `Dockerfile.web`
4. Go to **Variables** and add:

```
PORT=3000
NEXT_PUBLIC_API_URL=<API service public URL, e.g., https://api-production-xxxx.up.railway.app/api>
NODE_ENV=production
```

### 5. Generate Domains

For each service, go to **Settings** → **Networking** → **Generate Domain**.

### 6. Update CORS

After both services have domains, update the API service's `FRONTEND_URL` variable with the web service's public URL.

## Environment Variable References

Railway supports referencing variables from other services:

- In the API service, set `MONGODB_URI` to `${{MongoDB.MONGODB_URL}}`
- This auto-updates if the database URL changes

## Deploying

Railway auto-deploys on every push to your default branch. You can also trigger manual deploys:

```bash
railway up
```

## Running Migrations & Seeds

Use Railway CLI to run one-off commands:

```bash
# Connect to the API service
railway link
railway service api

# Run migrations
railway run npm run api:migrate

# Seed initial data
railway run npm run api:seed
```

## Monitoring

- View logs: Railway dashboard → select service → **Logs**
- API docs: `https://<api-domain>/api/docs`

## Troubleshooting

- **Build fails**: Check that `package-lock.json` is committed
- **MongoDB connection fails**: Verify `MONGODB_URI` variable reference is correct
- **CORS errors**: Ensure `FRONTEND_URL` on the API matches the web service domain exactly
- **Next.js 404s**: Ensure `output: "standalone"` is set in `next.config.ts`
