-- Fix missing RLS INSERT policy for order_items table
-- This resolves the 403 Forbidden error when creating order items

-- Add missing INSERT policy for order_items
CREATE POLICY "Users can create own order items" ON public.order_items FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.orders 
        WHERE orders.id = order_items.order_id 
        AND orders.user_id = auth.uid()
    )
);