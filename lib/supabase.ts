import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for our database tables
export interface Profile {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  timezone?: string
  created_at: string
  updated_at: string
}

export interface Goal {
  id: string
  user_id: string
  title: string
  description?: string
  category: string
  color: string
  target_date: string
  motivation_note?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Habit {
  id: string
  user_id: string
  goal_id: string
  name: string
  description?: string
  habit_type: "build" | "break"
  frequency: string
  preferred_time?: string
  cue?: string
  reward?: string
  notes?: string
  reminders_enabled: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface HabitCompletion {
  id: string
  user_id: string
  habit_id: string
  completed_date: string
  notes?: string
  created_at: string
}

export interface GoalWithProgress extends Goal {
  total_habits: number
  completed_today: number
  progress_percentage: number
  current_streak: number
}

export interface HabitWithDetails extends Habit {
  goal_title: string
  goal_color: string
  current_streak: number
  completed_today: boolean
  completion_rate: number
}
