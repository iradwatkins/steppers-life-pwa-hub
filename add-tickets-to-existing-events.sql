-- Add ticket types to existing events that don't have any
-- Run this in your Supabase SQL editor to fix events without ticket types

DO $$
DECLARE
    event_record RECORD;
    ticket_count INTEGER;
BEGIN
    -- Loop through all published events that don't have ticket types
    FOR event_record IN 
        SELECT e.id, e.title, e.category
        FROM public.events e
        LEFT JOIN public.ticket_types tt ON e.id = tt.event_id
        WHERE e.status = 'published'
        AND tt.id IS NULL
    LOOP
        -- Add appropriate ticket types based on event category
        CASE 
            WHEN LOWER(event_record.category) LIKE '%competition%' THEN
                -- Competition events get 3 ticket types
                INSERT INTO public.ticket_types (
                    event_id, name, description, price, quantity_available, quantity_sold, max_per_order, is_active
                ) VALUES 
                (event_record.id, 'General Admission', 'Regular entry to the competition', 30.00, 200, 0, 6, true),
                (event_record.id, 'VIP Package', 'VIP seating and perks', 65.00, 50, 0, 4, true),
                (event_record.id, 'Competitor Pass', 'Entry for participants', 15.00, 100, 0, 2, true);
                
            WHEN LOWER(event_record.category) LIKE '%workshop%' THEN
                -- Workshop events get 2 ticket types
                INSERT INTO public.ticket_types (
                    event_id, name, description, price, quantity_available, quantity_sold, max_per_order, is_active
                ) VALUES 
                (event_record.id, 'Workshop Ticket', 'Access to workshop session', 25.00, 50, 0, 3, true),
                (event_record.id, 'Workshop + Materials', 'Workshop plus take-home materials', 40.00, 20, 0, 2, true);
                
            WHEN LOWER(event_record.category) LIKE '%social%' THEN
                -- Social events get 2 ticket types
                INSERT INTO public.ticket_types (
                    event_id, name, description, price, quantity_available, quantity_sold, max_per_order, is_active
                ) VALUES 
                (event_record.id, 'Regular Entry', 'Standard admission to social event', 20.00, 100, 0, 5, true),
                (event_record.id, 'Early Bird', 'Discounted early entry', 15.00, 30, 0, 4, true);
                
            ELSE
                -- Default ticket types for other categories
                INSERT INTO public.ticket_types (
                    event_id, name, description, price, quantity_available, quantity_sold, max_per_order, is_active
                ) VALUES 
                (event_record.id, 'General Admission', 'Standard entry ticket', 25.00, 100, 0, 5, true),
                (event_record.id, 'Premium', 'Enhanced experience package', 45.00, 25, 0, 3, true);
        END CASE;
        
        -- Log what was added
        RAISE NOTICE 'Added ticket types to event: % (Category: %)', event_record.title, event_record.category;
    END LOOP;
    
    -- Count total events and events with tickets
    SELECT COUNT(*) INTO ticket_count FROM public.events WHERE status = 'published';
    RAISE NOTICE 'Total published events: %', ticket_count;
    
    SELECT COUNT(DISTINCT e.id) INTO ticket_count 
    FROM public.events e 
    INNER JOIN public.ticket_types tt ON e.id = tt.event_id 
    WHERE e.status = 'published';
    RAISE NOTICE 'Published events with ticket types: %', ticket_count;
    
END $$;