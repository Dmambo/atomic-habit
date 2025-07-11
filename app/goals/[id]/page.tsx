"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Target,
  Plus,
  Calendar,
  TrendingUp,
  Flame,
  Clock,
  MoreHorizontal,
  Edit,
  Trash2,
  ArrowLeft,
  Star,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { useParams } from "next/navigation"
import { AuthGuard } from "@/components/auth-guard"
import { useAuth } from "@/hooks/use-auth"
import { getGoal, getHabits, toggleHabitCompletion } from "@/lib/database"
import type { GoalWithProgress, HabitWithDetails } from "@/lib/types"

export default function GoalDetailPage() {
  const params = useParams()
  const { user } = useAuth()
  const [goalData, setGoalData] = useState<GoalWithProgress | null>(null)
  const [habits, setHabits] = useState<HabitWithDetails[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (user && params.id) {
      loadGoalData()
    }
  }, [user, params.id])

  const loadGoalData = async () => {
    try {
      const [goal, goalHabits] = await Promise.all([
        getGoal(params.id as string),
        getHabits(user!.id, params.id as string),
      ])

      setGoalData(goal)
      setHabits(goalHabits)
    } catch (error) {
      console.error("Error loading goal data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleHabit = async (habitId: string) => {
    if (!user) return

    try {
      await toggleHabitCompletion(user.id, habitId)
      // Reload data to reflect changes
      await loadGoalData()
    } catch (error) {
      console.error("Error toggling habit:", error)
    }
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

  if (!goalData) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Goal not found</h1>
            <Link href="/goals">
              <Button>Back to Goals</Button>
            </Link>
          </div>
        </div>
      </AuthGuard>
    )
  }

  const completedHabits = habits.filter((h) => h.completed_today).length
  const totalHabits = habits.length
  const progressPercentage = totalHabits > 0 ? Math.round((completedHabits / totalHabits) * 100) : 0

  return (
    <AuthGuard>
      {/* Rest of the component remains the same */}
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link href="/dashboard">
                  <Button variant="ghost" size="icon">
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                </Link>
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${goalData.color}`} />
                  <h1 className="text-xl font-bold">{goalData.title}</h1>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Link href={`/goals/${params.id}/edit`}>
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Goal
                  </Button>
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/goals/${params.id}/edit`}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Goal
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Goal
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          {/* Goal Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 gap-y-8 mb-8">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Target className="h-5 w-5" />
                    <span>Goal Overview</span>
                  </CardTitle>
                  <CardDescription>{goalData.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Overall Progress</span>
                      <Badge variant="secondary">{goalData.progress_percentage}%</Badge>
                    </div>
                    <Progress value={goalData.progress_percentage} className="h-3" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Flame className="h-5 w-5 text-orange-500" />
                      <div>
                        <p className="text-lg font-bold">{goalData.streak}</p>
                        <p className="text-sm text-muted-foreground">Day Streak</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-5 w-5 text-blue-500" />
                      <div>
                        <p className="text-lg font-bold">{new Date(goalData.target_date).toLocaleDateString()}</p>
                        <p className="text-sm text-muted-foreground">Target Date</p>
                      </div>
                    </div>
                  </div>

                  {goalData.motivation_note && (
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-950/50 dark:to-green-950/50 rounded-lg">
                      <div className="flex items-start space-x-2">
                        <Star className="h-5 w-5 text-yellow-500 mt-0.5" />
                        <div>
                          <p className="font-medium text-sm">Motivation</p>
                          <p className="text-sm italic">{goalData.motivation_note}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Today's Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center space-y-4">
                    <div className="relative w-24 h-24 mx-auto">
                      <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          stroke="currentColor"
                          strokeWidth="8"
                          fill="transparent"
                          className="text-muted-foreground/20"
                        />
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          stroke="url(#gradient)"
                          strokeWidth="8"
                          fill="transparent"
                          strokeDasharray={`${progressPercentage * 2.51} 251`}
                          className="transition-all duration-300"
                        />
                        <defs>
                          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#3b82f6" />
                            <stop offset="100%" stopColor="#10b981" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-2xl font-bold">{progressPercentage}%</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-lg font-semibold">
                        {completedHabits} of {totalHabits}
                      </p>
                      <p className="text-sm text-muted-foreground">Habits completed today</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Habits Section */}
          <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4 md:gap-0">
            <h2 className="text-xl sm:text-2xl font-bold">Habits</h2>
            <Link href={`/habits/new?goalId=${params.id}`}>
              <Button className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600">
                <Plus className="w-4 h-4 mr-2" />
                Add New Habit
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 gap-y-8">
            {habits.map((habit) => (
              <Card
                key={habit.id}
                className={`transition-all duration-200 ${habit.completed_today ? "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800" : ""}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      checked={habit.completed_today}
                      onCheckedChange={() => toggleHabit(habit.id)}
                      className="mt-1"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h3
                          className={`font-medium ${habit.completed_today ? "line-through text-muted-foreground" : ""}`}
                        >
                          {habit.name}
                        </h3>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-6 w-6">
                              <MoreHorizontal className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/habits/${habit.id}/edit`}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Habit
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/habits/${habit.id}`}>
                                <TrendingUp className="h-4 w-4 mr-2" />
                                View Details
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete Habit
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>{habit.time}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Flame className="h-3 w-3 text-orange-500" />
                            <span>{habit.streak} days</span>
                          </div>
                        </div>
                        <Badge variant={habit.type === "build" ? "default" : "destructive"} className="text-xs">
                          {habit.type === "build" ? "Build" : "Break"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {habits.length === 0 && (
            <Card className="p-8 text-center">
              <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No habits yet</h3>
              <p className="text-muted-foreground mb-4">Start building your goal by adding your first habit.</p>
              <Link href={`/habits/new?goalId=${params.id}`}>
                <Button className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Habit
                </Button>
              </Link>
            </Card>
          )}
        </div>
      </div>
    </AuthGuard>
  )
}
