-- Create notification_settings table
CREATE TABLE IF NOT EXISTS notification_settings (
    id SERIAL PRIMARY KEY,
    notification_time VARCHAR(5) NOT NULL DEFAULT '08:00',
    is_enabled BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insert default settings
INSERT INTO notification_settings (notification_time, is_enabled) 
VALUES ('08:00', true)
ON CONFLICT DO NOTHING;

-- Enable RLS
ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;

-- Create policy for admin access
CREATE POLICY "Admin can manage notification settings" 
ON notification_settings FOR ALL 
USING (true);

-- Grant permissions
GRANT ALL ON notification_settings TO authenticated;
GRANT ALL ON notification_settings TO anon;
