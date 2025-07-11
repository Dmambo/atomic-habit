-- Verify the data was inserted correctly for ibkhalidworld@gmail.com

DO $$
DECLARE
    user_uuid UUID;
    goal_count INTEGER;
    habit_count INTEGER;
    completion_count INTEGER;
BEGIN
    -- Get user ID
    SELECT id INTO user_uuid 
    FROM auth.users 
    WHERE email = 'ibkhalidworld@gmail.com';
    
    IF user_uuid IS NULL THEN
        RAISE NOTICE 'User not found: ibkhalidworld@gmail.com';
        RETURN;
    END IF;
    
    -- Count goals
    SELECT COUNT(*) INTO goal_count
    FROM public.goals
    WHERE user_id = user_uuid;
    
    -- Count habits
    SELECT COUNT(*) INTO habit_count
    FROM public.habits
    WHERE user_id = user_uuid;
    
    -- Count completions
    SELECT COUNT(*) INTO completion_count
    FROM public.habit_completions
    WHERE user_id = user_uuid;
    
    RAISE NOTICE 'User: % (ID: %)', 'ibkhalidworld@gmail.com', user_uuid;
    RAISE NOTICE 'Goals: %', goal_count;
    RAISE NOTICE 'Habits: %', habit_count;
    RAISE NOTICE 'Completions: %', completion_count;
    
    -- Show goals summary
    RAISE NOTICE '--- GOALS ---';
    FOR rec IN 
        SELECT title, category, target_date 
        FROM public.goals 
        WHERE user_id = user_uuid 
        ORDER BY created_at
    LOOP
        RAISE NOTICE 'Goal: % (%) - Due: %', rec.title, rec.category, rec.target_date;
    END LOOP;
    
    -- Show habits summary
    RAISE NOTICE '--- HABITS ---';
    FOR rec IN 
        SELECT h.name, g.title as goal_title, h.preferred_time
        FROM public.habits h
        JOIN public.goals g ON h.goal_id = g.id
        WHERE h.user_id = user_uuid 
        ORDER BY g.title, h.name
    LOOP
        RAISE NOTICE 'Habit: % (Goal: %) at %', rec.name, rec.goal_title, rec.preferred_time;
    END LOOP;
    
END $$;
