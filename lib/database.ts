import { supabase } from "./supabase"
import type { Goal, Habit, Profile, GoalWithProgress, HabitWithDetails } from "./supabase"

// Auth functions
export async function getCurrentUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error) throw error
  return user
}

export async function signUp(email: string, password: string, fullName: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  })
  if (error) throw error
  return data
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  if (error) throw error
  return data
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

// Profile functions
export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

  if (error && error.code !== "PGRST116") throw error
  return data
}

export async function updateProfile(userId: string, updates: Partial<Profile>) {
  const { data, error } = await supabase.from("profiles").update(updates).eq("id", userId).select().single()

  if (error) throw error
  return data
}

// Goal functions
export async function getGoals(userId: string): Promise<GoalWithProgress[]> {
  const { data, error } = await supabase
    .from("goals")
    .select(`
      *,
      habits!inner(id, is_active)
    `)
    .eq("user_id", userId)
    .eq("is_active", true)
    .order("created_at", { ascending: false })

  if (error) throw error

  // Get progress for each goal
  const goalsWithProgress = await Promise.all(
    data.map(async (goal) => {
      const { data: progressData } = await supabase.rpc("get_goal_progress", {
        goal_uuid: goal.id,
      })

      const progress = progressData || {
        total_habits: 0,
        completed_today: 0,
        progress_percentage: 0,
        total_completions: 0,
      }

      // Calculate current streak (simplified - you might want to make this more sophisticated)
      const currentStreak = await calculateGoalStreak(goal.id)

      return {
        ...goal,
        total_habits: progress.total_habits,
        completed_today: progress.completed_today,
        progress_percentage: progress.progress_percentage,
        current_streak: currentStreak,
      }
    }),
  )

  return goalsWithProgress
}

export async function getGoal(goalId: string): Promise<GoalWithProgress | null> {
  const { data, error } = await supabase.from("goals").select("*").eq("id", goalId).single()

  if (error) throw error

  const { data: progressData } = await supabase.rpc("get_goal_progress", {
    goal_uuid: goalId,
  })

  const progress = progressData || {
    total_habits: 0,
    completed_today: 0,
    progress_percentage: 0,
    total_completions: 0,
  }

  const currentStreak = await calculateGoalStreak(goalId)

  return {
    ...data,
    total_habits: progress.total_habits,
    completed_today: progress.completed_today,
    progress_percentage: progress.progress_percentage,
    current_streak: currentStreak,
  }
}

export async function createGoal(
  userId: string,
  goalData: Omit<Goal, "id" | "user_id" | "created_at" | "updated_at" | "is_active">,
) {
  const { data, error } = await supabase
    .from("goals")
    .insert({
      ...goalData,
      user_id: userId,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateGoal(goalId: string, updates: Partial<Goal>) {
  const { data, error } = await supabase.from("goals").update(updates).eq("id", goalId).select().single()

  if (error) throw error
  return data
}

export async function deleteGoal(goalId: string) {
  // Soft delete the goal
  const { error: goalError } = await supabase.from("goals").update({ is_active: false }).eq("id", goalId)
  if (goalError) throw goalError

  // Soft delete all habits associated with the goal
  const { error: habitError } = await supabase.from("habits").update({ is_active: false }).eq("goal_id", goalId)
  if (habitError) throw habitError
}

// Habit functions
export async function getHabits(userId: string, goalId?: string): Promise<HabitWithDetails[]> {
  let query = supabase
    .from("habits")
    .select(`
      *,
      goals!inner(title, color)
    `)
    .eq("user_id", userId)
    .eq("is_active", true)

  if (goalId) {
    query = query.eq("goal_id", goalId)
  }

  const { data, error } = await query.order("created_at", { ascending: false })

  if (error) throw error

  // Filter for habits due today (simple version: daily or preferred_time matches today)
  const today = new Date()
  const todayDay = today.getDay() // 0 (Sun) - 6 (Sat)
  const todayStr = today.toISOString().split('T')[0]

  const dueToday = data.filter((habit) => {
    if (habit.frequency === 'daily') return true
    // Example: if frequency is 'weekly' and preferred_time is a weekday name
    if (habit.frequency === 'weekly' && habit.preferred_time) {
      // preferred_time could be 'Monday', 'Tuesday', etc.
      const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
      return days[todayDay] === habit.preferred_time
    }
    // Add more logic for custom frequencies if needed
    return false
  })

  // Get additional details for each habit
  const habitsWithDetails = await Promise.all(
    dueToday.map(async (habit) => {
      const currentStreak = await calculateHabitStreak(habit.id)
      const completedToday = await isHabitCompletedToday(habit.id)
      const completionRate = await calculateHabitCompletionRate(habit.id)

      return {
        ...habit,
        goal_title: habit.goals.title,
        goal_color: habit.goals.color,
        current_streak: currentStreak,
        completed_today: completedToday,
        completion_rate: completionRate,
      }
    }),
  )

  return habitsWithDetails
}

export async function getHabit(habitId: string): Promise<HabitWithDetails | null> {
  const { data, error } = await supabase
    .from("habits")
    .select(`
      *,
      goals!inner(title, color)
    `)
    .eq("id", habitId)
    .single()

  if (error) throw error

  const currentStreak = await calculateHabitStreak(habitId)
  const completedToday = await isHabitCompletedToday(habitId)
  const completionRate = await calculateHabitCompletionRate(habitId)

  return {
    ...data,
    goal_title: data.goals.title,
    goal_color: data.goals.color,
    current_streak: currentStreak,
    completed_today: completedToday,
    completion_rate: completionRate,
  }
}

export async function createHabit(
  userId: string,
  habitData: Omit<Habit, "id" | "user_id" | "created_at" | "updated_at" | "is_active">,
) {
  const { data, error } = await supabase
    .from("habits")
    .insert({
      ...habitData,
      user_id: userId,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateHabit(habitId: string, updates: Partial<Habit>) {
  const { data, error } = await supabase.from("habits").update(updates).eq("id", habitId).select().single()

  if (error) throw error
  return data
}

export async function deleteHabit(habitId: string) {
  const { error } = await supabase.from("habits").update({ is_active: false }).eq("id", habitId)

  if (error) throw error
}

// Habit completion functions
export async function toggleHabitCompletion(
  userId: string,
  habitId: string,
  date: string = new Date().toISOString().split("T")[0],
) {
  // Check if already completed
  const { data: existing } = await supabase
    .from("habit_completions")
    .select("id")
    .eq("habit_id", habitId)
    .eq("completed_date", date)
    .single()

  if (existing) {
    // Remove completion
    const { error } = await supabase.from("habit_completions").delete().eq("id", existing.id)

    if (error) throw error
    return false
  } else {
    // Add completion
    const { error } = await supabase.from("habit_completions").insert({
      user_id: userId,
      habit_id: habitId,
      completed_date: date,
    })

    if (error) throw error
    return true
  }
}

export async function getHabitCompletions(habitId: string, days = 90) {
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  const { data, error } = await supabase
    .from("habit_completions")
    .select("completed_date")
    .eq("habit_id", habitId)
    .gte("completed_date", startDate.toISOString().split("T")[0])
    .order("completed_date", { ascending: true })

  if (error) throw error
  return data
}

// Helper functions
async function calculateHabitStreak(habitId: string): Promise<number> {
  const { data, error } = await supabase.rpc("calculate_habit_streak", {
    habit_uuid: habitId,
  })

  if (error) {
    console.error("Error calculating streak:", error)
    return 0
  }

  return data || 0
}

async function isHabitCompletedToday(habitId: string): Promise<boolean> {
  const today = new Date().toISOString().split("T")[0]

  const { data, error } = await supabase
    .from("habit_completions")
    .select("id")
    .eq("habit_id", habitId)
    .eq("completed_date", today)
    .single()

  return !error && !!data
}

async function calculateHabitCompletionRate(habitId: string): Promise<number> {
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const { data, error } = await supabase
    .from("habit_completions")
    .select("completed_date")
    .eq("habit_id", habitId)
    .gte("completed_date", thirtyDaysAgo.toISOString().split("T")[0])

  if (error) return 0

  return Math.round((data.length / 30) * 100)
}

async function calculateGoalStreak(goalId: string): Promise<number> {
  // This is a simplified calculation - you might want to make it more sophisticated
  // For now, we'll return the average streak of all habits in the goal
  const { data: habits } = await supabase.from("habits").select("id").eq("goal_id", goalId).eq("is_active", true)

  if (!habits || habits.length === 0) return 0

  const streaks = await Promise.all(habits.map((habit) => calculateHabitStreak(habit.id)))

  return Math.round(streaks.reduce((sum, streak) => sum + streak, 0) / streaks.length)
}

// Dashboard stats
export async function getDashboardStats(userId: string) {
  const goals = await getGoals(userId)
  const habits = await getHabits(userId)

  const totalGoals = goals.length
  const completedToday = habits.filter((h) => h.completed_today).length
  const longestStreak = Math.max(...habits.map((h) => h.current_streak), 0)
  const overallProgress =
    goals.length > 0 ? Math.round(goals.reduce((sum, goal) => sum + goal.progress_percentage, 0) / goals.length) : 0

  return {
    totalGoals,
    completedToday,
    longestStreak,
    overallProgress,
    goals,
    habits,
  }
}
