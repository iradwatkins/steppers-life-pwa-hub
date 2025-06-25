-- Create missing ticket_purchases table
-- This table is being queried by analytics services but doesn't exist

CREATE TABLE IF NOT EXISTS public.ticket_purchases (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    ticket_type_id UUID REFERENCES public.ticket_types(id) ON DELETE SET NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    purchase_date TIMESTAMPTZ DEFAULT NOW(),
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
    payment_method TEXT,
    payment_reference TEXT,
    purchaser_name TEXT,
    purchaser_email TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_ticket_purchases_event_id ON public.ticket_purchases(event_id);
CREATE INDEX IF NOT EXISTS idx_ticket_purchases_user_id ON public.ticket_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_ticket_purchases_order_id ON public.ticket_purchases(order_id);
CREATE INDEX IF NOT EXISTS idx_ticket_purchases_ticket_type_id ON public.ticket_purchases(ticket_type_id);
CREATE INDEX IF NOT EXISTS idx_ticket_purchases_purchase_date ON public.ticket_purchases(purchase_date);
CREATE INDEX IF NOT EXISTS idx_ticket_purchases_payment_status ON public.ticket_purchases(payment_status);

-- Enable RLS
ALTER TABLE public.ticket_purchases ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own ticket purchases" ON public.ticket_purchases
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Organizers can view purchases for their events" ON public.ticket_purchases
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.events 
            WHERE events.id = ticket_purchases.event_id 
            AND events.organizer_id IN (
                SELECT id FROM public.organizers 
                WHERE user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Admins can view all ticket purchases" ON public.ticket_purchases
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('admin', 'super_admin')
        )
    );

CREATE POLICY "System can insert ticket purchases" ON public.ticket_purchases
    FOR INSERT WITH CHECK (true);

CREATE POLICY "System can update ticket purchases" ON public.ticket_purchases
    FOR UPDATE USING (true);

-- Add comments
COMMENT ON TABLE public.ticket_purchases IS 'Records of ticket purchases for analytics and reporting';
COMMENT ON COLUMN public.ticket_purchases.event_id IS 'Event the tickets were purchased for';
COMMENT ON COLUMN public.ticket_purchases.ticket_type_id IS 'Type of ticket purchased';
COMMENT ON COLUMN public.ticket_purchases.user_id IS 'User who made the purchase';
COMMENT ON COLUMN public.ticket_purchases.order_id IS 'Associated order record';
COMMENT ON COLUMN public.ticket_purchases.quantity IS 'Number of tickets purchased';
COMMENT ON COLUMN public.ticket_purchases.unit_price IS 'Price per ticket at time of purchase';
COMMENT ON COLUMN public.ticket_purchases.total_price IS 'Total amount paid';
COMMENT ON COLUMN public.ticket_purchases.payment_status IS 'Status of payment: pending, completed, failed, refunded';

-- Update trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_ticket_purchases_updated_at ON public.ticket_purchases;
CREATE TRIGGER update_ticket_purchases_updated_at
    BEFORE UPDATE ON public.ticket_purchases
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Verification
SELECT 
    'ticket_purchases table created successfully' as status,
    COUNT(*) as initial_records
FROM public.ticket_purchases;