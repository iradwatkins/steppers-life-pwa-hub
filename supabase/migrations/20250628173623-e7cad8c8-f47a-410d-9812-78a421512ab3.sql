
-- Enable RLS on all tables that currently don't have it
ALTER TABLE public.check_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seating_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_activity_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_event_categories ENABLE ROW LEVEL SECURITY;

-- RLS Policies for check_ins
CREATE POLICY "Event organizers can manage check-ins" ON public.check_ins
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.order_items oi
    JOIN public.orders o ON oi.order_id = o.id
    JOIN public.events e ON o.event_id = e.id
    JOIN public.organizers org ON e.organizer_id = org.id
    WHERE oi.id = check_ins.order_item_id
    AND org.user_id = auth.uid()
  )
);

CREATE POLICY "Users can view their own check-ins" ON public.check_ins
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.order_items oi
    JOIN public.orders o ON oi.order_id = o.id
    WHERE oi.id = check_ins.order_item_id
    AND o.user_id = auth.uid()
  )
);

-- RLS Policies for event_analytics  
CREATE POLICY "Event organizers can view analytics" ON public.event_analytics
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.events e
    JOIN public.organizers org ON e.organizer_id = org.id
    WHERE e.id = event_analytics.event_id
    AND org.user_id = auth.uid()
  )
);

CREATE POLICY "Admins can manage all analytics" ON public.event_analytics
FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- RLS Policies for venues
CREATE POLICY "Everyone can view venues" ON public.venues
FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create venues" ON public.venues
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update venues they created" ON public.venues
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.events e
    JOIN public.organizers org ON e.organizer_id = org.id
    WHERE e.venue_id = venues.id
    AND org.user_id = auth.uid()
  )
);

-- RLS Policies for ticket_types
CREATE POLICY "Everyone can view active ticket types" ON public.ticket_types
FOR SELECT USING (is_active = true);

CREATE POLICY "Event organizers can manage ticket types" ON public.ticket_types
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.events e
    JOIN public.organizers org ON e.organizer_id = org.id
    WHERE e.id = ticket_types.event_id
    AND org.user_id = auth.uid()
  )
);

-- RLS Policies for notes
CREATE POLICY "Users can manage their own notes" ON public.notes
FOR ALL USING (auth.uid() IS NOT NULL);

-- RLS Policies for seating_sections
CREATE POLICY "Everyone can view seating sections" ON public.seating_sections
FOR SELECT USING (true);

CREATE POLICY "Event organizers can manage seating sections" ON public.seating_sections
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.events e
    JOIN public.organizers org ON e.organizer_id = org.id
    WHERE (e.id = seating_sections.event_id OR e.venue_id = seating_sections.venue_id)
    AND org.user_id = auth.uid()
  )
);

-- RLS Policies for tickets
CREATE POLICY "Users can view tickets from their orders" ON public.tickets
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.order_items oi
    JOIN public.orders o ON oi.order_id = o.id
    WHERE oi.ticket_id = tickets.id
    AND o.user_id = auth.uid()
  )
);

CREATE POLICY "Event organizers can manage all tickets" ON public.tickets
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.ticket_types tt
    JOIN public.events e ON tt.event_id = e.id
    JOIN public.organizers org ON e.organizer_id = org.id
    WHERE tt.id = tickets.ticket_type_id
    AND org.user_id = auth.uid()
  )
);

-- RLS Policies for promo_codes
CREATE POLICY "Everyone can view active promo codes" ON public.promo_codes
FOR SELECT USING (is_active = true AND (valid_until IS NULL OR valid_until > now()));

CREATE POLICY "Event organizers can manage promo codes" ON public.promo_codes
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.events e
    JOIN public.organizers org ON e.organizer_id = org.id
    WHERE e.id = promo_codes.event_id
    AND org.user_id = auth.uid()
  )
);

-- RLS Policies for payments
CREATE POLICY "Users can view their own payments" ON public.payments
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.orders o
    WHERE o.id = payments.order_id
    AND o.user_id = auth.uid()
  )
);

CREATE POLICY "Event organizers can view payments for their events" ON public.payments
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.orders o
    JOIN public.events e ON o.event_id = e.id
    JOIN public.organizers org ON e.organizer_id = org.id
    WHERE o.id = payments.order_id
    AND org.user_id = auth.uid()
  )
);

CREATE POLICY "System can create payments" ON public.payments
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- RLS Policies for security_activity_types (reference table)
CREATE POLICY "Everyone can view security activity types" ON public.security_activity_types
FOR SELECT USING (true);

CREATE POLICY "Admins can manage security activity types" ON public.security_activity_types
FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- RLS Policies for saved_event_categories
CREATE POLICY "Everyone can view saved event categories" ON public.saved_event_categories
FOR SELECT USING (true);

CREATE POLICY "Admins can manage saved event categories" ON public.saved_event_categories
FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
