-- SQL untuk membuat table notification_settings di Supabase
-- Copy dan paste SQL ini ke SQL Editor di Supabase Dashboard

-- 1. Buat table notification_settings
CREATE TABLE notification_settings (
    id BIGSERIAL PRIMARY KEY,
    notification_time VARCHAR(5) NOT NULL DEFAULT '08:00',
    is_enabled BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Insert default settings
INSERT INTO notification_settings (id, notification_time, is_enabled, created_at, updated_at) 
VALUES (1, '08:00', true, now(), now());

-- 3. Enable Row Level Security (RLS)
ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;

-- 4. Create policy untuk mengizinkan semua operasi (untuk development)
-- Anda bisa membuat policy yang lebih ketat nanti
CREATE POLICY "Enable all access for notification_settings" 
ON notification_settings FOR ALL 
USING (true) 
WITH CHECK (true);

-- 5. Grant permissions ke authenticated dan anon users
GRANT ALL ON notification_settings TO authenticated;
GRANT ALL ON notification_settings TO anon;
GRANT USAGE, SELECT ON SEQUENCE notification_settings_id_seq TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE notification_settings_id_seq TO anon;
