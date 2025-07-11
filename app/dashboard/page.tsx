"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Target,
  Plus,
  TrendingUp,
  Flame,
  CheckCircle,
  Clock,
  MoreHorizontal,
  Edit,
  Trash2,
  Settings,
  Bell,
  BarChart3,
  ArrowLeft,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"
import { AuthGuard } from "@/components/auth-guard"
import { useAuth } from "@/components/auth-provider"
import { getDashboardStats, toggleHabitCompletion, deleteGoal } from "@/lib/database"
import type { GoalWithProgress, HabitWithDetails } from "@/lib/supabase"

const motivationalQuotes = [
  "You are what you repeatedly do. Excellence, then, is not an act, but a habit.",
  "The secret to getting ahead is getting started.",
  "Success is the sum of small efforts repeated day in and day out.",
  "Habits are the compound interest of self-improvement.",
]

export default function Dashboard() {
  const { user, signOut } = useAuth()
  const [currentQuote] = useState(motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)])
  const [dashboardData, setDashboardData] = useState<{
    totalGoals: number
    completedToday: number
    longestStreak: number
    overallProgress: number
    goals: GoalWithProgress[]
    habits: HabitWithDetails[]
  } | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadDashboardData()
    }
  }, [user])

  const loadDashboardData = async () => {
    try {
      const data = await getDashboardStats(user!.id)
      setDashboardData(data)
    } catch (error) {
      console.error("Error loading dashboard data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleHabit = async (habitId: string) => {
    if (!user) return

    try {
      await toggleHabitCompletion(user.id, habitId)
      // Reload dashboard data to reflect changes
      await loadDashboardData()
    } catch (error) {
      console.error("Error toggling habit:", error)
    }
  }

  const handleLogout = async () => {
    await signOut()
  }

  if (isLoading) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto px-4 py-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-0">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-green-500 rounded-lg flex items-center justify-center">
                    <img src="/logo.png" alt="Atomic Habit Logo" className="w-5 h-5" />
                  </div>
                  <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                    Atomic Habit
                  </span>
                </div>
              </div>

              <nav className="hidden md:flex items-center space-x-6">
                <Link href="/dashboard" className="text-sm font-medium text-primary">
                  Dashboard
                </Link>
                <Link href="/goals" className="text-sm font-medium text-muted-foreground hover:text-primary">
                  Goals
                </Link>
                <Link href="/progress" className="text-sm font-medium text-muted-foreground hover:text-primary">
                  Progress
                </Link>
                <Link href="/settings" className="text-sm font-medium text-muted-foreground hover:text-primary">
                  Settings
                </Link>
              </nav>

              <div className="flex items-center space-x-4">
                <ThemeToggle />
                <Button variant="ghost" size="icon">
                  <Bell className="h-4 w-4" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Avatar className="cursor-pointer">
                      <AvatarImage src="/placeholder-user.jpg" />
                      <AvatarFallback>
                        {user?.user_metadata?.full_name
                          ?.split(" ")
                          .map((n: string) => n[0])
                          .join("")
                          .toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href="/settings">
                        <Settings className="h-4 w-4 mr-2" />
                        Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout}>
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">
              Good morning, {user?.user_metadata?.full_name?.split(" ")[0] || "there"}! 👋
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground mb-4">Ready to build some great habits today?</p>

            {/* Motivational Quote */}
            <Card className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-950/50 dark:to-green-950/50 border-none">
              <CardContent className="p-4">
                <p className="text-sm italic text-center">"{currentQuote}"</p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 gap-y-8 mb-8">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Target className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="text-2xl font-bold">{dashboardData?.totalGoals || 0}</p>
                    <p className="text-xs text-muted-foreground">Active Goals</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="text-2xl font-bold">{dashboardData?.completedToday || 0}</p>
                    <p className="text-xs text-muted-foreground">Completed Today</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Flame className="h-5 w-5 text-orange-500" />
                  <div>
                    <p className="text-2xl font-bold">{dashboardData?.longestStreak || 0}</p>
                    <p className="text-xs text-muted-foreground">Longest Streak</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-purple-500" />
                  <div>
                    <p className="text-2xl font-bold">{dashboardData?.overallProgress || 0}%</p>
                    <p className="text-xs text-muted-foreground">Overall Progress</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Goals Section */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Your Goals</h2>
            <Link href="/goals/new">
              <Button className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600">
                <Plus className="w-4 h-4 mr-2" />
                Add New Goal
              </Button>
            </Link>
          </div>

          {dashboardData?.goals && dashboardData.goals.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 gap-y-8 mb-8">
              {dashboardData.goals.map((goal) => (
                <Card key={goal.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${goal.color}`} />
                          <CardTitle className="text-lg">{goal.title}</CardTitle>
                        </div>
                        <CardDescription>{goal.description}</CardDescription>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/goals/${goal.id}/edit`}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Goal
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600" onClick={async () => {
                            if (confirm("Are you sure you want to delete this goal? This action cannot be undone and will also delete all associated habits.")) {
                              await deleteGoal(goal.id);
                              await loadDashboardData();
                              alert("Goal deleted successfully!");
                            }
                          }}>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Goal
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Progress</span>
                        <Badge variant="secondary">{goal.progress_percentage}%</Badge>
                      </div>
                      <Progress value={goal.progress_percentage} className="h-2" />
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-1">
                        <Flame className="h-4 w-4 text-orange-500" />
                        <span>{goal.current_streak} day streak</span>
                      </div>
                      <div className="text-muted-foreground">
                        {goal.completed_today}/{goal.total_habits} habits today
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Next habit due soon</p>
                          <p className="text-xs text-muted-foreground">Check your habits</p>
                        </div>
                      </div>
                      <Link href={`/goals/${goal.id}`}>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center mb-8">
              <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No goals yet</h3>
              <p className="text-muted-foreground mb-4">Start your journey by creating your first goal.</p>
              <Link href="/goals/new">
                <Button className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Goal
                </Button>
              </Link>
            </Card>
          )}

          {/* Today's Habits */}
          {dashboardData?.habits && dashboardData.habits.length > 0 ? (
            <div className="mb-8">
              <h2 className="text-xl sm:text-2xl font-bold mb-6">Today's Habits</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 gap-y-8">
                {dashboardData.habits.map((habit) => (
                  <Card
                    key={habit.id}
                    className={`transition-all duration-200 cursor-pointer ${
                      habit.completed_today
                        ? "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800"
                        : ""
                    }`}
                    // This calls the backend to toggle completion
                    onClick={() => handleToggleHabit(habit.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 ${
                            habit.completed_today
                              ? "bg-green-500 border-green-500"
                              : "border-muted-foreground hover:border-green-500"
                          }`}
                        >
                          {habit.completed_today && <CheckCircle className="w-3 h-3 text-white" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3
                            className={`font-medium ${
                              habit.completed_today ? "line-through text-muted-foreground" : ""
                            }`}
                          >
                            {habit.name}
                          </h3>
                          <div className="flex items-center justify-between text-sm text-muted-foreground mt-1">
                            <div className="flex items-center space-x-2">
                              {habit.preferred_time && (
                                <div className="flex items-center space-x-1">
                                  <Clock className="h-3 w-3" />
                                  <span>{habit.preferred_time}</span>
                                </div>
                              )}
                              <div className="flex items-center space-x-1">
                                <Flame className="h-3 w-3 text-orange-500" />
                                <span>{habit.current_streak}</span>
                              </div>
                            </div>
                            <Badge
                              variant={habit.habit_type === "build" ? "default" : "destructive"}
                              className="text-xs"
                            >
                              {habit.habit_type === "build" ? "Build" : "Break"}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <Card className="p-8 text-center mb-8">
              <Flame className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No habits for today</h3>
              <p className="text-muted-foreground mb-4">Add a new habit to get started!</p>
              <Link href="/habits/new">
                <Button className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Habit
                </Button>
              </Link>
            </Card>
          )}

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 gap-y-8">
            <Link href="/progress">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6 text-center">
                  <BarChart3 className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                  <h3 className="font-semibold mb-1">View Progress</h3>
                  <p className="text-sm text-muted-foreground">See your detailed analytics</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/habits/new">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6 text-center">
                  <Plus className="h-8 w-8 mx-auto mb-2 text-green-500" />
                  <h3 className="font-semibold mb-1">Add Habit</h3>
                  <p className="text-sm text-muted-foreground">Create a new habit</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/settings">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6 text-center">
                  <Settings className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                  <h3 className="font-semibold mb-1">Settings</h3>
                  <p className="text-sm text-muted-foreground">Customize your experience</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}
