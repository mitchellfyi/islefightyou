-- Island Conquest Game Database Schema
-- Run this in your Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Players table
CREATE TABLE players (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    avatar_url TEXT,
    level INTEGER DEFAULT 1,
    experience INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Islands table
CREATE TABLE islands (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    player_id UUID REFERENCES players(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    seed INTEGER NOT NULL,
    size INTEGER DEFAULT 128,
    biome_data JSONB DEFAULT '{}',
    resource_data JSONB DEFAULT '{}',
    building_data JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Player inventories table
CREATE TABLE player_inventories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    player_id UUID REFERENCES players(id) ON DELETE CASCADE,
    item_type VARCHAR(50) NOT NULL,
    quantity INTEGER DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(player_id, item_type)
);

-- Game sessions table (for real-time multiplayer state)
CREATE TABLE game_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    player_id UUID REFERENCES players(id) ON DELETE CASCADE UNIQUE,
    island_id UUID REFERENCES islands(id) ON DELETE CASCADE,
    position_x FLOAT DEFAULT 0,
    position_y FLOAT DEFAULT 0,
    position_z FLOAT DEFAULT 0,
    rotation_x FLOAT DEFAULT 0,
    rotation_y FLOAT DEFAULT 0,
    health INTEGER DEFAULT 100,
    is_online BOOLEAN DEFAULT TRUE,
    last_ping TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_islands_player_id ON islands(player_id);
CREATE INDEX idx_inventories_player_id ON player_inventories(player_id);
CREATE INDEX idx_sessions_player_id ON game_sessions(player_id);
CREATE INDEX idx_sessions_island_id ON game_sessions(island_id);
CREATE INDEX idx_sessions_online ON game_sessions(is_online);

-- Row Level Security (RLS) policies
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE islands ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_inventories ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;

-- Players can only see and edit their own data
CREATE POLICY "Players can view own profile" ON players FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Players can update own profile" ON players FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Players can insert own profile" ON players FOR INSERT WITH CHECK (auth.uid() = id);

-- Islands policies
CREATE POLICY "Players can view all islands" ON islands FOR SELECT TO authenticated;
CREATE POLICY "Players can edit own islands" ON islands FOR ALL USING (auth.uid() = player_id);

-- Inventory policies
CREATE POLICY "Players can view own inventory" ON player_inventories FOR ALL USING (auth.uid() = player_id);

-- Game session policies
CREATE POLICY "Players can view online sessions" ON game_sessions FOR SELECT TO authenticated;
CREATE POLICY "Players can manage own session" ON game_sessions FOR ALL USING (auth.uid() = player_id);

-- Functions for game logic
CREATE OR REPLACE FUNCTION update_last_active()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_active = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to update last_active on players table
CREATE TRIGGER update_player_last_active
    BEFORE UPDATE ON players
    FOR EACH ROW
    EXECUTE FUNCTION update_last_active();

-- Function to update island timestamp
CREATE OR REPLACE FUNCTION update_island_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to update updated_at on islands table
CREATE TRIGGER update_island_updated_at
    BEFORE UPDATE ON islands
    FOR EACH ROW
    EXECUTE FUNCTION update_island_timestamp();

-- Function to clean up offline sessions
CREATE OR REPLACE FUNCTION cleanup_offline_sessions()
RETURNS void AS $$
BEGIN
    UPDATE game_sessions 
    SET is_online = FALSE 
    WHERE last_ping < NOW() - INTERVAL '5 minutes';
END;
$$ language 'plpgsql';

-- Create a scheduled job to clean up offline sessions (optional)
-- This would need to be set up as a cron job or Edge Function 