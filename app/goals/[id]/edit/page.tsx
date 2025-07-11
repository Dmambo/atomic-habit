"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Target, ArrowLeft, CalendarIcon, Save, Trash2 } from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { AuthGuard } from "@/components/auth-guard"
import { getGoal, deleteGoal } from "@/lib/database"

const goalColors = [
  { name: "Blue to Green", value: "from-blue-500 to-green-500" },
  { name: "Purple to Pink", value: "from-purple-500 to-pink-500" },
  { name: "Green to Teal", value: "from-green-500 to-teal-500" },
  { name: "Orange to Red", value: "from-orange-500 to-red-500" },
  { name: "Yellow to Orange", value: "from-yellow-500 to-orange-500" },
  { name: "Indigo to Purple", value: "from-indigo-500 to-purple-500" },
]

const categories = ["Health", "Education", "Wellness", "Work", "Finance", "Personal", "Relationships", "Hobbies"]

export default function EditGoalPage() {
  const params = useParams()
  const router = useRouter()
  const goalId = params.id as string
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    color: goalColors[0].value,
    targetDate: undefined as Date | undefined,
    motivationNote: "",
  })

  const [errors, setErrors] = useState({
    title: "",
    description: "",
    category: "",
    targetDate: "",
  })

  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchGoal() {
      setIsLoading(true)
      try {
        const goal = await getGoal(goalId)
        if (goal) {
          setFormData({
            title: goal.title,
            description: goal.description || "",
            category: goal.category,
            color: goal.color,
            targetDate: new Date(goal.target_date),
            motivationNote: goal.motivation_note || "",
          })
        }
      } catch (err) {
        alert("Failed to load goal data.")
      } finally {
        setIsLoading(false)
      }
    }
    fetchGoal()
  }, [goalId])

  const validateForm = () => {
    const newErrors = {
      title: "",
      description: "",
      category: "",
      targetDate: "",
    }

    if (!formData.title.trim()) {
      newErrors.title = "Goal title is required"
    }

    if (!formData.description.trim()) {
      newErrors.description = "Goal description is required"
    }

    if (!formData.category) {
      newErrors.category = "Please select a category"
    }

    if (!formData.targetDate) {
      newErrors.targetDate = "Please select a target date"
    }

    setErrors(newErrors)
    return !Object.values(newErrors).some((error) => error !== "")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      // Create updated goal object
      const updatedGoal = {
        id: goalId,
        ...formData,
        targetDate: formData.targetDate!.toISOString(),
        updatedAt: new Date().toISOString(),
      }

      // In a real app, you would update this in a database
      console.log("Updating goal:", updatedGoal)

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Show success message
      alert("Goal updated successfully!")

      // Redirect to goal detail page
      router.push(`/goals/${goalId}`)
    } catch (error) {
      console.error("Error updating goal:", error)
      alert("Failed to update goal. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (
      confirm(
        "Are you sure you want to delete this goal? This action cannot be undone and will also delete all associated habits.",
      )
    ) {
      try {
        setIsSubmitting(true)
        await deleteGoal(goalId)
        alert("Goal deleted successfully!")
        router.push("/goals")
      } catch (error) {
        console.error("Error deleting goal:", error)
        alert("Failed to delete goal. Please try again.")
      } finally {
        setIsSubmitting(false)
      }
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

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link href={`/goals/${goalId}`}>
                  <Button variant="ghost" size="icon">
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                </Link>
                <div>
                  <h1 className="text-xl font-bold">Edit Goal</h1>
                  <p className="text-sm text-muted-foreground">Update your goal details</p>
                </div>
              </div>

              <Button variant="destructive" onClick={handleDelete} disabled={isSubmitting}>
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Goal
              </Button>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5" />
                  <span>Goal Details</span>
                </CardTitle>
                <CardDescription>Update your goal to keep it relevant and motivating</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="title">Goal Title *</Label>
                    <Input
                      id="title"
                      placeholder="e.g., Get Fit and Healthy"
                      value={formData.title}
                      onChange={(e) => {
                        setFormData({ ...formData, title: e.target.value })
                        if (errors.title) setErrors({ ...errors, title: "" })
                      }}
                      className={errors.title ? "border-red-500" : ""}
                    />
                    {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe what you want to achieve and why it matters to you..."
                      value={formData.description}
                      onChange={(e) => {
                        setFormData({ ...formData, description: e.target.value })
                        if (errors.description) setErrors({ ...errors, description: "" })
                      }}
                      rows={3}
                      className={errors.description ? "border-red-500" : ""}
                    />
                    {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="category">Category *</Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) => {
                          setFormData({ ...formData, category: value })
                          if (errors.category) setErrors({ ...errors, category: "" })
                        }}
                      >
                        <SelectTrigger className={errors.category ? "border-red-500" : ""}>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.category && <p className="text-sm text-red-500">{errors.category}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="targetDate">Target Date *</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={`w-full justify-start text-left font-normal bg-transparent ${
                              errors.targetDate ? "border-red-500" : ""
                            }`}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {formData.targetDate ? format(formData.targetDate, "PPP") : "Pick a date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={formData.targetDate}
                            onSelect={(date) => {
                              setFormData({ ...formData, targetDate: date })
                              if (errors.targetDate) setErrors({ ...errors, targetDate: "" })
                            }}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      {errors.targetDate && <p className="text-sm text-red-500">{errors.targetDate}</p>}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Goal Color</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {goalColors.map((color) => (
                        <button
                          key={color.value}
                          type="button"
                          className={`p-3 rounded-lg border-2 transition-all ${
                            formData.color === color.value
                              ? "border-primary ring-2 ring-primary/20"
                              : "border-border hover:border-primary/50"
                          }`}
                          onClick={() => setFormData({ ...formData, color: color.value })}
                        >
                          <div className={`w-full h-6 rounded bg-gradient-to-r ${color.value}`} />
                          <p className="text-xs mt-1">{color.name}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="motivationNote">Motivation Note</Label>
                    <Textarea
                      id="motivationNote"
                      placeholder="Write something that will motivate you when things get tough..."
                      value={formData.motivationNote}
                      onChange={(e) => setFormData({ ...formData, motivationNote: e.target.value })}
                      rows={2}
                    />
                  </div>

                  <div className="flex gap-4 pt-4">
                    <Link href={`/goals/${goalId}`} className="flex-1">
                      <Button type="button" variant="outline" className="w-full bg-transparent" disabled={isSubmitting}>
                        Cancel
                      </Button>
                    </Link>
                    <Button
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Preview */}
            {formData.title && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Preview</CardTitle>
                  <CardDescription>This is how your updated goal will appear</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${formData.color}`} />
                      <h3 className="font-semibold">{formData.title}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{formData.description}</p>
                    <div className="flex items-center justify-between text-xs">
                      <span className="px-2 py-1 bg-secondary rounded">{formData.category}</span>
                      {formData.targetDate && <span>Due: {format(formData.targetDate, "MMM dd, yyyy")}</span>}
                    </div>
                    {formData.motivationNote && (
                      <div className="mt-3 p-2 bg-muted/50 rounded text-xs italic">"{formData.motivationNote}"</div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}
