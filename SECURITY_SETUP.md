# Security Setup Guide

## Environment Variables

### Required Variables

1. **JWT_SECRET**: Secret key for signing JWT tokens
   - Generate: `openssl rand -hex 32`
   - Minimum 32 characters recommended
   - Never commit to version control

2. **ENCRYPTION_KEY**: 32-byte hex key for encrypting MFA secrets
   - Generate: `openssl rand -hex 32`
   - Must be exactly 64 hex characters (32 bytes)
   - Never commit to version control

3. **DATABASE_URL**: PostgreSQL connection string
   - Format: `postgres://username:password@host:port/database`
   - Use strong database passwords

### Setting Up Environment Variables

1. Copy the example file:
   ```bash
   cp backend/.env.example backend/.env
   ```

2. Edit `backend/.env` and set all required variables

3. Generate secure secrets:
   ```bash
   # Generate JWT_SECRET
   openssl rand -hex 32

   # Generate ENCRYPTION_KEY
   openssl rand -hex 32
   ```

4. Never commit `.env` files to version control

## HTTPS/TLS Configuration

### For Development (Self-Signed Certificate)

1. Generate self-signed certificate:
   ```bash
   openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes
   ```

2. Update `backend/src/index.js` to use HTTPS:
   ```javascript
   const https = require('https');
   const fs = require('fs');
   
   const options = {
     key: fs.readFileSync('key.pem'),
     cert: fs.readFileSync('cert.pem')
   };
   
   https.createServer(options, app).listen(PORT, () => {
     console.log(`Server running on https://localhost:${PORT}`);
   });
   ```

3. Update frontend `.env`:
   ```
   VITE_API_URL=https://localhost:4000/api
   ```

### For Production

Use a proper SSL certificate from:
- Let's Encrypt (free)
- Commercial CA
- Cloud provider (AWS, Azure, GCP)

## Security Best Practices

1. **Never commit secrets**: Use `.env` files and `.gitignore`
2. **Use strong passwords**: Database, JWT secrets, encryption keys
3. **Enable HTTPS**: Always use HTTPS in production
4. **Regular updates**: Keep dependencies updated
5. **Monitor logs**: Review audit logs regularly
6. **Backup database**: Regular backups of user data
7. **Rate limiting**: Already configured, adjust as needed
8. **MFA**: Encourage users to enable MFA

## Testing Security Controls

### SQL Injection Test
```bash
# Should be blocked/sanitized
curl -X GET "http://localhost:4000/api/services?q=' OR '1'='1"
```

### XSS Test
```bash
# Should be sanitized
curl -X POST "http://localhost:4000/api/services" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"title":"<script>alert(1)</script>","description":"test","price":10}'
```

### Authorization Test
```bash
# Should return 403 Forbidden
curl -X GET "http://localhost:4000/api/users" \
  -H "Authorization: Bearer CUSTOMER_TOKEN"
```

### Rate Limiting Test
```bash
# Send 10 rapid requests - should be rate limited after 5
for i in {1..10}; do
  curl -X POST "http://localhost:4000/api/auth/login" \
    -d '{"email":"test@test.com","password":"test"}'
done
```

## MFA Setup

1. User logs in and navigates to profile settings
2. Click "Enable MFA"
3. Scan QR code with authenticator app (Google Authenticator, Authy, etc.)
4. Enter 6-digit code to verify
5. MFA is now enabled for the account

## Audit Logs

All critical actions are logged in the `audit_logs` table:
- User registration/login
- Service creation/update/deletion
- Order creation/status changes
- Admin actions
- MFA enable/disable

View audit logs (admin only):
- API: `GET /api/audit`
- Frontend: `/admin/audit`

