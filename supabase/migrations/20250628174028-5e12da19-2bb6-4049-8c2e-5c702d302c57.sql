
-- Fix function search_path security issues by setting search_path = ''
-- This prevents search_path hijacking attacks

-- Update ensure_single_default_payment_method function
CREATE OR REPLACE FUNCTION public.ensure_single_default_payment_method()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  -- If the new/updated record is set as default
  IF NEW.is_default = TRUE THEN
    -- Remove default status from all other payment methods for this user
    UPDATE public.saved_payment_methods 
    SET is_default = FALSE, updated_at = NOW()
    WHERE user_id = NEW.user_id 
    AND id != NEW.id 
    AND is_default = TRUE;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Update log_security_activity function
CREATE OR REPLACE FUNCTION public.log_security_activity(
  p_user_id uuid, 
  p_activity_type text, 
  p_description text, 
  p_ip_address text DEFAULT NULL::text, 
  p_user_agent text DEFAULT NULL::text, 
  p_location text DEFAULT NULL::text, 
  p_device_type text DEFAULT 'unknown'::text, 
  p_is_suspicious boolean DEFAULT false, 
  p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  activity_id UUID;
BEGIN
  INSERT INTO public.security_activity_log (
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
$function$;

-- Update detect_suspicious_login function
CREATE OR REPLACE FUNCTION public.detect_suspicious_login(
  p_user_id uuid, 
  p_ip_address text, 
  p_location text
)
RETURNS boolean
LANGUAGE plpgsql
SET search_path = ''
AS $function$
DECLARE
  recent_locations TEXT[];
  recent_ips INET[];
  location_count INTEGER;
  ip_count INTEGER;
  failed_attempts INTEGER;
BEGIN
  -- Check for multiple different locations in last 24 hours
  SELECT array_agg(DISTINCT location) INTO recent_locations
  FROM public.security_activity_log
  WHERE user_id = p_user_id
  AND activity_type IN ('login', 'login_attempt')
  AND created_at > NOW() - INTERVAL '24 hours'
  AND location IS NOT NULL;
  
  -- Check for multiple different IPs in last 24 hours
  SELECT array_agg(DISTINCT ip_address) INTO recent_ips
  FROM public.security_activity_log
  WHERE user_id = p_user_id
  AND activity_type IN ('login', 'login_attempt')
  AND created_at > NOW() - INTERVAL '24 hours'
  AND ip_address IS NOT NULL;
  
  -- Count failed login attempts in last hour
  SELECT COUNT(*) INTO failed_attempts
  FROM public.security_activity_log
  WHERE user_id = p_user_id
  AND activity_type = 'login_attempt'
  AND description ILIKE '%failed%'
  AND created_at > NOW() - INTERVAL '1 hour';
  
  location_count := COALESCE(array_length(recent_locations, 1), 0);
  ip_count := COALESCE(array_length(recent_ips, 1), 0);
  
  RETURN (
    location_count > 3 OR 
    ip_count > 5 OR 
    failed_attempts > 5 OR
    (p_location IS NOT NULL AND NOT (p_location = ANY(recent_locations)))
  );
END;
$function$;

-- Update cleanup_old_security_logs function
CREATE OR REPLACE FUNCTION public.cleanup_old_security_logs()
RETURNS integer
LANGUAGE plpgsql
SET search_path = ''
AS $function$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.security_activity_log
  WHERE created_at < NOW() - INTERVAL '90 days';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$function$;

-- Update update_saved_event_viewed function
CREATE OR REPLACE FUNCTION public.update_saved_event_viewed(
  p_user_id uuid, 
  p_event_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  UPDATE public.saved_events 
  SET last_viewed_at = NOW()
  WHERE user_id = p_user_id 
  AND event_id = p_event_id;
END;
$function$;

-- Update get_user_saved_events function
CREATE OR REPLACE FUNCTION public.get_user_saved_events(
  p_user_id uuid, 
  p_limit integer DEFAULT 50, 
  p_offset integer DEFAULT 0
)
RETURNS TABLE(
  saved_event_id uuid, 
  event_id uuid, 
  event_title text, 
  event_description text, 
  event_category text, 
  event_start_date timestamp with time zone, 
  event_end_date timestamp with time zone, 
  event_is_online boolean, 
  venue_name text, 
  venue_city text, 
  venue_state text, 
  min_price numeric, 
  max_price numeric, 
  notes text, 
  priority integer, 
  saved_at timestamp with time zone, 
  last_viewed_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    se.id as saved_event_id,
    e.id as event_id,
    e.title as event_title,
    e.description as event_description,
    e.category as event_category,
    e.start_date as event_start_date,
    e.end_date as event_end_date,
    e.is_online as event_is_online,
    v.name as venue_name,
    v.city as venue_city,
    v.state as venue_state,
    COALESCE(MIN(tt.price), 0) as min_price,
    COALESCE(MAX(tt.price), 0) as max_price,
    se.notes,
    se.priority,
    se.saved_at,
    se.last_viewed_at
  FROM public.saved_events se
  JOIN public.events e ON se.event_id = e.id
  LEFT JOIN public.venues v ON e.venue_id = v.id
  LEFT JOIN public.ticket_types tt ON e.id = tt.event_id AND tt.is_active = TRUE
  WHERE se.user_id = p_user_id
  GROUP BY se.id, e.id, v.id
  ORDER BY se.priority DESC, se.saved_at DESC
  LIMIT p_limit OFFSET p_offset;
END;
$function$;

-- Update remaining functions with search_path security
CREATE OR REPLACE FUNCTION public.is_event_saved_by_user(
  p_user_id uuid, 
  p_event_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.saved_events
    WHERE user_id = p_user_id AND event_id = p_event_id
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_user_saved_events_count(p_user_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM public.saved_events
    WHERE user_id = p_user_id
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_saved_event_last_viewed()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $function$
BEGIN
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.increment_content_version()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $function$
BEGIN
    SELECT COALESCE(MAX(version_number), 0) + 1
    INTO NEW.version_number
    FROM public.content_page_versions
    WHERE page_id = NEW.page_id;
    
    RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.create_content_version()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $function$
BEGIN
    IF TG_OP = 'UPDATE' AND (
        OLD.title != NEW.title OR 
        OLD.content != NEW.content OR 
        OLD.meta_description != NEW.meta_description OR 
        OLD.status != NEW.status
    ) THEN
        INSERT INTO public.content_page_versions (
            page_id,
            title,
            content,
            meta_description,
            meta_keywords,
            status,
            created_by
        ) VALUES (
            NEW.id,
            NEW.title,
            NEW.content,
            NEW.meta_description,
            NEW.meta_keywords,
            NEW.status,
            NEW.updated_by
        );
    END IF;
    
    RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.reorder_categories(category_ids uuid[])
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
    category_id UUID;
    new_order INTEGER := 0;
BEGIN
    FOREACH category_id IN ARRAY category_ids
    LOOP
        UPDATE public.platform_categories 
        SET sort_order = new_order,
            updated_at = NOW(),
            updated_by = auth.uid()
        WHERE id = category_id;
        
        new_order := new_order + 1;
    END LOOP;
END;
$function$;

CREATE OR REPLACE FUNCTION public.log_configuration_changes()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $function$
BEGIN
    INSERT INTO public.configuration_audit_log (
        table_name,
        record_id,
        action,
        old_values,
        new_values,
        changed_by
    ) VALUES (
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        TG_OP,
        CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE NULL END,
        CASE WHEN TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN to_jsonb(NEW) ELSE NULL END,
        auth.uid()
    );
    
    RETURN COALESCE(NEW, OLD);
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $function$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$function$;

-- Add missing RLS policies for tables that have RLS enabled but no policies

-- RLS Policies for instructor_class_performance
CREATE POLICY "Instructors can view their own class performance" ON public.instructor_class_performance
FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND id = instructor_class_performance.instructor_id)
);

CREATE POLICY "Admins can view all class performance" ON public.instructor_class_performance
FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- RLS Policies for instructor_revenue_analytics
CREATE POLICY "Instructors can view their own revenue" ON public.instructor_revenue_analytics
FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND id = instructor_revenue_analytics.instructor_id)
);

CREATE POLICY "Admins can view all revenue analytics" ON public.instructor_revenue_analytics
FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- RLS Policies for inventory_holds
CREATE POLICY "Users can view their own inventory holds" ON public.inventory_holds
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own inventory holds" ON public.inventory_holds
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own inventory holds" ON public.inventory_holds
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System can manage inventory holds" ON public.inventory_holds
FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- RLS Policies for performance_alerts
CREATE POLICY "Instructors can view their own alerts" ON public.performance_alerts
FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND id = performance_alerts.instructor_id)
);

CREATE POLICY "Admins can manage all performance alerts" ON public.performance_alerts
FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- RLS Policies for web analytics tables
CREATE POLICY "Admins can view all analytics conversions" ON public.web_analytics_conversions
FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admins can view all analytics events" ON public.web_analytics_events
FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Allow authenticated users to create analytics data
CREATE POLICY "Authenticated users can create conversion data" ON public.web_analytics_conversions
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can create event data" ON public.web_analytics_events
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
