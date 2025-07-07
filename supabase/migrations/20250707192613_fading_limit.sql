/*
  # User Authentication and Coin Collection System

  1. New Tables
    - `user_profiles`
      - `id` (uuid, primary key, references auth.users)
      - `username` (text, unique)
      - `total_coins` (integer, default 0)
      - `best_time` (integer, nullable)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `game_sessions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references user_profiles)
      - `coins_collected` (integer)
      - `time_elapsed` (integer)
      - `completed_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to manage their own data
    - Add policies for reading leaderboard data
*/

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  total_coins integer DEFAULT 0,
  best_time integer,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create game_sessions table
CREATE TABLE IF NOT EXISTS game_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  coins_collected integer DEFAULT 0,
  time_elapsed integer NOT NULL,
  completed_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;

-- Policies for user_profiles
CREATE POLICY "Users can read own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Anyone can read profiles for leaderboard"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (true);

-- Policies for game_sessions
CREATE POLICY "Users can read own sessions"
  ON game_sessions
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own sessions"
  ON game_sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Function to update user profile stats
CREATE OR REPLACE FUNCTION update_user_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE user_profiles 
  SET 
    total_coins = total_coins + NEW.coins_collected,
    best_time = CASE 
      WHEN best_time IS NULL OR NEW.time_elapsed < best_time 
      THEN NEW.time_elapsed 
      ELSE best_time 
    END,
    updated_at = now()
  WHERE id = NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update user stats when a game session is completed
CREATE TRIGGER update_user_stats_trigger
  AFTER INSERT ON game_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_user_stats();