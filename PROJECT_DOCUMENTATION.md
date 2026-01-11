# Sharing Economy Platform - Technical Documentation

## 1. System Description and Functional Requirements

### 1.1 Project Overview
The Sharing Economy Platform is a secure web-based marketplace that enables the exchange of services between three main user types:
- **Service Providers**: Users who offer services (e.g., cleaning, tutoring, repair, delivery)
- **Customers/Clients**: Users who request and purchase services
- **Platform Administrator**: Manages the platform, monitors activity, and ensures compliance

### 1.2 Functional Requirements

#### 1.2.1 Authentication & Authorization
- User registration with role selection (Customer or Provider)
- Secure login with JWT-based authentication
- Multi-Factor Authentication (MFA) using TOTP (Time-based One-Time Password)
- Role-based access control (RBAC) with three roles: customer, provider, admin
- Secure session management with token revocation
- Password requirements: minimum 8 characters, uppercase, lowercase, and number

#### 1.2.2 Service Listing
- Providers can create, update, and manage service listings
- Services include: title, description, category, price, currency, duration, location
- Service status management: active, inactive, suspended (admin only)
- Public browsing of available services with search and filtering
- Category-based organization of services

#### 1.2.3 Order Workflow
The order workflow follows a defined business logic:
1. **Pending**: Customer places order, awaiting provider confirmation
2. **Confirmed**: Provider accepts the order
3. **In Progress**: Provider starts working on the order
4. **Completed**: Provider marks order as complete
5. **Cancelled**: Either party can cancel (with restrictions)

**Business Rules:**
- Only customers can create orders
- Only providers can confirm and complete their orders
- Customers can cancel pending/confirmed orders
- Providers can cancel pending/confirmed orders
- Completed orders cannot be cancelled
- Both parties can rate and review after completion

#### 1.2.4 Administrator Dashboard
- User management: view, create, update, activate/deactivate users
- Category management: create, update, delete service categories
- Platform statistics: user counts, service counts, order statistics
- Audit log viewing: track all platform activities
- Service moderation: suspend services if needed

### 1.3 Technologies Used

#### Backend
- **Node.js** (v16+): Runtime environment
- **Express.js** (v4.18): Web framework
- **PostgreSQL** (v12+): Relational database
- **Sequelize** (v6.31): ORM for database operations
- **JWT** (jsonwebtoken v9.0): Authentication tokens
- **bcrypt** (v5.1): Password hashing (12 rounds)
- **otplib** (v12.0): TOTP-based MFA
- **express-validator** (v7.0): Input validation
- **express-rate-limit** (v7.1): Rate limiting
- **helmet** (v7.1): Security headers
- **multer** (v1.4): File upload handling

#### Frontend
- **React** (v18.2): UI framework
- **React Router** (v6.14): Client-side routing
- **Vite** (v5.1): Build tool and dev server
- **TailwindCSS** (v3.4): Utility-first CSS framework
- **DaisyUI** (v2.51): TailwindCSS component library
- **Axios** (v1.4): HTTP client

#### Security Libraries
- **crypto** (Node.js built-in): Encryption for MFA secrets
- **validator** (v13.11): Input sanitization

## 2. Architecture Diagram

### 2.1 System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (React)                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │   Home   │  │ Services │  │  Orders  │  │  Admin    │  │
│  │   Page   │  │   Page   │  │   Page   │  │ Dashboard │  │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘  │
│       │             │              │              │         │
│       └─────────────┴──────────────┴──────────────┘         │
│                          │                                  │
│                    API Service Layer                        │
└──────────────────────────┼──────────────────────────────────┘
                           │ HTTPS/TLS
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend (Express.js)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │   Routes     │  │  Middleware   │  │    Models     │    │
│  │              │  │              │  │               │    │
│  │ - Auth       │  │ - Auth       │  │ - User        │    │
│  │ - Services   │  │ - Validation │  │ - Service     │    │
│  │ - Orders     │  │ - Security    │  │ - Order       │    │
│  │ - Users      │  │ - Rate Limit │  │ - Category    │    │
│  │ - Categories │  │ - MFA        │  │ - AuditLog    │    │
│  └──────┬───────┘  └──────┬───────┘  └──────┬────────┘    │
│         │                 │                  │              │
│         └─────────────────┴──────────────────┘              │
│                          │                                   │
└──────────────────────────┼───────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                  Database (PostgreSQL)                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  users   │  │ services │  │  orders  │  │categories │   │
│  │          │  │          │  │          │  │           │   │
│  │ - MFA    │  │ - Pricing│  │ - Status │  │ - Icons   │   │
│  │ - Roles  │  │ - Status │  │ - Rating │  │           │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                │
│  │order_msgs│  │attachments│  │audit_logs │                │
│  └──────────┘  └──────────┘  └──────────┘                │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Component Model

**Frontend Components:**
- Header: Navigation and user menu
- Footer: Platform information
- ProtectedRoute: Route guard for authentication
- Home: Landing page with service overview
- Services: Service listing and search
- ServiceDetail: Individual service view and ordering
- Dashboard: Role-based dashboard (customer/provider/admin)
- Login/Register: Authentication pages
- AdminUsers: User management (admin only)
- AdminCategories: Category management (admin only)
- AdminAuditLogs: Audit log viewer (admin only)

**Backend Components:**
- Routes: API endpoint handlers
- Middleware: Authentication, validation, security, MFA
- Models: Database models with Sequelize ORM
- Services: Business logic layer

### 2.3 Data Flow Diagram (DFD)

```
User Input → Frontend Validation → API Request → Rate Limiting
    ↓
Authentication Middleware → Authorization Check → Input Validation
    ↓
Business Logic → Database Query (Sequelize ORM) → SQL Injection Protection
    ↓
Response Sanitization → Output Encoding → JSON Response
    ↓
Frontend Display → XSS Protection
```

## 3. Threat Modeling - STRIDE Analysis

### 3.1 STRIDE Methodology
STRIDE is a threat modeling framework that categorizes threats into six categories:
- **S**poofing: Impersonating another user or system
- **T**ampering: Unauthorized modification of data
- **R**epudiation: Denying actions performed
- **I**nformation Disclosure: Unauthorized access to information
- **D**enial of Service: Disrupting service availability
- **E**levation of Privilege: Gaining unauthorized access

### 3.2 Selected Threats (One per Category)

#### Threat 1: Spoofing - Session Token Theft
**Description**: An attacker steals a user's JWT token to impersonate them.

**Attack Vector**: 
- XSS attack injecting malicious script to steal tokens from localStorage
- Man-in-the-Middle (MITM) attack intercepting unencrypted HTTP traffic
- Token leakage through browser history or logs

**Impact**: 
- Unauthorized access to user accounts
- Ability to perform actions as the victim
- Potential financial loss (for orders)

**Mitigation**:
1. **HTTPS/TLS Enforcement**: All communication encrypted in transit
2. **Secure Token Storage**: Tokens stored in httpOnly cookies (alternative) or secure localStorage
3. **Token Expiration**: Short-lived tokens (7 days) with refresh mechanism
4. **Session Management**: Token revocation on logout, session tracking in database
5. **Content Security Policy (CSP)**: Prevents XSS attacks via CSP headers
6. **Input Sanitization**: All user inputs sanitized to prevent XSS

**Implementation**:
- Helmet.js configured with CSP headers
- Token hashing and storage in `user_sessions` table
- Automatic token revocation on logout
- Input validation middleware using express-validator

#### Threat 2: Tampering - SQL Injection
**Description**: An attacker injects malicious SQL code to manipulate database queries.

**Attack Vector**:
- User input directly concatenated into SQL queries
- Vulnerable endpoints accepting unsanitized input
- Exploitation of dynamic query construction

**Impact**:
- Unauthorized data access, modification, or deletion
- Bypass of authentication
- Complete database compromise

**Mitigation**:
1. **Parameterized Queries**: Sequelize ORM uses parameterized queries by default
2. **Input Validation**: All inputs validated using express-validator
3. **Type Checking**: Strict type validation on all API endpoints
4. **ORM Abstraction**: No raw SQL queries; all database access through Sequelize
5. **Least Privilege**: Database user has minimal required permissions

**Implementation**:
- Sequelize ORM prevents SQL injection through parameterized queries
- Input validation middleware validates all request data
- Type checking ensures data types match expected schema

#### Threat 3: Repudiation - Audit Log Tampering
**Description**: A user or attacker denies performing actions by tampering with audit logs.

**Attack Vector**:
- Direct database access to modify audit logs
- Application vulnerability allowing log modification
- Insufficient logging of critical actions

**Impact**:
- Inability to prove malicious actions
- Compliance violations
- Loss of accountability

**Mitigation**:
1. **Immutable Audit Logs**: Audit logs are append-only, never modified
2. **Comprehensive Logging**: All critical actions logged (create, update, delete, login, etc.)
3. **Access Control**: Only admins can view audit logs; no modification allowed
4. **Cryptographic Integrity**: Optional: Hash chain or digital signatures for log integrity
5. **Separate Audit Database**: Store audit logs in separate, restricted database

**Implementation**:
- `audit_logs` table with no UPDATE/DELETE permissions
- All critical operations call `createAuditLog()` function
- Audit logs include: entity type, entity ID, action, user ID, IP address, timestamp, payload
- Admin-only access to audit log viewing

#### Threat 4: Information Disclosure - Sensitive Data Exposure
**Description**: Unauthorized access to sensitive user data (passwords, MFA secrets, personal information).

**Attack Vector**:
- Insecure API endpoints returning sensitive data
- Insufficient access control on user data
- Database exposure through misconfiguration
- Logging sensitive data in error messages

**Impact**:
- Identity theft
- Account compromise
- Privacy violations
- Regulatory fines (GDPR, etc.)

**Mitigation**:
1. **Password Hashing**: bcrypt with 12 rounds; passwords never stored in plaintext
2. **MFA Secret Encryption**: AES-256-GCM encryption for MFA secrets
3. **Data Minimization**: Only return necessary data in API responses
4. **Access Control**: Users can only access their own data (except admins)
5. **Environment Variables**: Sensitive keys stored in .env, never committed
6. **Response Filtering**: Model `toJSON()` methods exclude sensitive fields

**Implementation**:
- User model excludes `password_hash` and `mfa_secret` from JSON responses
- MFA secrets encrypted using AES-256-GCM with key from environment
- Role-based access control on all endpoints
- Environment variables for JWT_SECRET, ENCRYPTION_KEY, DATABASE_URL

#### Threat 5: Denial of Service - Rate Limiting Bypass
**Description**: An attacker overwhelms the server with excessive requests, making it unavailable.

**Attack Vector**:
- Distributed Denial of Service (DDoS) attack
- Brute force login attempts
- Resource-intensive API calls
- No rate limiting on endpoints

**Impact**:
- Service unavailability
- Performance degradation
- Resource exhaustion
- Financial loss

**Mitigation**:
1. **Rate Limiting**: Different limits for different endpoints
   - Authentication: 5 requests per 15 minutes
   - General API: 100 requests per 15 minutes
   - Strict endpoints: 10 requests per hour
2. **Request Size Limits**: Maximum 10MB for file uploads, JSON payloads
3. **Database Connection Pooling**: Sequelize connection pooling prevents exhaustion
4. **Input Validation**: Prevents resource-intensive queries
5. **Caching**: Optional: Cache frequently accessed data

**Implementation**:
- `express-rate-limit` middleware on all routes
- Different rate limiters for auth, API, and strict endpoints
- File upload size validation (10MB max)
- Connection pooling configured in Sequelize

#### Threat 6: Elevation of Privilege - Role-Based Access Control Bypass
**Description**: An attacker gains unauthorized access to admin functions or accesses data they shouldn't.

**Attack Vector**:
- JWT token manipulation to change role
- Insufficient authorization checks on endpoints
- Direct API calls bypassing frontend restrictions
- Privilege escalation through bugs

**Impact**:
- Unauthorized access to admin functions
- Data breach
- Platform manipulation
- Service disruption

**Mitigation**:
1. **JWT Signature Verification**: Tokens signed with secret; tampering detected
2. **Role-Based Middleware**: `requireRole()` middleware on all protected endpoints
3. **Server-Side Validation**: All authorization checks on server, not just frontend
4. **Principle of Least Privilege**: Users have minimum required permissions
5. **Token Payload Validation**: Role verified on every request
6. **Audit Logging**: All privilege escalations logged

**Implementation**:
- `requireRole()` middleware checks user role before allowing access
- JWT tokens include role, verified on each request
- All admin endpoints protected with `requireRole(['admin'])`
- Provider/customer endpoints check ownership or role
- Audit logs track all access attempts

## 4. Security Measures and Controls

### 4.1 Authentication Security
- **Password Storage**: bcrypt hashing with 12 rounds
- **MFA Support**: TOTP-based multi-factor authentication
- **Session Management**: JWT tokens with expiration and revocation
- **Login Protection**: Rate limiting on login endpoints (5 attempts per 15 min)
- **Password Requirements**: Minimum 8 characters, uppercase, lowercase, number

### 4.2 Authorization
- **RBAC Implementation**: Three roles (customer, provider, admin)
- **Middleware Enforcement**: `requireRole()` middleware on all protected routes
- **Ownership Checks**: Users can only access their own resources
- **Admin-Only Functions**: Category management, user management, audit logs

### 4.3 Input Validation and Injection Protections
- **express-validator**: All inputs validated and sanitized
- **SQL Injection Prevention**: Sequelize ORM with parameterized queries
- **XSS Prevention**: Input sanitization and output encoding
- **File Upload Validation**: Type and size restrictions
- **Type Checking**: Strict validation of data types

### 4.4 Encryption and Secret Management
- **MFA Secret Encryption**: AES-256-GCM encryption
- **Environment Variables**: Sensitive keys in .env file
- **Password Hashing**: bcrypt (one-way hashing)
- **Token Hashing**: SHA-256 for session tokens in database

### 4.5 Secure Communication
- **HTTPS/TLS**: Required for production (self-signed cert acceptable for demo)
- **CORS Configuration**: Restricted to frontend URL
- **Security Headers**: Helmet.js configured with CSP, HSTS, etc.
- **Secure Cookies**: httpOnly, secure flags (if using cookies)

### 4.6 Secure Backend API Practices
- **Rate Limiting**: Prevents DoS and brute force
- **Error Handling**: Generic error messages (no stack traces in production)
- **Audit Logging**: All critical actions logged
- **Input Sanitization**: All user inputs sanitized
- **Output Encoding**: All outputs properly encoded

## 5. Project Management

### 5.1 Development Approach
- **Agile Methodology**: Iterative development with security focus
- **Version Control**: Git with feature branches
- **Code Review**: Security-focused code reviews
- **Testing**: Manual security testing and validation

### 5.2 Security Development Lifecycle (Secure SDLC)
1. **Requirements**: Security requirements defined upfront
2. **Design**: Threat modeling using STRIDE
3. **Implementation**: Secure coding practices
4. **Testing**: Security testing and validation
5. **Deployment**: Secure deployment practices
6. **Maintenance**: Ongoing security monitoring

### 5.3 Deliverables
- ✅ Source code (GitHub repository)
- ✅ Technical documentation (this document)
- ✅ Video presentation (8-12 minutes)
- ✅ STRIDE threat analysis (6 threats, one per category)
- ✅ Security controls implementation

## 6. Deployment Considerations

### 6.1 Environment Variables
Required environment variables:
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret for JWT token signing (min 32 characters)
- `ENCRYPTION_KEY`: 32-byte hex key for MFA secret encryption
- `PORT`: Server port (default: 4000)
- `FRONTEND_URL`: Frontend URL for CORS
- `UPLOAD_DIR`: Directory for file uploads
- `NODE_ENV`: Environment (development/production)

### 6.2 HTTPS/TLS Setup
For production:
1. Generate self-signed certificate (for demo) or use Let's Encrypt (for production)
2. Configure Express to use HTTPS
3. Redirect HTTP to HTTPS
4. Update frontend API URL to use HTTPS

### 6.3 Database Security
- Use strong database passwords
- Restrict database access to application server only
- Regular backups
- Audit log table with restricted permissions

## 7. Testing and Validation

### 7.1 Security Testing Scenarios
1. **SQL Injection Test**: Attempt SQL injection in search fields
2. **XSS Test**: Inject script tags in user inputs
3. **Authentication Bypass**: Attempt to access protected endpoints without token
4. **Authorization Bypass**: Attempt to access admin functions as regular user
5. **Rate Limiting Test**: Send excessive requests to test rate limits
6. **MFA Bypass**: Attempt to login without MFA when enabled

### 7.2 Functional Testing
- User registration and login
- Service creation and management
- Order workflow (pending → confirmed → in_progress → completed)
- Admin dashboard functionality
- Search and filtering

## 8. Conclusion

This Sharing Economy Platform implements comprehensive security controls following Secure SDLC principles. The STRIDE threat analysis identified six critical threats, each with specific mitigations implemented in the codebase. The platform provides a secure foundation for service exchange while protecting user data and maintaining system integrity.

---

**Document Version**: 1.0  
**Last Updated**: January 2025  
**Authors**: Development Team

