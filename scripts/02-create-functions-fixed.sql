-- Function to handle user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
DROP TRIGGER IF EXISTS handle_updated_at ON public.profiles;
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_updated_at ON public.goals;
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.goals
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_updated_at ON public.habits;
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.habits
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Function to calculate habit streaks
CREATE OR REPLACE FUNCTION public.calculate_habit_streak(habit_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
  current_streak INTEGER := 0;
  check_date DATE := CURRENT_DATE;
  completion_exists BOOLEAN;
BEGIN
  -- Check if habit was completed today, if not start from yesterday
  SELECT EXISTS(
    SELECT 1 FROM public.habit_completions 
    WHERE habit_id = habit_uuid AND completed_date = CURRENT_DATE
  ) INTO completion_exists;
  
  IF NOT completion_exists THEN
    check_date := CURRENT_DATE - INTERVAL '1 day';
  END IF;
  
  -- Count consecutive days backwards
  LOOP
    SELECT EXISTS(
      SELECT 1 FROM public.habit_completions 
      WHERE habit_id = habit_uuid AND completed_date = check_date
    ) INTO completion_exists;
    
    IF completion_exists THEN
      current_streak := current_streak + 1;
      check_date := check_date - INTERVAL '1 day';
    ELSE
      EXIT;
    END IF;
  END LOOP;
  
  RETURN current_streak;
END;
$$ LANGUAGE plpgsql;

-- Function to get goal progress
CREATE OR REPLACE FUNCTION public.get_goal_progress(goal_uuid UUID)
RETURNS JSON AS $$
DECLARE
  total_habits INTEGER;
  completed_today INTEGER;
  total_completions INTEGER;
  total_possible INTEGER;
  progress_percentage NUMERIC;
  result JSON;
BEGIN
  -- Get total habits for this goal
  SELECT COUNT(*) INTO total_habits
  FROM public.habits 
  WHERE goal_id = goal_uuid AND is_active = true;
  
  -- Get habits completed today
  SELECT COUNT(*) INTO completed_today
  FROM public.habits h
  JOIN public.habit_completions hc ON h.id = hc.habit_id
  WHERE h.goal_id = goal_uuid 
    AND h.is_active = true 
    AND hc.completed_date = CURRENT_DATE;
  
  -- Calculate overall progress (last 30 days)
  SELECT COUNT(*) INTO total_completions
  FROM public.habits h
  JOIN public.habit_completions hc ON h.id = hc.habit_id
  WHERE h.goal_id = goal_uuid 
    AND h.is_active = true 
    AND hc.completed_date >= CURRENT_DATE - INTERVAL '30 days';
  
  total_possible := total_habits * 30;
  
  IF total_possible > 0 THEN
    progress_percentage := ROUND((total_completions::NUMERIC / total_possible::NUMERIC) * 100);
  ELSE
    progress_percentage := 0;
  END IF;
  
  result := json_build_object(
    'total_habits', total_habits,
    'completed_today', completed_today,
    'progress_percentage', progress_percentage,
    'total_completions', total_completions
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;
