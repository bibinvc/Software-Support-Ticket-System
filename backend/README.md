Backend (Node + Express) README

Quick start (after installing Node.js):

1. Create .env from .env.example and adjust values.

2. Install:

```bash
cd backend
npm install
```

3. Start (dev):

```bash
npm run dev
```

Notes:
- Uses Postgres via `DATABASE_URL`; for quick testing you can run a local Postgres or change the connection string in `src/models/index.js`.
- JWT secret is required in `.env`.
- File uploads are stored in the `uploads/` folder by default.
