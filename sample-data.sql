-- Sample Data for Software Support Ticket System
-- Run this in psql or pgAdmin Query Tool after you have at least one user

-- IMPORTANT: Replace USER_ID with your actual user ID from the users table
-- Get your user ID first:
-- SELECT id, name, email FROM users;

-- ============================================
-- 1. ADD MORE CATEGORIES (Optional)
-- ============================================
-- Note: A "General" category is already created by default
INSERT INTO categories (name, description) 
VALUES 
    ('Bug Report', 'Software bugs, errors, and technical issues'),
    ('Feature Request', 'Suggestions for new features or improvements'),
    ('Technical Support', 'Technical assistance and troubleshooting'),
    ('Account Issue', 'Account-related problems (login, password, access)'),
    ('Billing', 'Billing, payment, and subscription issues'),
    ('Hardware', 'Hardware-related problems and requests'),
    ('Network', 'Network connectivity and infrastructure issues'),
    ('Security', 'Security concerns and vulnerability reports'),
    ('Performance', 'Performance issues and optimization requests')
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- 1b. ADD MORE PRIORITIES (Optional)
-- ============================================
-- Note: Default priorities (Low, Medium, High, Critical) are already created
-- This adds a "Lowest" priority option
INSERT INTO priorities (name, rank) 
VALUES 
    ('Lowest', 5)  -- Lower priority than "Low"
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- 2. CREATE SAMPLE TICKETS
-- Replace 1 with your actual user ID
-- ============================================
INSERT INTO tickets (title, description, category_id, priority_id, status, created_by)
VALUES 
    (
        'Login button not responding',
        'When I click the login button on the homepage, nothing happens. The page does not redirect to the login page. This started happening yesterday.',
        1,  -- General category
        2,  -- Medium priority
        'Open',
        1   -- REPLACE WITH YOUR USER ID
    ),
    (
        'Password reset email not received',
        'I requested a password reset but did not receive the email. I checked spam folder as well. Please help.',
        4,  -- Account Issue category
        2,  -- Medium priority
        'Open',
        1   -- REPLACE WITH YOUR USER ID
    ),
    (
        'Feature: Dark mode support',
        'It would be great to have a dark mode option for the application. This would help reduce eye strain during night usage.',
        2,  -- Feature Request category
        1,  -- Low priority
        'Open',
        1   -- REPLACE WITH YOUR USER ID
    ),
    (
        'Payment failed but card was charged',
        'I tried to make a payment but got an error message. However, my credit card was charged. Please refund or complete the transaction.',
        5,  -- Billing category
        4,  -- Critical priority
        'Open',
        1   -- REPLACE WITH YOUR USER ID
    ),
    (
        'Error 500 on dashboard page',
        'Every time I try to access the dashboard, I get an error 500. This is preventing me from accessing my account.',
        1,  -- Bug category
        3,  -- High priority
        'In Progress',
        1   -- REPLACE WITH YOUR USER ID
    );

-- ============================================
-- 3. CREATE SAMPLE COMMENTS
-- Replace ticket IDs and user IDs with actual values
-- ============================================
-- Get ticket IDs first:
-- SELECT id, title FROM tickets;

INSERT INTO ticket_comments (ticket_id, user_id, message, is_internal)
VALUES 
    (
        1,  -- ticket_id (first ticket)
        1,  -- user_id (your user id)
        'I have tried clearing my browser cache and using a different browser, but the issue persists.',
        false  -- visible to client
    ),
    (
        5,  -- ticket_id (Error 500 ticket)
        1,  -- user_id (your user id)
        'This is urgent. I need access to my account immediately.',
        false
    );

-- ============================================
-- 4. VIEW YOUR DATA
-- ============================================
-- View all tickets
SELECT 
    t.id,
    t.title,
    t.status,
    p.name as priority,
    c.name as category,
    u.name as creator,
    t.created_at
FROM tickets t
LEFT JOIN priorities p ON t.priority_id = p.id
LEFT JOIN categories c ON t.category_id = c.id
LEFT JOIN users u ON t.created_by = u.id
ORDER BY t.created_at DESC;

-- Count tickets by status
SELECT status, COUNT(*) as count
FROM tickets
GROUP BY status
ORDER BY count DESC;

-- View tickets with comments count
SELECT 
    t.id,
    t.title,
    t.status,
    COUNT(tc.id) as comment_count
FROM tickets t
LEFT JOIN ticket_comments tc ON t.id = tc.ticket_id
GROUP BY t.id, t.title, t.status
ORDER BY t.created_at DESC;

