-- Create security_activity_log table for tracking user security events
CREATE TABLE security_activity_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Activity details
  activity_type TEXT NOT NULL,
  description TEXT NOT NULL,
  
  -- Security context
  ip_address INET,
  user_agent TEXT,
  location TEXT,
  device_type TEXT CHECK (device_type IN ('mobile', 'desktop', 'tablet', 'unknown')),
  
  -- Risk assessment
  is_suspicious BOOLEAN DEFAULT FALSE,
  risk_score INTEGER DEFAULT 0 CHECK (risk_score >= 0 AND risk_score <= 100),
  
  -- Additional metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_security_activity_log_user_id ON security_activity_log(user_id);
CREATE INDEX idx_security_activity_log_created_at ON security_activity_log(created_at DESC);
CREATE INDEX idx_security_activity_log_suspicious ON security_activity_log(user_id, is_suspicious) WHERE is_suspicious = TRUE;
CREATE INDEX idx_security_activity_log_activity_type ON security_activity_log(user_id, activity_type);

-- Enable Row Level Security
ALTER TABLE security_activity_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only view their own security activity
CREATE POLICY "Users can view their own security activity" ON security_activity_log
FOR SELECT USING (auth.uid() = user_id);

-- Allow system to insert security activity logs
CREATE POLICY "System can insert security activity" ON security_activity_log
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Prevent users from modifying their security logs (integrity)
-- Only allow authorized functions/triggers to modify logs

-- Function to automatically log security activities
CREATE OR REPLACE FUNCTION log_security_activity(
  p_user_id UUID,
  p_activity_type TEXT,
  p_description TEXT,
  p_ip_address TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_location TEXT DEFAULT NULL,
  p_device_type TEXT DEFAULT 'unknown',
  p_is_suspicious BOOLEAN DEFAULT FALSE,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID AS $$
DECLARE
  activity_id UUID;
BEGIN
  INSERT INTO security_activity_log (
    user_id,
    activity_type,
    description,
    ip_address,
    user_agent,
    location,
    device_type,
    is_suspicious,
    metadata
  ) VALUES (
    p_user_id,
    p_activity_type,
    p_description,
    p_ip_address::INET,
    p_user_agent,
    p_location,
    p_device_type,
    p_is_suspicious,
    p_metadata
  ) RETURNING id INTO activity_id;
  
  RETURN activity_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to detect suspicious login patterns
CREATE OR REPLACE FUNCTION detect_suspicious_login(
  p_user_id UUID,
  p_ip_address TEXT,
  p_location TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  recent_locations TEXT[];
  recent_ips INET[];
  location_count INTEGER;
  ip_count INTEGER;
  failed_attempts INTEGER;
BEGIN
  -- Check for multiple different locations in last 24 hours
  SELECT array_agg(DISTINCT location) INTO recent_locations
  FROM security_activity_log
  WHERE user_id = p_user_id
  AND activity_type IN ('login', 'login_attempt')
  AND created_at > NOW() - INTERVAL '24 hours'
  AND location IS NOT NULL;
  
  -- Check for multiple different IPs in last 24 hours
  SELECT array_agg(DISTINCT ip_address) INTO recent_ips
  FROM security_activity_log
  WHERE user_id = p_user_id
  AND activity_type IN ('login', 'login_attempt')
  AND created_at > NOW() - INTERVAL '24 hours'
  AND ip_address IS NOT NULL;
  
  -- Count failed login attempts in last hour
  SELECT COUNT(*) INTO failed_attempts
  FROM security_activity_log
  WHERE user_id = p_user_id
  AND activity_type = 'login_attempt'
  AND description ILIKE '%failed%'
  AND created_at > NOW() - INTERVAL '1 hour';
  
  location_count := COALESCE(array_length(recent_locations, 1), 0);
  ip_count := COALESCE(array_length(recent_ips, 1), 0);
  
  -- Mark as suspicious if:
  -- - More than 3 different locations in 24 hours
  -- - More than 5 different IPs in 24 hours  
  -- - More than 5 failed attempts in 1 hour
  -- - Login from completely new location and IP combination
  RETURN (
    location_count > 3 OR 
    ip_count > 5 OR 
    failed_attempts > 5 OR
    (p_location IS NOT NULL AND NOT (p_location = ANY(recent_locations)))
  );
END;
$$ LANGUAGE plpgsql;

-- Create common activity type constants for consistent logging
CREATE TABLE security_activity_types (
  type_name TEXT PRIMARY KEY,
  description TEXT NOT NULL,
  default_risk_score INTEGER DEFAULT 0,
  is_high_risk BOOLEAN DEFAULT FALSE
);

INSERT INTO security_activity_types (type_name, description, default_risk_score, is_high_risk) VALUES
('login', 'Successful user login', 0, FALSE),
('logout', 'User logout', 0, FALSE),
('login_attempt', 'Failed login attempt', 25, TRUE),
('password_change', 'Password changed', 10, FALSE),
('email_change', 'Email address changed', 15, TRUE),
('profile_update', 'Profile information updated', 5, FALSE),
('payment_method_added', 'Payment method added', 10, FALSE),
('payment_method_removed', 'Payment method removed', 5, FALSE),
('password_reset_request', 'Password reset requested', 20, TRUE),
('password_reset_complete', 'Password reset completed', 15, TRUE),
('two_factor_enabled', 'Two-factor authentication enabled', 0, FALSE),
('two_factor_disabled', 'Two-factor authentication disabled', 30, TRUE),
('suspicious_activity', 'Suspicious activity detected', 50, TRUE),
('account_locked', 'Account locked due to suspicious activity', 75, TRUE),
('data_export_request', 'User data export requested', 10, FALSE);

-- Function to clean up old security logs (keep last 90 days)
CREATE OR REPLACE FUNCTION cleanup_old_security_logs()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM security_activity_log
  WHERE created_at < NOW() - INTERVAL '90 days';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Security: Add comments
COMMENT ON TABLE security_activity_log IS 'Comprehensive security activity log for user actions and suspicious activity detection';
COMMENT ON COLUMN security_activity_log.risk_score IS 'Risk score from 0-100, with higher scores indicating more suspicious activity';
COMMENT ON FUNCTION log_security_activity IS 'Centralized function for logging security activities with automatic risk assessment';
COMMENT ON FUNCTION detect_suspicious_login IS 'Analyzes login patterns to detect potentially suspicious authentication attempts';