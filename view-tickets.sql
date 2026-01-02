-- SQL queries to view tickets in the database
-- Run these in psql or pgAdmin Query Tool

-- View all tickets with details
SELECT 
    t.id,
    t.title,
    t.description,
    t.status,
    t.created_at,
    u.name as creator_name,
    u.email as creator_email,
    p.name as priority,
    c.name as category
FROM tickets t
LEFT JOIN users u ON t.created_by = u.id
LEFT JOIN priorities p ON t.priority_id = p.id
LEFT JOIN categories c ON t.category_id = c.id
ORDER BY t.created_at DESC;

-- Count tickets by status
SELECT status, COUNT(*) as count
FROM tickets
GROUP BY status;

-- View tickets with assignments
SELECT 
    t.id,
    t.title,
    t.status,
    u.name as creator,
    a.agent_id,
    agent.name as assigned_agent
FROM tickets t
LEFT JOIN users u ON t.created_by = u.id
LEFT JOIN ticket_assignments ta ON t.id = ta.ticket_id
LEFT JOIN users agent ON ta.agent_id = agent.id
ORDER BY t.created_at DESC;

-- View all users
SELECT id, name, email, role, created_at
FROM users
ORDER BY created_at DESC;

-- View ticket comments
SELECT 
    tc.id,
    tc.ticket_id,
    t.title as ticket_title,
    u.name as commenter,
    tc.message,
    tc.is_internal,
    tc.created_at
FROM ticket_comments tc
LEFT JOIN tickets t ON tc.ticket_id = t.id
LEFT JOIN users u ON tc.user_id = u.id
ORDER BY tc.created_at DESC;

