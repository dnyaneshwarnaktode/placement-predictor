# College Placement Prediction System - Deployment Guide

This guide covers how to deploy the three components of the system:
1.  **Database**: MongoDB Atlas
2.  **ML Service**: Python/FastAPI (Render)
3.  **Backend**: Node.js/Express (Render)
4.  **Frontend**: Next.js (Vercel)

---

## Prerequisite: Environment Variables
You will need to gather these values:
- `MONGO_URI`: Your MongoDB connection string.
- `JWT_SECRET`: A random string for security.
- `ML_SERVICE_URL`: URL of the deployed ML service (after Step 2).
- `NEXT_PUBLIC_API_URL`: URL of the deployed Backend (after Step 3).

---

## Step 1: Database (MongoDB Atlas)
1.  Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2.  Create a free cluster.
3.  Create a database user (e.g., `admin`).
4.  Get the Connection String (driver Node.js).
    - Format: `mongodb+srv://<username>:<password>@cluster0.mongodb.net/?retryWrites=true&w=majority`
5.  Allow Network Access from Anywhere (`0.0.0.0/0`).

---

## Step 2: ML Service (Render)
*Host the Python FastAPI service.*

1.  Push your code to GitHub.
2.  Go to [Render](https://render.com) > **New Web Service**.
3.  Connect your repo.
4.  **Root Directory**: `ml-service`
5.  **Build Command**: `pip install -r requirements.txt`
6.  **Start Command**: `cd src && uvicorn main:app --host 0.0.0.0 --port $PORT`
7.  Click **Create Web Service**.
8.  **Copy the URL** (e.g., `https://ml-service.onrender.com`). This is your `ML_SERVICE_URL`.

---

## Step 3: Backend (Render)
*Host the Node.js Express server.*

1.  Go to Render > **New Web Service**.
2.  Connect your repo.
3.  **Root Directory**: `backend`
4.  **Build Command**: `npm install`
5.  **Start Command**: `npm start`
6.  **Environment Variables**:
    - `MONGO_URI`: (From Step 1)
    - `JWT_SECRET`: (Your random secret)
    - `ML_SERVICE_URL`: (From Step 2, e.g., `https://ml-service.onrender.com`)
    - `PORT`: `10000` (Render sets this auto, but good to know)
7.  Click **Create Web Service**.
8.  **Copy the URL** (e.g., `https://college-backend.onrender.com`). This is your `NEXT_PUBLIC_API_URL`.

---

## Step 4: Frontend (Vercel)
*Host the Next.js Client.*

1.  Go to [Vercel](https://vercel.com) > **Add New Project**.
2.  Import your GitHub repo.
3.  **Root Directory**: Edit and select `frontend`.
4.  **Environment Variables**:
    - `NEXT_PUBLIC_API_URL`: (From Step 3, e.g., `https://college-backend.onrender.com`)
5.  Click **Deploy**.

---

## Troubleshooting

### CORS Issues
If you see CORS errors in the frontend console:
1.  Go to your **Backend Code** (`backend/src/server.js`).
2.  Update the `cors` configuration to allow your Vercel domain.
    ```javascript
    app.use(cors({
        origin: ['http://localhost:3000', 'https://your-vercel-app.vercel.app'],
        credentials: true
    }));
    ```
3.  Commit and Push. Render will auto-redeploy.

### ML Service 503/Timeout
The free tier of Render spins down after inactivity. The first request might take 50+ seconds.
- Use a service like **UptimeRobot** to ping your ML Service URL every 5 minutes to keep it awake.
