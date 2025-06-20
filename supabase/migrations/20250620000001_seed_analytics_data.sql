-- Seed data for analytics and instructor performance tables
-- Epic E.005 & E.006: Sample data for testing and demonstration

-- Insert sample instructor profiles and store IDs for later reference
DO $$
DECLARE
    sarah_id UUID;
    mike_id UUID;
    emily_id UUID;
    marcus_id UUID;
    first_event_id UUID;
BEGIN
    -- Insert instructor profiles and capture generated IDs
    INSERT INTO instructor_profiles (name, email, bio, specialties, certifications, status, join_date) VALUES
    (
        'Sarah Johnson',
        'sarah@steppers.com',
        'Certified fitness instructor with 8+ years experience in Chicago stepping and dance fitness.',
        ARRAY['Chicago Stepping', 'HIIT', 'Strength Training', 'Yoga'],
        ARRAY['ACE-CPT', 'NASM-CES', 'RYT-200'],
        'active',
        '2022-01-15'
    ) RETURNING id INTO sarah_id;

    INSERT INTO instructor_profiles (name, email, bio, specialties, certifications, status, join_date) VALUES
    (
        'Mike Chen',
        'mike@steppers.com',
        'Former athlete turned fitness coach specializing in high-intensity training.',
        ARRAY['CrossFit', 'Olympic Lifting', 'Cardio', 'Stepping'],
        ARRAY['CrossFit Level 2', 'USAW-L1'],
        'active',
        '2021-08-10'
    ) RETURNING id INTO mike_id;

    INSERT INTO instructor_profiles (name, email, bio, specialties, certifications, status, join_date) VALUES
    (
        'Emily Rodriguez',
        'emily@steppers.com',
        'Dance and movement specialist with expertise in various dance styles.',
        ARRAY['Dance Fitness', 'Pilates', 'Barre', 'Line Dancing'],
        ARRAY['PMA-CPT', 'AFAA'],
        'active',
        '2023-03-22'
    ) RETURNING id INTO emily_id;

    INSERT INTO instructor_profiles (name, email, bio, specialties, certifications, status, join_date) VALUES
    (
        'Marcus Williams',
        'marcus@steppers.com',
        'Chicago stepping legend with over 15 years of teaching experience.',
        ARRAY['Chicago Stepping', 'Walkin', 'Partner Dancing'],
        ARRAY['Certified Chicago Stepping Instructor'],
        'active',
        '2020-05-12'
    ) RETURNING id INTO marcus_id;

    -- Insert sample performance metrics for the last 30 days
    INSERT INTO instructor_performance_metrics (
        instructor_id, period_start, period_end, classes_count, total_students, unique_students,
        average_rating, total_ratings, total_revenue, average_class_size, cancellation_rate,
        no_show_rate, retention_rate, popularity_score, engagement_score
    ) VALUES
    (
        sarah_id,
        CURRENT_DATE - INTERVAL '30 days',
        CURRENT_DATE,
        42, 156, 89, 4.8, 134, 8240.00, 12.5, 0.08, 0.12, 0.76, 92, 88
    ),
    (
        mike_id,
        CURRENT_DATE - INTERVAL '30 days',
        CURRENT_DATE,
        38, 142, 78, 4.6, 98, 7560.00, 10.2, 0.12, 0.15, 0.68, 85, 82
    ),
    (
        emily_id,
        CURRENT_DATE - INTERVAL '30 days',
        CURRENT_DATE,
        35, 128, 72, 4.7, 89, 6890.00, 11.1, 0.06, 0.09, 0.82, 89, 91
    ),
    (
        marcus_id,
        CURRENT_DATE - INTERVAL '30 days',
        CURRENT_DATE,
        28, 95, 65, 4.9, 76, 5950.00, 9.8, 0.05, 0.08, 0.85, 94, 95
    );

    -- Insert sample class performance data
    INSERT INTO instructor_class_performance (
        class_name, instructor_id, category, difficulty_level, duration_minutes,
        average_rating, total_ratings, total_bookings, completion_rate, repeated_bookings,
        revenue, profit_margin, popularity_trend, last_offered
    ) VALUES
    (
        'Morning HIIT Blast',
        sarah_id,
        'Steppin Classes',
        'intermediate',
        45,
        4.9, 67, 284, 0.87, 156, 4260.00, 0.68, 'increasing', CURRENT_DATE - 1
    ),
    (
        'Strength & Power',
        mike_id,
        'Steppin Classes',
        'advanced',
        60,
        4.7, 43, 198, 0.92, 89, 3960.00, 0.72, 'stable', CURRENT_DATE - 2
    ),
    (
        'Dance Cardio Flow',
        emily_id,
        'Line Dancing Classes',
        'beginner',
        50,
        4.8, 52, 167, 0.84, 78, 3340.00, 0.65, 'increasing', CURRENT_DATE - 1
    ),
    (
        'Chicago Stepping Fundamentals',
        marcus_id,
        'Steppin Classes',
        'beginner',
        60,
        4.9, 65, 145, 0.89, 92, 2900.00, 0.70, 'increasing', CURRENT_DATE
    ),
    (
        'Walkin Technique Mastery',
        marcus_id,
        'Walkin Classes',
        'intermediate',
        45,
        4.8, 38, 98, 0.91, 54, 1960.00, 0.75, 'stable', CURRENT_DATE - 3
    );

    -- Insert sample student feedback
    INSERT INTO instructor_student_feedback (
        instructor_id, rating, review, aspects, verified, submitted_at
    ) VALUES
    (
        sarah_id,
        5,
        'Amazing energy and great modifications for all fitness levels!',
        '{"instruction": 5, "clarity": 5, "engagement": 5, "difficulty": 4, "environment": 5, "value": 5}',
        true,
        CURRENT_DATE - 2
    ),
    (
        mike_id,
        4,
        'Challenging workout but very effective. Would like more beginner options.',
        '{"instruction": 4, "clarity": 4, "engagement": 4, "difficulty": 5, "environment": 4, "value": 4}',
        true,
        CURRENT_DATE - 3
    ),
    (
        emily_id,
        5,
        'Love the dance combinations! Emily makes it so fun and easy to follow.',
        '{"instruction": 5, "clarity": 5, "engagement": 5, "difficulty": 3, "environment": 5, "value": 5}',
        true,
        CURRENT_DATE - 1
    ),
    (
        marcus_id,
        5,
        'Marcus is a true master of Chicago stepping. Learned so much!',
        '{"instruction": 5, "clarity": 5, "engagement": 5, "difficulty": 4, "environment": 5, "value": 5}',
        true,
        CURRENT_DATE
    );

    -- Insert sample revenue analytics
    INSERT INTO instructor_revenue_analytics (
        instructor_id, period_start, period_end, total_revenue, net_revenue,
        commission_rate, commission_earned, average_revenue_per_class, revenue_growth
    ) VALUES
    (
        sarah_id,
        CURRENT_DATE - INTERVAL '30 days',
        CURRENT_DATE,
        8240.00, 6592.00, 0.20, 1648.00, 196.19, 0.15
    ),
    (
        mike_id,
        CURRENT_DATE - INTERVAL '30 days',
        CURRENT_DATE,
        7560.00, 6048.00, 0.20, 1512.00, 198.95, 0.08
    ),
    (
        emily_id,
        CURRENT_DATE - INTERVAL '30 days',
        CURRENT_DATE,
        6890.00, 5512.00, 0.20, 1378.00, 196.86, 0.22
    ),
    (
        marcus_id,
        CURRENT_DATE - INTERVAL '30 days',
        CURRENT_DATE,
        5950.00, 4760.00, 0.20, 1190.00, 212.50, 0.18
    );

    -- Insert sample performance alerts
    INSERT INTO performance_alerts (
        alert_type, severity, instructor_id, message, threshold_value, current_value, actions
    ) VALUES
    (
        'low_rating',
        'medium',
        mike_id,
        'Average rating dropped below 4.5 threshold',
        4.5,
        4.3,
        ARRAY['Review recent feedback', 'Schedule coaching session', 'Adjust class difficulty']
    ),
    (
        'high_cancellation',
        'high',
        sarah_id,
        'High cancellation rate detected for evening classes',
        0.15,
        0.22,
        ARRAY['Investigate scheduling conflicts', 'Survey participants', 'Consider time slot changes']
    );

    -- Get first event ID for inventory examples
    SELECT id INTO first_event_id FROM events LIMIT 1;

    -- Insert sample web analytics data for demonstration
    INSERT INTO web_analytics_sessions (
        session_id, user_id, ip_address, user_agent, referrer, landing_page,
        started_at, ended_at, duration_seconds, page_views, events_count
    ) VALUES
    (
        'sess_001',
        NULL,
        '192.168.1.100',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'https://google.com',
        '/events',
        CURRENT_TIMESTAMP - INTERVAL '2 hours',
        CURRENT_TIMESTAMP - INTERVAL '1 hour 45 minutes',
        900,
        8,
        12
    ),
    (
        'sess_002',
        NULL,
        '10.0.0.50',
        'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)',
        'https://facebook.com',
        '/classes',
        CURRENT_TIMESTAMP - INTERVAL '1 hour 30 minutes',
        CURRENT_TIMESTAMP - INTERVAL '1 hour 15 minutes',
        900,
        5,
        8
    );

    -- Insert sample page views
    INSERT INTO web_analytics_page_views (
        session_id, page_url, page_title, referrer, duration_seconds, timestamp
    ) VALUES
    (
        'sess_001',
        '/events',
        'Stepping Events - SteppersLife',
        'https://google.com',
        180,
        CURRENT_TIMESTAMP - INTERVAL '2 hours'
    ),
    (
        'sess_001',
        '/events/123',
        'Chicago Stepping Championship - SteppersLife',
        '/events',
        300,
        CURRENT_TIMESTAMP - INTERVAL '1 hour 57 minutes'
    ),
    (
        'sess_002',
        '/classes',
        'Stepping Classes - SteppersLife',
        'https://facebook.com',
        240,
        CURRENT_TIMESTAMP - INTERVAL '1 hour 30 minutes'
    );

    -- Insert sample analytics events
    INSERT INTO web_analytics_events (
        session_id, event_type, event_data, page_url, timestamp
    ) VALUES
    (
        'sess_001',
        'button_click',
        '{"button_text": "View Event Details", "event_id": "123"}',
        '/events',
        CURRENT_TIMESTAMP - INTERVAL '1 hour 58 minutes'
    ),
    (
        'sess_001',
        'ticket_purchase_started',
        '{"event_id": "123", "ticket_type": "General Admission"}',
        '/events/123',
        CURRENT_TIMESTAMP - INTERVAL '1 hour 55 minutes'
    ),
    (
        'sess_002',
        'filter_applied',
        '{"filter_type": "category", "filter_value": "Steppin Classes"}',
        '/classes',
        CURRENT_TIMESTAMP - INTERVAL '1 hour 28 minutes'
    );

    -- Insert sample conversions
    INSERT INTO web_analytics_conversions (
        session_id, conversion_type, conversion_value, event_id, timestamp
    ) VALUES
    (
        'sess_001',
        'ticket_purchase',
        45.00,
        first_event_id,
        CURRENT_TIMESTAMP - INTERVAL '1 hour 50 minutes'
    );

    -- Insert sample inventory data if events exist
    IF first_event_id IS NOT NULL THEN
        INSERT INTO inventory_audit_logs (
            event_id, action, quantity_change, previous_quantity, new_quantity,
            channel, reason, timestamp
        ) VALUES
        (
            first_event_id,
            'ticket_sold',
            -2,
            50,
            48,
            'online',
            'Ticket purchase completed',
            CURRENT_TIMESTAMP - INTERVAL '1 hour'
        ),
        (
            first_event_id,
            'inventory_adjusted',
            10,
            48,
            58,
            'admin',
            'Additional tickets released',
            CURRENT_TIMESTAMP - INTERVAL '30 minutes'
        );
    END IF;

    RAISE NOTICE 'Sample analytics data inserted successfully';
END $$;