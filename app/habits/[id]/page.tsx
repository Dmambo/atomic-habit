"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, TrendingUp, Flame, Clock, MoreHorizontal, Edit, Trash2, ArrowLeft, CheckCircle } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { useParams } from "next/navigation"
import { AuthGuard } from "@/components/auth-guard"
import { useAuth } from "@/hooks/use-auth"
import { getHabit, getHabitCompletions } from "@/lib/database"
import type { HabitWithDetails } from "@/lib/supabase"

export default function HabitDetailPage() {
  const params = useParams()
  const { user } = useAuth()
  const [habitData, setHabitData] = useState<HabitWithDetails | null>(null)
  const [completions, setCompletions] = useState<Array<{ completed_date: string }>>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (user && params.id) {
      loadHabitData()
    }
  }, [user, params.id])

  const loadHabitData = async () => {
    try {
      const [habit, habitCompletions] = await Promise.all([
        getHabit(params.id as string),
        getHabitCompletions(params.id as string, 90),
      ])

      setHabitData(habit)
      setCompletions(habitCompletions)
    } catch (error) {
      console.error("Error loading habit data:", error)
    } finally {
      setIsLoading(false)
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

  if (!habitData) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Habit not found</h1>
            <Link href="/dashboard">
              <Button>Back to Dashboard</Button>
            </Link>
          </div>
        </div>
      </AuthGuard>
    )
  }

  // Generate calendar grid for heatmap using real completion data
  const generateCalendarGrid = () => {
    const today = new Date()
    const startDate = new Date(today.getFullYear(), today.getMonth() - 2, 1)
    const endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0)

    const days = []
    const current = new Date(startDate)
    const completionDates = new Set(completions.map((c) => c.completed_date))

    while (current <= endDate) {
      const dateStr = current.toISOString().split("T")[0]
      days.push({
        date: new Date(current),
        completed: completionDates.has(dateStr),
      })
      current.setDate(current.getDate() + 1)
    }

    return days
  }

  const calendarDays = generateCalendarGrid()
  const completedDays = completions.length

  return (
    <AuthGuard>
      {/* Rest of the component remains the same */}
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link href={`/goals/${habitData.goal_id}`}>
                  <Button variant="ghost" size="icon">
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                </Link>
                <div>
                  <h1 className="text-xl font-bold">{habitData.name}</h1>
                  <p className="text-sm text-muted-foreground">
                    Part of{" "}
                    <Link href={`/goals/${habitData.goal_id}`} className="text-blue-600 hover:underline">
                      {habitData.goal_title}
                    </Link>
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Link href={`/habits/${params.id}/edit`}>
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Habit
                  </Button>
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem className="text-red-600">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Habit
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Flame className="h-5 w-5 text-orange-500" />
                  <div>
                    <p className="text-2xl font-bold">{habitData.current_streak}</p>
                    <p className="text-xs text-muted-foreground">Current Streak</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  <div>
                    {/* <p className="text-2xl font-bold">{habitData.longestStreak}</p> */}
                    <p className="text-xs text-muted-foreground">Longest Streak</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="text-2xl font-bold">{habitData.completion_rate}%</p>
                    <p className="text-xs text-muted-foreground">Completion Rate</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-purple-500" />
                  <div>
                    <p className="text-2xl font-bold">{completedDays}</p>
                    <p className="text-xs text-muted-foreground">Days Completed</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Calendar Heatmap */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5" />
                    <span>Activity Calendar</span>
                  </CardTitle>
                  <CardDescription>Your habit completion over the last 90 days</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Calendar Grid */}
                    <div className="grid grid-cols-7 gap-1 text-xs">
                      {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                        <div key={day} className="text-center text-muted-foreground font-medium p-1">
                          {day}
                        </div>
                      ))}
                      {calendarDays.map((day, index) => (
                        <div
                          key={index}
                          className={`aspect-square rounded-sm border ${
                            day.completed ? "bg-green-500 border-green-600" : "bg-muted border-border"
                          } ${day.date.toDateString() === new Date().toDateString() ? "ring-2 ring-blue-500" : ""}`}
                          title={`${day.date.toLocaleDateString()} - ${day.completed ? "Completed" : "Not completed"}`}
                        />
                      ))}
                    </div>

                    {/* Legend */}
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Less</span>
                      <div className="flex items-center space-x-1">
                        <div className="w-3 h-3 rounded-sm bg-muted border"></div>
                        <div className="w-3 h-3 rounded-sm bg-green-200 border"></div>
                        <div className="w-3 h-3 rounded-sm bg-green-400 border"></div>
                        <div className="w-3 h-3 rounded-sm bg-green-500 border"></div>
                        <div className="w-3 h-3 rounded-sm bg-green-600 border"></div>
                      </div>
                      <span>More</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Habit Details */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Habit Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Frequency</span>
                    <Badge variant="secondary">{habitData.frequency}</Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Time</span>
                    <div className="flex items-center space-x-1 text-sm">
                      <Clock className="h-3 w-3" />
                      <span>{habitData.preferred_time}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Type</span>
                    <Badge variant={habitData.habit_type === "build" ? "default" : "destructive"}>
                      {habitData.habit_type === "build" ? "Build" : "Break"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Habit Loop</CardTitle>
                  <CardDescription>The cue, routine, and reward cycle</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium mb-2 text-blue-600">Cue (Trigger)</h4>
                    <p className="text-sm text-muted-foreground">{habitData.cue}</p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium mb-2 text-green-600">Routine (Habit)</h4>
                    <p className="text-sm text-muted-foreground">{habitData.notes}</p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium mb-2 text-purple-600">Reward (Benefit)</h4>
                    <p className="text-sm text-muted-foreground">{habitData.reward}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}
