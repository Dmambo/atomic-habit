-- Comprehensive verification of the complete setup

DO $$
DECLARE
    user_uuid UUID;
    profile_exists BOOLEAN;
    goal_count INTEGER;
    habit_count INTEGER;
    completion_count INTEGER;
    goal_record RECORD;
    habit_record RECORD;
    streak_info RECORD;
BEGIN
    -- Get user ID
    SELECT id INTO user_uuid 
    FROM auth.users 
    WHERE email = 'ibkhalidworld@gmail.com';
    
    IF user_uuid IS NULL THEN
        RAISE NOTICE 'ERROR: User not found: ibkhalidworld@gmail.com';
        RAISE NOTICE 'Please sign up first with the provided credentials';
        RETURN;
    END IF;
    
    -- Check if profile exists
    SELECT EXISTS(SELECT 1 FROM public.profiles WHERE id = user_uuid) INTO profile_exists;
    
    -- Count data
    SELECT COUNT(*) INTO goal_count FROM public.goals WHERE user_id = user_uuid;
    SELECT COUNT(*) INTO habit_count FROM public.habits WHERE user_id = user_uuid;
    SELECT COUNT(*) INTO completion_count FROM public.habit_completions WHERE user_id = user_uuid;
    
    RAISE NOTICE '=== ATOMIC HABIT APP SETUP VERIFICATION ===';
    RAISE NOTICE 'User: ibkhalidworld@gmail.com';
    RAISE NOTICE 'User ID: %', user_uuid;
    RAISE NOTICE 'Profile exists: %', profile_exists;
    RAISE NOTICE 'Goals: %', goal_count;
    RAISE NOTICE 'Habits: %', habit_count;
    RAISE NOTICE 'Completions: %', completion_count;
    RAISE NOTICE '';
    
    IF NOT profile_exists THEN
        RAISE NOTICE 'WARNING: Profile not found. This may cause issues.';
        RETURN;
    END IF;
    
    -- Show goals summary
    RAISE NOTICE '=== GOALS SUMMARY ===';
    FOR goal_record IN 
        SELECT title, category, target_date, color
        FROM public.goals 
        WHERE user_id = user_uuid 
        ORDER BY created_at
    LOOP
        RAISE NOTICE '• % (%) - Due: % [%]', goal_record.title, goal_record.category, goal_record.target_date, goal_record.color;
    END LOOP;
    RAISE NOTICE '';
    
    -- Show habits summary with streaks
    RAISE NOTICE '=== HABITS SUMMARY ===';
    FOR habit_record IN 
        SELECT h.name, g.title as goal_title, h.preferred_time, h.habit_type
        FROM public.habits h
        JOIN public.goals g ON h.goal_id = g.id
        WHERE h.user_id = user_uuid 
        ORDER BY g.title, h.name
    LOOP
        RAISE NOTICE '• % (%) - % at %', habit_record.name, habit_record.goal_title, habit_record.habit_type, COALESCE(habit_record.preferred_time, 'No time set');
    END LOOP;
    RAISE NOTICE '';
    
    -- Show completion stats
    RAISE NOTICE '=== COMPLETION STATS ===';
    FOR streak_info IN
        SELECT 
            h.name,
            COUNT(hc.id) as total_completions,
            MAX(hc.completed_date) as last_completion
        FROM public.habits h
        LEFT JOIN public.habit_completions hc ON h.id = hc.habit_id
        WHERE h.user_id = user_uuid
        GROUP BY h.id, h.name
        ORDER BY total_completions DESC
    LOOP
        RAISE NOTICE '• %: % completions (last: %)', 
            streak_info.name, 
            streak_info.total_completions, 
            COALESCE(streak_info.last_completion::text, 'Never');
    END LOOP;
    RAISE NOTICE '';
    
    -- Test the functions
    RAISE NOTICE '=== TESTING FUNCTIONS ===';
    FOR habit_record IN
        SELECT h.id, h.name
        FROM public.habits h
        WHERE h.user_id = user_uuid
        LIMIT 3
    LOOP
        DECLARE
            streak_count INTEGER;
        BEGIN
            SELECT public.calculate_habit_streak(habit_record.id) INTO streak_count;
            RAISE NOTICE '• % streak: % days', habit_record.name, streak_count;
        END;
    END LOOP;
    
    RAISE NOTICE '';
    RAISE NOTICE '=== SETUP COMPLETE! ===';
    RAISE NOTICE 'You can now log into the app with:';
    RAISE NOTICE 'Email: ibkhalidworld@gmail.com';
    RAISE NOTICE 'Password: Ibranasky1';
    RAISE NOTICE '';
    RAISE NOTICE 'Your dashboard should show:';
    RAISE NOTICE '• % active goals', goal_count;
    RAISE NOTICE '• % habits to track', habit_count;
    RAISE NOTICE '• Recent completion history';
    RAISE NOTICE '• Streak counters and progress bars';
    
END $$;
