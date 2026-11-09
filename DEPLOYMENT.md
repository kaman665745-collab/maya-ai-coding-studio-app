# Maya AI Coding Studio — Production Deployment Guide

## 1. Overview
Maya AI Coding Studio is deployed as a single containerized application running Node.js 22 and Express 4, serving both the backend REST APIs and the compiled Vite frontend SPA on port 3000.

---

## 2. Environment Variables

| Variable | Description | Example / Required |
|----------|-------------|-------------------|
| `PORT` | Listening port for Express | `3000` |
| `NODE_ENV` | Runtime environment mode | `production` |
| `GEMINI_API_KEY` | Google Gemini AI API Key | Required for server-side agent execution |
| `APP_URL` | Application root URL | `https://maya-studio.run.app` |
| `SQL_HOST` | Cloud SQL PostgreSQL host | `/cloudsql/PROJECT:REGION:INSTANCE` or IP |
| `SQL_PORT` | Cloud SQL PostgreSQL port | `5432` |
| `SQL_DATABASE`| Cloud SQL database name | `postgres` |
| `SQL_USER` | Database user name | `postgres` |
| `SQL_PASSWORD`| Database user password | User secret |

---

## 3. Production Build & Execution

### 1. Build the Frontend
```bash
npm run build
```
This produces optimized production assets inside `./dist`.

### 2. Launch the Full-Stack Server
```bash
npm start
```
`package.json` specifies `"start": "node server.ts"` (or `tsx server.ts`).

---

## 4. Google Cloud Run Deployment

```bash
# 1. Build and submit container image
gcloud builds submit --tag gcr.io/PROJECT_ID/maya-studio

# 2. Deploy to Cloud Run with Cloud SQL connection
gcloud run deploy maya-studio \
  --image gcr.io/PROJECT_ID/maya-studio \
  --platform managed \
  --region asia-southeast1 \
  --allow-unauthenticated \
  --port 3000 \
  --set-env-vars NODE_ENV=production \
  --add-cloudsql-instances PROJECT_ID:asia-southeast1:ai-studio-b2276002
```

---

## 5. Security & Isolation Considerations
- **Live Preview Sandbox**: Sandboxed within `<iframe sandbox="allow-scripts allow-modals allow-forms allow-same-origin">` to prevent parent window DOM mutation or unauthorized credential access.
- **Server-Side API Key**: The `GEMINI_API_KEY` is strictly accessed server-side in `server.ts` and `src/lib/gemini.ts`. No API keys are leaked to the client browser bundle.
- **ZIP File Traversal Protection**: Project file extraction in `src/utils/zipService.ts` explicitly checks for `..` directory traversal attempts and prevents arbitrary disk writes.
