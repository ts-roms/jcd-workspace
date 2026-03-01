# Troubleshooting Guide

## Login Page Keeps Refreshing / Redirect Loop

If you're experiencing a redirect loop on the login page, this is usually caused by stale or expired authentication cookies. Here's how to fix it:

### Method 1: Clear Browser Cookies (Recommended)

1. Open your browser's Developer Tools (F12 or Right-click → Inspect)
2. Go to the **Application** tab (Chrome/Edge) or **Storage** tab (Firefox)
3. In the left sidebar, find **Cookies** and expand it
4. Click on `http://localhost:3000` (or your domain)
5. Delete the following cookies:
   - `accessToken`
   - `refreshToken`
6. Refresh the page (F5)

### Method 2: Clear All Site Data

**Chrome/Edge:**
1. Open Developer Tools (F12)
2. Go to Application tab
3. Click "Clear storage" in the left sidebar
4. Click "Clear site data"

**Firefox:**
1. Open Developer Tools (F12)
2. Go to Storage tab
3. Right-click on the domain
4. Select "Delete All"

### Method 3: Use Incognito/Private Mode

Open the application in an incognito/private browsing window to start with a clean session.

### Method 4: Programmatic Cookie Clearing

If you're a developer and need to clear cookies programmatically, you can:

1. Open the browser console (F12 → Console tab)
2. Run the following code:
```javascript
document.cookie.split(";").forEach(function(c) {
  document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
});
```
3. Refresh the page

## Backend Not Running

If you can't login and see network errors, make sure the NestJS API backend is running:

```bash
cd api
npm run start:dev
```

The API should be running on `http://localhost:5000`

## Environment Variables

Make sure your `.env.local` file in the `web-app` directory contains:

```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## Database Not Seeded

If you can't login with any credentials, the database might not be seeded:

```bash
cd api
npm run seed
```

Default admin credentials:
- Email: `admin@example.com`
- Password: `Admin@123456`
