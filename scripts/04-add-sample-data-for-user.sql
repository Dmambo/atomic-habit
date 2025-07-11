-- Add sample data for user: ibkhalidworld@gmail.com
-- This script will automatically get the user ID and insert sample goals and habits

DO $$
DECLARE
    user_uuid UUID;
    goal_fitness_uuid UUID;
    goal_learning_uuid UUID;
    goal_mindfulness_uuid UUID;
    goal_productivity_uuid UUID;
BEGIN
    -- Get the user ID for ibkhalidworld@gmail.com
    SELECT id INTO user_uuid 
    FROM auth.users 
    WHERE email = 'ibkhalidworld@gmail.com';
    
    -- Check if user exists
    IF user_uuid IS NULL THEN
        RAISE EXCEPTION 'User with email ibkhalidworld@gmail.com not found. Please sign up first.';
    END IF;
    
    -- Insert sample goals
    INSERT INTO public.goals (id, user_id, title, description, category, color, target_date, motivation_note) VALUES
    (gen_random_uuid(), user_uuid, 'Fitness & Health', 'Build a strong and healthy body through consistent exercise and healthy habits', 'Health', 'from-blue-500 to-green-500', '2024-12-31', 'Every workout makes me stronger and more confident!')
    RETURNING id INTO goal_fitness_uuid;
    
    INSERT INTO public.goals (id, user_id, title, description, category, color, target_date, motivation_note) VALUES
    (gen_random_uuid(), user_uuid, 'Learning & Growth', 'Expand knowledge and skills through continuous learning', 'Education', 'from-purple-500 to-pink-500', '2024-11-30', 'Knowledge is power, and I''m building my future!')
    RETURNING id INTO goal_learning_uuid;
    
    INSERT INTO public.goals (id, user_id, title, description, category, color, target_date, motivation_note) VALUES
    (gen_random_uuid(), user_uuid, 'Mindfulness', 'Cultivate inner peace and awareness through meditation and reflection', 'Wellness', 'from-green-500 to-teal-500', '2024-10-31', 'Peace comes from within. I am creating my sanctuary.')
    RETURNING id INTO goal_mindfulness_uuid;
    
    INSERT INTO public.goals (id, user_id, title, description, category, color, target_date, motivation_note) VALUES
    (gen_random_uuid(), user_uuid, 'Productivity', 'Optimize work and personal efficiency through better systems', 'Work', 'from-orange-500 to-red-500', '2024-12-15', 'Small improvements compound into extraordinary results.')
    RETURNING id INTO goal_productivity_uuid;
    
    -- Insert sample habits for Fitness & Health goal
    INSERT INTO public.habits (user_id, goal_id, name, description, habit_type, frequency, preferred_time, cue, reward, notes) VALUES
    (user_uuid, goal_fitness_uuid, 'Morning workout', 'Start with 5 minutes of stretching, then 20 minutes of cardio', 'build', 'daily', '7:00 AM', 'Right after I wake up and brush my teeth', 'Feel energized and accomplished for the rest of the day', 'Focus on consistency over intensity'),
    (user_uuid, goal_fitness_uuid, 'Drink 8 glasses of water', 'Stay hydrated throughout the day', 'build', 'daily', 'Throughout day', 'Every time I eat a meal', 'Feel refreshed and healthy', 'Use a water tracking app'),
    (user_uuid, goal_fitness_uuid, 'Take vitamins', 'Daily multivitamin and vitamin D', 'build', 'daily', '8:00 AM', 'Right after breakfast', 'Support my health and energy levels', 'Keep vitamins next to coffee maker'),
    (user_uuid, goal_fitness_uuid, 'Evening walk', 'Take a 20-minute walk to unwind', 'build', 'daily', '7:00 PM', 'After dinner', 'Clear my mind and get fresh air', 'Listen to podcasts or music');
    
    -- Insert sample habits for Learning & Growth goal
    INSERT INTO public.habits (user_id, goal_id, name, description, habit_type, frequency, preferred_time, cue, reward, notes) VALUES
    (user_uuid, goal_learning_uuid, 'Read for 30 minutes', 'Read educational or personal development books', 'build', 'daily', '8:00 PM', 'After dinner and cleaning up', 'Learn something new and expand my knowledge', 'Keep a reading journal to track insights'),
    (user_uuid, goal_learning_uuid, 'Practice coding', 'Work on programming skills and projects', 'build', 'daily', '9:00 AM', 'After morning coffee', 'Improve my technical abilities', 'Focus on one concept at a time'),
    (user_uuid, goal_learning_uuid, 'Watch educational videos', 'Learn from online courses or tutorials', 'build', 'daily', '6:00 PM', 'During commute or break time', 'Stay updated with new knowledge', 'Take notes on key concepts');
    
    -- Insert sample habits for Mindfulness goal
    INSERT INTO public.habits (user_id, goal_id, name, description, habit_type, frequency, preferred_time, cue, reward, notes) VALUES
    (user_uuid, goal_mindfulness_uuid, 'Morning meditation', 'Practice mindfulness and set intentions for the day', 'build', 'daily', '6:30 AM', 'Right after waking up, before checking phone', 'Feel centered and peaceful', 'Start with just 5 minutes'),
    (user_uuid, goal_mindfulness_uuid, 'Gratitude journaling', 'Write down 3 things I''m grateful for', 'build', 'daily', '9:00 PM', 'Before going to bed', 'End the day with positive thoughts', 'Keep journal by bedside');
    
    -- Insert sample habits for Productivity goal
    INSERT INTO public.habits (user_id, goal_id, name, description, habit_type, frequency, preferred_time, cue, reward, notes) VALUES
    (user_uuid, goal_productivity_uuid, 'Plan tomorrow', 'Review and plan the next day''s priorities', 'build', 'daily', '8:30 PM', 'After finishing work tasks', 'Feel prepared and organized', 'Use a simple to-do list'),
    (user_uuid, goal_productivity_uuid, 'Limit social media', 'Check social media only twice per day', 'break', 'daily', 'Set times', 'When feeling urge to scroll', 'More time for meaningful activities', 'Use app timers to track usage'),
    (user_uuid, goal_productivity_uuid, 'Deep work session', 'Focus on important tasks without distractions', 'build', 'daily', '10:00 AM', 'After checking emails', 'Make significant progress on goals', 'Use pomodoro technique');
    
    -- Insert some sample habit completions for the past few days to show streaks
    INSERT INTO public.habit_completions (user_id, habit_id, completed_date)
    SELECT 
        user_uuid,
        h.id,
        CURRENT_DATE - INTERVAL '1 day' * generate_series(0, 4)
    FROM public.habits h
    WHERE h.user_id = user_uuid 
      AND h.name IN ('Morning workout', 'Morning meditation', 'Read for 30 minutes')
      AND random() > 0.2; -- 80% completion rate for sample data
    
    RAISE NOTICE 'Sample data successfully added for user: ibkhalidworld@gmail.com';
    RAISE NOTICE 'Goals created: %, %, %, %', goal_fitness_uuid, goal_learning_uuid, goal_mindfulness_uuid, goal_productivity_uuid;
    
END $$;
