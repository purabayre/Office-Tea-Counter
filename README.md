# Tea Counter

Full-stack tea counter app with an Express/MongoDB API and a Vite React frontend.

## Project Structure

- `backend/` - Express API, Mongoose models, routes, and controllers
- `frontend/` - Vite React app
- `package.json` - backend scripts plus helper scripts for the frontend

## Setup

1. Install backend dependencies:
   ```sh
   npm install
   ```
2. Install frontend dependencies:
   ```sh
   npm --prefix frontend install
   ```
3. Create `.env` from `.env.example` and set `MONGO_URI`.

## Run

Start the API:

```sh
npm run dev
```

Start the frontend in another terminal:

```sh
npm run dev:web
```

The frontend uses `http://localhost:5000/api` by default. Set `VITE_API_BASE_URL` in `frontend/.env.local` to point it somewhere else.
