-- Sample Categories and Priorities for Software Support Ticket System
-- Run this in psql or pgAdmin Query Tool
-- This will add sample categories and priorities that you can use in your tickets

-- ============================================
-- CATEGORIES
-- ============================================
-- Categories help organize tickets by type of issue
INSERT INTO categories (name, description) 
VALUES 
    ('General', 'General inquiries and support requests'),
    ('Bug Report', 'Software bugs, errors, and technical issues'),
    ('Feature Request', 'Suggestions for new features or improvements'),
    ('Technical Support', 'Technical assistance and troubleshooting'),
    ('Account Issue', 'Account-related problems (login, password, access)'),
    ('Billing', 'Billing, payment, and subscription issues'),
    ('Hardware', 'Hardware-related problems and requests'),
    ('Network', 'Network connectivity and infrastructure issues'),
    ('Security', 'Security concerns and vulnerability reports'),
    ('Documentation', 'Questions about documentation or help articles'),
    ('Performance', 'Performance issues and optimization requests'),
    ('Integration', 'Third-party integrations and API issues')
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- PRIORITIES
-- ============================================
-- Priorities help determine urgency and response time
-- Rank: Lower number = Higher priority (1 = Critical, 5 = Low)
INSERT INTO priorities (name, rank) 
VALUES 
    ('Critical', 1),    -- Highest priority - System down, security breach, data loss
    ('High', 2),        -- Urgent - Major feature broken, significant impact
    ('Medium', 3),      -- Normal - Standard issues, moderate impact
    ('Low', 4),         -- Minor - Small issues, feature requests
    ('Lowest', 5)       -- Lowest - Nice to have, cosmetic issues
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- VERIFY THE DATA
-- ============================================
-- View all categories
SELECT id, name, description FROM categories ORDER BY name;

-- View all priorities (ordered by rank - lower rank = higher priority)
SELECT id, name, rank FROM priorities ORDER BY rank;

-- Count how many tickets use each category
SELECT 
    c.name as category,
    COUNT(t.id) as ticket_count
FROM categories c
LEFT JOIN tickets t ON c.id = t.category_id
GROUP BY c.id, c.name
ORDER BY ticket_count DESC, c.name;

-- Count how many tickets use each priority
SELECT 
    p.name as priority,
    p.rank,
    COUNT(t.id) as ticket_count
FROM priorities p
LEFT JOIN tickets t ON p.id = t.priority_id
GROUP BY p.id, p.name, p.rank
ORDER BY p.rank;

-- ============================================
-- NOTES
-- ============================================
-- 1. Categories and Priorities can be managed through the Admin panel
-- 2. You can add more categories/priorities as needed
-- 3. The rank field in priorities determines the order (1 = highest priority)
-- 4. Categories and priorities are referenced by ID in tickets
-- 5. You can delete unused categories/priorities if they have no tickets assigned

