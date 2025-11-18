-- Migration: Add Profile Enhancements
-- Created: 2024-11-20
-- Description: Add tables for saved addresses, emergency contacts, referral program, and app settings

-- ==============================================
-- TABLE: user_addresses
-- ==============================================
CREATE TABLE IF NOT EXISTS user_addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    label VARCHAR(50) NOT NULL,
    address TEXT NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for user_addresses
CREATE INDEX idx_user_addresses_user_id ON user_addresses(user_id);
CREATE INDEX idx_user_addresses_is_default ON user_addresses(user_id, is_default) WHERE is_default = TRUE;

-- Trigger to ensure only one default address per user
CREATE OR REPLACE FUNCTION ensure_one_default_address()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_default = TRUE THEN
        UPDATE user_addresses
        SET is_default = FALSE
        WHERE user_id = NEW.user_id AND id != NEW.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_ensure_one_default_address
    BEFORE INSERT OR UPDATE ON user_addresses
    FOR EACH ROW
    EXECUTE FUNCTION ensure_one_default_address();

-- ==============================================
-- TABLE: emergency_contacts
-- ==============================================
CREATE TABLE IF NOT EXISTS emergency_contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    relationship VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for emergency_contacts
CREATE INDEX idx_emergency_contacts_user_id ON emergency_contacts(user_id);

-- ==============================================
-- TABLE: referral_codes
-- ==============================================
CREATE TABLE IF NOT EXISTS referral_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    code VARCHAR(20) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for referral_codes
CREATE UNIQUE INDEX idx_referral_codes_code ON referral_codes(code);
CREATE INDEX idx_referral_codes_user_id ON referral_codes(user_id);

-- ==============================================
-- TABLE: referral_redemptions
-- ==============================================
CREATE TABLE IF NOT EXISTS referral_redemptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    referrer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    referee_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    code VARCHAR(20) NOT NULL,
    bonus_amount DECIMAL(10, 2) NOT NULL DEFAULT 500.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for referral_redemptions
CREATE INDEX idx_referral_redemptions_referrer_id ON referral_redemptions(referrer_id);
CREATE INDEX idx_referral_redemptions_referee_id ON referral_redemptions(referee_id);

-- Constraint: User can only redeem one referral code
ALTER TABLE referral_redemptions ADD CONSTRAINT unique_referee_redemption UNIQUE (referee_id);

-- ==============================================
-- TABLE: user_settings
-- ==============================================
CREATE TABLE IF NOT EXISTS user_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    theme_mode VARCHAR(20) DEFAULT 'system',
    language VARCHAR(10) DEFAULT 'ru',
    notifications JSONB DEFAULT '{"pushEnabled": true, "smsEnabled": true, "emailEnabled": true, "consultationReminders": true, "paymentNotifications": true, "marketingNotifications": false}'::jsonb,
    biometric_enabled BOOLEAN DEFAULT FALSE,
    analytics_enabled BOOLEAN DEFAULT TRUE,
    crash_reporting_enabled BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for user_settings
CREATE INDEX idx_user_settings_user_id ON user_settings(user_id);

-- ==============================================
-- UPDATED_AT TRIGGERS
-- ==============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER trigger_user_addresses_updated_at
    BEFORE UPDATE ON user_addresses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_emergency_contacts_updated_at
    BEFORE UPDATE ON emergency_contacts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_user_settings_updated_at
    BEFORE UPDATE ON user_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ==============================================
-- DEFAULT DATA / SEED (Optional)
-- ==============================================

-- Create default settings for existing users
INSERT INTO user_settings (user_id, theme_mode, language)
SELECT id, 'system', 'ru'
FROM users
WHERE id NOT IN (SELECT user_id FROM user_settings)
ON CONFLICT (user_id) DO NOTHING;

-- ==============================================
-- ROLLBACK INSTRUCTIONS
-- ==============================================
-- To rollback this migration, execute the following:
--
-- DROP TRIGGER IF EXISTS trigger_user_settings_updated_at ON user_settings;
-- DROP TRIGGER IF EXISTS trigger_emergency_contacts_updated_at ON emergency_contacts;
-- DROP TRIGGER IF EXISTS trigger_user_addresses_updated_at ON user_addresses;
-- DROP TRIGGER IF EXISTS trigger_ensure_one_default_address ON user_addresses;
-- DROP FUNCTION IF EXISTS update_updated_at_column();
-- DROP FUNCTION IF EXISTS ensure_one_default_address();
-- DROP TABLE IF EXISTS user_settings;
-- DROP TABLE IF EXISTS referral_redemptions;
-- DROP TABLE IF EXISTS referral_codes;
-- DROP TABLE IF EXISTS emergency_contacts;
-- DROP TABLE IF EXISTS user_addresses;
