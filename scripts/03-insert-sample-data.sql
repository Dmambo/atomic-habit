-- This script will insert some sample data for testing
-- You can run this after creating your first user account

-- Note: Replace 'YOUR_USER_ID_HERE' with your actual user ID from auth.users
-- You can get this by running: SELECT id FROM auth.users WHERE email = 'your-email@example.com';

-- Sample goals (uncomment and replace USER_ID after you create an account)
/*
INSERT INTO public.goals (user_id, title, description, category, color, target_date, motivation_note) VALUES
('YOUR_USER_ID_HERE', 'Fitness & Health', 'Build a strong and healthy body through consistent exercise and healthy habits', 'Health', 'from-blue-500 to-green-500', '2024-12-31', 'Every workout makes me stronger and more confident!'),
('YOUR_USER_ID_HERE', 'Learning & Growth', 'Expand knowledge and skills through continuous learning', 'Education', 'from-purple-500 to-pink-500', '2024-11-30', 'Knowledge is power, and I''m building my future!'),
('YOUR_USER_ID_HERE', 'Mindfulness', 'Cultivate inner peace and awareness through meditation and reflection', 'Wellness', 'from-green-500 to-teal-500', '2024-10-31', 'Peace comes from within. I am creating my sanctuary.'),
('YOUR_USER_ID_HERE', 'Productivity', 'Optimize work and personal efficiency through better systems', 'Work', 'from-orange-500 to-red-500', '2024-12-15', 'Small improvements compound into extraordinary results.');
*/

-- Sample habits (uncomment and replace GOAL_IDs after creating goals)
/*
INSERT INTO public.habits (user_id, goal_id, name, description, habit_type, frequency, preferred_time, cue, reward, notes) VALUES
('YOUR_USER_ID_HERE', 'GOAL_ID_1', 'Morning workout', 'Start with 5 minutes of stretching, then 20 minutes of cardio', 'build', 'daily', '7:00 AM', 'Right after I wake up and brush my teeth', 'Feel energized and accomplished for the rest of the day', 'Focus on consistency over intensity'),
('YOUR_USER_ID_HERE', 'GOAL_ID_1', 'Drink 8 glasses of water', 'Stay hydrated throughout the day', 'build', 'daily', 'Throughout day', 'Every time I eat a meal', 'Feel refreshed and healthy', 'Use a water tracking app'),
('YOUR_USER_ID_HERE', 'GOAL_ID_2', 'Read for 30 minutes', 'Read educational or personal development books', 'build', 'daily', '8:00 PM', 'After dinner and cleaning up', 'Learn something new and expand my knowledge', 'Keep a reading journal to track insights'),
('YOUR_USER_ID_HERE', 'GOAL_ID_3', 'Morning meditation', 'Practice mindfulness and set intentions for the day', 'build', 'daily', '6:30 AM', 'Right after waking up, before checking phone', 'Feel centered and peaceful', 'Start with just 5 minutes');
*/
