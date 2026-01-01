DB migrations helper

This folder contains a Postgres DDL migration `schema.sql` with the core tables for the Software Support Ticket System.

To apply locally (example):

1. Start Postgres (or use Docker).

2. Run:

```bash
psql -h localhost -U <dbuser> -d <dbname> -f db/migrations/schema.sql
```

Notes:
- Use a dedicated user and database for the app.
- For production, convert this to managed migrations (Flyway, Alembic, Django migrations).
- Review and adjust storage for attachments (S3 vs local) and user password hashing policies.
