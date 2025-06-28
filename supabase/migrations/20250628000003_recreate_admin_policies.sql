-- Recreate all admin policies after role consolidation
-- These policies were dropped during the enum type change and must be restored

BEGIN;

-- Organizer policies
CREATE POLICY "Users can view all organizers" ON public.organizers
FOR SELECT USING (true);

CREATE POLICY "Users can create their own organizer profile" ON public.organizers
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own organizer profile" ON public.organizers
FOR UPDATE USING (auth.uid() = user_id OR 
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can manage all organizers" ON public.organizers
FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Content management policies
CREATE POLICY "Admin users can manage content" ON public.content_pages
FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admin users can manage content versions" ON public.content_page_versions
FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Platform configuration policies
CREATE POLICY "Admin users can manage categories" ON public.platform_categories
FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admin users can manage settings" ON public.platform_settings
FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admin users can manage VOD config" ON public.vod_configuration
FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admin users can manage pickup locations" ON public.pickup_locations
FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Audit and analytics policies
CREATE POLICY "Admin users can read audit log" ON public.configuration_audit_log
FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admins can view all analytics sessions" ON public.web_analytics_sessions
FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admins can view all page views" ON public.web_analytics_page_views
FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Instructor management policies  
CREATE POLICY "Admins can view all instructor profiles" ON public.instructor_profiles
FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admins can view all performance metrics" ON public.instructor_performance_metrics
FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Inventory policies
CREATE POLICY "Admins can manage inventory audit logs" ON public.inventory_audit_logs
FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- BMAD follower system policies
CREATE POLICY "Admins can manage all follower permissions" ON public.follower_sales_permissions
FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admins can manage all follower commissions" ON public.follower_commissions
FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

COMMIT;