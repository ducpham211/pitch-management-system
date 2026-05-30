ALTER TABLE conversations ADD COLUMN name VARCHAR(255);
ALTER TABLE teams ADD COLUMN conversation_id UUID;
ALTER TABLE teams ADD CONSTRAINT fk_team_conversation FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE SET NULL;