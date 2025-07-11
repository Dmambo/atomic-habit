"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Target, Plus, Search, MoreHorizontal, Edit, Trash2, ArrowLeft, Flame, CheckCircle } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { AuthGuard } from "@/components/auth-guard"
import { useAuth } from "@/hooks/use-auth"
import { getGoals } from "@/lib/database"
import { deleteGoal } from "@/lib/database"
import type { GoalWithProgress } from "@/lib/supabase"

export default function GoalsPage() {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [goalsData, setGoalsData] = useState<GoalWithProgress[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const categories = [
    "All",
    "Health",
    "Education",
    "Wellness",
    "Work",
    "Finance",
    "Personal",
    "Relationships",
    "Hobbies",
  ]

  useEffect(() => {
    if (user) {
      loadGoals()
    }
  }, [user])

  const loadGoals = async () => {
    try {
      const goals = await getGoals(user!.id)
      setGoalsData(goals)
    } catch (error) {
      console.error("Error loading goals:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteGoal = async (goalId: string) => {
    if (!confirm("Are you sure you want to delete this goal? This action cannot be undone and will also delete all associated habits.")) return;
    setDeletingId(goalId)
    try {
      await deleteGoal(goalId)
      await loadGoals()
      alert("Goal deleted successfully!")
    } catch (error) {
      alert("Failed to delete goal. Please try again.")
    } finally {
      setDeletingId(null)
    }
  }

  const filteredGoals = goalsData.filter((goal) => {
    const matchesSearch =
      goal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      goal.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "All" || goal.category === selectedCategory
    return matchesSearch && matchesCategory
  })

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
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link href="/dashboard">
                  <Button variant="ghost" size="icon">
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                </Link>
                <div>
                  <h1 className="text-xl font-bold">Your Goals</h1>
                  <p className="text-sm text-muted-foreground">Manage and track your life goals</p>
                </div>
              </div>

              <Link href="/goals/new">
                <Button className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600">
                  <Plus className="w-4 h-4 mr-2" />
                  New Goal
                </Button>
              </Link>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search goals..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>

          {/* Goals Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 gap-y-8">
            {filteredGoals.map((goal) => (
              <Card key={goal.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${goal.color}`} />
                        <CardTitle className="text-lg">{goal.title}</CardTitle>
                      </div>
                      <CardDescription className="line-clamp-2">{goal.description}</CardDescription>
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
                        <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteGoal(goal.id)} disabled={deletingId === goal.id}>
                          <Trash2 className="h-4 w-4 mr-2" />
                          {deletingId === goal.id ? "Deleting..." : "Delete Goal"}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary">{goal.category}</Badge>
                    <span className="text-xs text-muted-foreground">
                      Due: {new Date(goal.target_date).toLocaleDateString()}
                    </span>
                  </div>

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
                    <div className="flex items-center space-x-1">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>
                        {goal.completed_today}/{goal.total_habits} today
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t">
                    <Link href={`/goals/${goal.id}`}>
                      <Button variant="outline" size="sm" className="w-full bg-transparent">
                        View Details
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredGoals.length === 0 && (
            <Card className="p-8 text-center">
              <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No goals found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || selectedCategory !== "All"
                  ? "Try adjusting your search or filter criteria."
                  : "Start your journey by creating your first goal."}
              </p>
              <Link href="/goals/new">
                <Button className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Goal
                </Button>
              </Link>
            </Card>
          )}
        </div>
      </div>
    </AuthGuard>
  )
}
