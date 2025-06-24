-- Create missing tables for ticket system
-- This SQL should be run in your Supabase SQL editor

-- Create tickets table
CREATE TABLE IF NOT EXISTS public.tickets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ticket_type_id UUID NOT NULL REFERENCES public.ticket_types(id) ON DELETE CASCADE,
    order_item_id UUID NULL, -- Will be populated after order_items is created
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    qr_code TEXT NULL,
    check_in_time TIMESTAMP WITH TIME ZONE NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create order_items table  
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    ticket_type_id UUID NOT NULL REFERENCES public.ticket_types(id) ON DELETE CASCADE,
    ticket_id UUID NULL REFERENCES public.tickets(id) ON DELETE SET NULL,
    price DECIMAL(10,2) NOT NULL,
    attendee_name VARCHAR(255) NOT NULL,
    attendee_email VARCHAR(255) NOT NULL,
    special_requests TEXT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Add foreign key constraint to tickets table for order_item_id
ALTER TABLE public.tickets 
ADD CONSTRAINT tickets_order_item_id_fkey 
FOREIGN KEY (order_item_id) REFERENCES public.order_items(id) ON DELETE SET NULL;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tickets_ticket_type_id ON public.tickets(ticket_type_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON public.tickets(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_ticket_type_id ON public.order_items(ticket_type_id);
CREATE INDEX IF NOT EXISTS idx_order_items_ticket_id ON public.order_items(ticket_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for tickets
CREATE POLICY "Users can view their own tickets" ON public.tickets
FOR SELECT USING (
    ticket_type_id IN (
        SELECT tt.id FROM public.ticket_types tt
        INNER JOIN public.events e ON tt.event_id = e.id
        INNER JOIN public.orders o ON o.event_id = e.id
        WHERE o.user_id = auth.uid()
    )
);

CREATE POLICY "Users can insert tickets via orders" ON public.tickets
FOR INSERT WITH CHECK (true); -- Will be controlled by order creation logic

CREATE POLICY "System can update tickets" ON public.tickets
FOR UPDATE USING (true); -- System operations

-- Create RLS policies for order_items  
CREATE POLICY "Users can view their own order items" ON public.order_items
FOR SELECT USING (
    order_id IN (
        SELECT id FROM public.orders WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Users can insert order items via orders" ON public.order_items
FOR INSERT WITH CHECK (
    order_id IN (
        SELECT id FROM public.orders WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Users can update their own order items" ON public.order_items
FOR UPDATE USING (
    order_id IN (
        SELECT id FROM public.orders WHERE user_id = auth.uid()
    )
);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_tickets_updated_at 
    BEFORE UPDATE ON public.tickets
    FOR EACH ROW 
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_order_items_updated_at 
    BEFORE UPDATE ON public.order_items
    FOR EACH ROW 
    EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some comments for documentation
COMMENT ON TABLE public.tickets IS 'Individual tickets generated from order items';
COMMENT ON TABLE public.order_items IS 'Line items for each order, linking to specific ticket types';
COMMENT ON COLUMN public.tickets.status IS 'Ticket status: active, used, cancelled, refunded';
COMMENT ON COLUMN public.tickets.qr_code IS 'QR code data for ticket verification';
COMMENT ON COLUMN public.order_items.price IS 'Price paid for this specific item at time of purchase';