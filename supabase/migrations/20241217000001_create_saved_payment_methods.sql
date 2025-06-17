-- Create saved_payment_methods table for PCI-compliant payment method storage
-- NOTE: This table stores only tokenized/safe payment method information
-- Actual card details are processed through PCI-compliant payment processors

CREATE TABLE saved_payment_methods (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Payment method type
  type TEXT NOT NULL CHECK (type IN ('credit_card', 'debit_card', 'paypal')),
  
  -- Safe, tokenized card information (PCI compliant)
  last_four TEXT NOT NULL CHECK (length(last_four) = 4),
  card_brand TEXT NOT NULL,
  expiry_month INTEGER NOT NULL CHECK (expiry_month >= 1 AND expiry_month <= 12),
  expiry_year INTEGER NOT NULL CHECK (expiry_year >= date_part('year', CURRENT_DATE)),
  cardholder_name TEXT,
  
  -- Payment processor token (would be from Stripe, etc.)
  payment_processor_token TEXT, -- Encrypted token from payment processor
  processor_customer_id TEXT,   -- Customer ID from payment processor
  
  -- Settings
  is_default BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Security and audit
  last_used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Metadata for fraud detection and analytics
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create indexes for performance
CREATE INDEX idx_saved_payment_methods_user_id ON saved_payment_methods(user_id);
CREATE INDEX idx_saved_payment_methods_is_default ON saved_payment_methods(user_id, is_default) WHERE is_default = TRUE;
CREATE INDEX idx_saved_payment_methods_active ON saved_payment_methods(user_id, is_active) WHERE is_active = TRUE;

-- Enable Row Level Security
ALTER TABLE saved_payment_methods ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own payment methods
CREATE POLICY "Users can view their own payment methods" ON saved_payment_methods
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own payment methods" ON saved_payment_methods
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own payment methods" ON saved_payment_methods
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own payment methods" ON saved_payment_methods
FOR DELETE USING (auth.uid() = user_id);

-- Function to ensure only one default payment method per user
CREATE OR REPLACE FUNCTION ensure_single_default_payment_method()
RETURNS TRIGGER AS $$
BEGIN
  -- If the new/updated record is set as default
  IF NEW.is_default = TRUE THEN
    -- Remove default status from all other payment methods for this user
    UPDATE saved_payment_methods 
    SET is_default = FALSE, updated_at = NOW()
    WHERE user_id = NEW.user_id 
    AND id != NEW.id 
    AND is_default = TRUE;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to maintain single default payment method
CREATE TRIGGER trigger_ensure_single_default_payment_method
  BEFORE INSERT OR UPDATE ON saved_payment_methods
  FOR EACH ROW
  EXECUTE FUNCTION ensure_single_default_payment_method();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER trigger_update_saved_payment_methods_updated_at
  BEFORE UPDATE ON saved_payment_methods
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Security: Add comments documenting PCI compliance approach
COMMENT ON TABLE saved_payment_methods IS 'PCI-compliant storage of tokenized payment method information. Never stores actual card numbers, CVV, or other sensitive payment data.';
COMMENT ON COLUMN saved_payment_methods.last_four IS 'Last 4 digits of card number - safe to store for display purposes';
COMMENT ON COLUMN saved_payment_methods.payment_processor_token IS 'Encrypted token from payment processor (Stripe, etc.) for actual payment processing';
COMMENT ON COLUMN saved_payment_methods.processor_customer_id IS 'Customer ID from payment processor for linking tokenized payment methods';