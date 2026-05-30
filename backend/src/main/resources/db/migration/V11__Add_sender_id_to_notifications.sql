-- Add sender_id column to notifications table for matching chat redirect
ALTER TABLE notifications ADD COLUMN sender_id UUID REFERENCES users(id) ON DELETE SET NULL;
