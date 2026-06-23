-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  weight_kg DECIMAL(5,2),
  sex TEXT CHECK (sex IN ('male', 'female')),
  age INTEGER,
  xp_total INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create drinks table
CREATE TABLE IF NOT EXISTS drinks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('beer', 'wine', 'cocktail', 'spirit', 'water')),
  name TEXT NOT NULL,
  volume_ml INTEGER NOT NULL,
  alcohol_pct DECIMAL(5,2) NOT NULL DEFAULT 0,
  xp INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create chests table
CREATE TABLE IF NOT EXISTS chests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  opened_at TIMESTAMPTZ,
  rarity TEXT CHECK (rarity IN ('common', 'rare', 'epic', 'legendary'))
);

-- Create collection table
CREATE TABLE IF NOT EXISTS collection (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  rarity TEXT NOT NULL CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
  quantity INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create chat messages table for AI coach
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create water logs table
CREATE TABLE IF NOT EXISTS water_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  volume_ml INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create safe ride events table
CREATE TABLE IF NOT EXISTS safe_ride_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_drinks_user_id ON drinks(user_id);
CREATE INDEX IF NOT EXISTS idx_drinks_created_at ON drinks(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_chests_user_id ON chests(user_id);
CREATE INDEX IF NOT EXISTS idx_collection_user_id ON collection(user_id);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE drinks ENABLE ROW LEVEL SECURITY;
ALTER TABLE chests ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE water_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE safe_ride_events ENABLE ROW LEVEL SECURITY;

-- Policies for profiles
CREATE POLICY "select_own_profile" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id);
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Policies for drinks
CREATE POLICY "select_own_drinks" ON drinks FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "insert_own_drinks" ON drinks FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update_own_drinks" ON drinks FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "delete_own_drinks" ON drinks FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Policies for chests
CREATE POLICY "select_own_chests" ON chests FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "insert_own_chests" ON chests FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update_own_chests" ON chests FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "delete_own_chests" ON chests FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Policies for collection
CREATE POLICY "select_own_collection" ON collection FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "insert_own_collection" ON collection FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update_own_collection" ON collection FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "delete_own_collection" ON collection FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Policies for chat_messages
CREATE POLICY "select_own_chat" ON chat_messages FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "insert_own_chat" ON chat_messages FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "delete_own_chat" ON chat_messages FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Policies for water_logs
CREATE POLICY "select_own_water" ON water_logs FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "insert_own_water" ON water_logs FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "delete_own_water" ON water_logs FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Policies for safe_ride_events
CREATE POLICY "select_own_rides" ON safe_ride_events FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "insert_own_rides" ON safe_ride_events FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

-- Function to automatically create a profile for new users
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, xp_total, level)
  VALUES (NEW.id, 0, 1);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
