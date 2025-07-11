"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Plus, ArrowLeft, Save, Clock, Target } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { AuthGuard } from "@/components/auth-guard"
import { useAuth } from "@/hooks/use-auth"
import { createHabit, getGoals } from "@/lib/database"

const habitTypes = [
  { value: "build", label: "Build", description: "A positive habit you want to develop" },
  { value: "break", label: "Break", description: "A negative habit you want to eliminate" },
]

const frequencies = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "custom", label: "Custom" },
]

const timeSlots = [
  "6:00 AM",
  "7:00 AM",
  "8:00 AM",
  "9:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "1:00 PM",
  "2:00 PM",
  "3:00 PM",
  "4:00 PM",
  "5:00 PM",
  "6:00 PM",
  "7:00 PM",
  "8:00 PM",
  "9:00 PM",
  "10:00 PM",
  "11:00 PM",
]

export default function NewHabitPage() {
  const { user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const goalId = searchParams.get("goalId")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [availableGoals, setAvailableGoals] = useState<Array<{ id: string; title: string; color: string }>>([])
  const [isLoadingGoals, setIsLoadingGoals] = useState(true)

  // Load available goals from database
  useEffect(() => {
    if (user) {
      loadAvailableGoals()
    }
  }, [user])

  const loadAvailableGoals = async () => {
    try {
      const goals = await getGoals(user!.id)
      setAvailableGoals(
        goals.map((goal) => ({
          id: goal.id,
          title: goal.title,
          color: goal.color,
        })),
      )
    } catch (error) {
      console.error("Error loading goals:", error)
    } finally {
      setIsLoadingGoals(false)
    }
  }

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    goalId: goalId || "",
    type: "build",
    frequency: "daily",
    time: "",
    cue: "",
    reward: "",
    reminders: true,
    notes: "",
  })

  const [errors, setErrors] = useState({
    name: "",
    goalId: "",
  })

  const validateForm = () => {
    const newErrors = {
      name: "",
      goalId: "",
    }

    if (!formData.name.trim()) {
      newErrors.name = "Habit name is required"
    }

    if (!formData.goalId) {
      newErrors.goalId = "Please select a goal"
    }

    setErrors(newErrors)
    return !Object.values(newErrors).some((error) => error !== "")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm() || !user) {
      return
    }

    setIsSubmitting(true)

    try {
      const newHabit = await createHabit(user.id, {
        name: formData.name,
        description: formData.description,
        goal_id: formData.goalId,
        habit_type: formData.type as "build" | "break",
        frequency: formData.frequency,
        preferred_time: formData.time || undefined,
        cue: formData.cue || undefined,
        reward: formData.reward || undefined,
        notes: formData.notes || undefined,
        reminders_enabled: formData.reminders
      })

      // Show success message
      alert("Habit created successfully!")

      // Redirect to goal detail page
      router.push(`/goals/${formData.goalId}`)
    } catch (error) {
      console.error("Error creating habit:", error)
      alert("Failed to create habit. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center space-x-4">
              <Link href={goalId ? `/goals/${goalId}` : "/dashboard"}>
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-bold">Create New Habit</h1>
                <p className="text-sm text-muted-foreground">Build a habit that sticks</p>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Plus className="h-5 w-5" />
                  <span>Habit Details</span>
                </CardTitle>
                <CardDescription>Create a specific, actionable habit that aligns with your goals</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Habit Name *</Label>
                    <Input
                      id="name"
                      placeholder="e.g., Morning workout, Read for 30 minutes"
                      value={formData.name}
                      onChange={(e) => {
                        setFormData({ ...formData, name: e.target.value })
                        if (errors.name) setErrors({ ...errors, name: "" })
                      }}
                      className={errors.name ? "border-red-500" : ""}
                    />
                    {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe what this habit involves..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="goal">Goal *</Label>
                    <Select
                      value={formData.goalId}
                      onValueChange={(value) => {
                        setFormData({ ...formData, goalId: value })
                        if (errors.goalId) setErrors({ ...errors, goalId: "" })
                      }}
                    >
                      <SelectTrigger className={errors.goalId ? "border-red-500" : ""}>
                        <SelectValue placeholder="Select a goal" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableGoals.map((goal) => (
                          <SelectItem key={goal.id} value={goal.id.toString()}>
                            <div className="flex items-center space-x-2">
                              <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${goal.color}`} />
                              <span>{goal.title}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.goalId && <p className="text-sm text-red-500">{errors.goalId}</p>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Habit Type</Label>
                      <div className="space-y-2">
                        {habitTypes.map((type) => (
                          <div
                            key={type.value}
                            className={`p-3 border rounded-lg cursor-pointer transition-all ${
                              formData.type === type.value
                                ? "border-primary bg-primary/5"
                                : "border-border hover:border-primary/50"
                            }`}
                            onClick={() => setFormData({ ...formData, type: type.value })}
                          >
                            <div className="flex items-center space-x-2">
                              <div
                                className={`w-3 h-3 rounded-full ${
                                  type.value === "build" ? "bg-green-500" : "bg-red-500"
                                }`}
                              />
                              <span className="font-medium">{type.label}</span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">{type.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="frequency">Frequency</Label>
                        <Select
                          value={formData.frequency}
                          onValueChange={(value) => setFormData({ ...formData, frequency: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {frequencies.map((freq) => (
                              <SelectItem key={freq.value} value={freq.value}>
                                {freq.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="time">Preferred Time</Label>
                        <Select
                          value={formData.time}
                          onValueChange={(value) => setFormData({ ...formData, time: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select time" />
                          </SelectTrigger>
                          <SelectContent>
                            {timeSlots.map((time) => (
                              <SelectItem key={time} value={time}>
                                {time}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Habit Loop Section */}
                  <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                    <h3 className="font-medium">Habit Loop (Optional)</h3>
                    <p className="text-sm text-muted-foreground">
                      Define your cue and reward to make the habit stick better
                    </p>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="cue">Cue (Trigger)</Label>
                        <Input
                          id="cue"
                          placeholder="e.g., Right after I wake up, After I finish dinner"
                          value={formData.cue}
                          onChange={(e) => setFormData({ ...formData, cue: e.target.value })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="reward">Reward</Label>
                        <Input
                          id="reward"
                          placeholder="e.g., Feel energized, Learn something new"
                          value={formData.reward}
                          onChange={(e) => setFormData({ ...formData, reward: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <Label htmlFor="reminders">Enable Reminders</Label>
                      <p className="text-sm text-muted-foreground">Get notified when it's time for this habit</p>
                    </div>
                    <Switch
                      id="reminders"
                      checked={formData.reminders}
                      onCheckedChange={(checked) => setFormData({ ...formData, reminders: checked })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Additional Notes</Label>
                    <Textarea
                      id="notes"
                      placeholder="Any additional details or instructions..."
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      rows={2}
                    />
                  </div>

                  <div className="flex gap-4 pt-4">
                    <Link href={goalId ? `/goals/${goalId}` : "/dashboard"} className="flex-1">
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
                          Creating...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Create Habit
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Preview */}
            {formData.name && formData.goalId && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Preview</CardTitle>
                  <CardDescription>This is how your habit will appear</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">{formData.name}</h3>
                      <Badge variant={formData.type === "build" ? "default" : "destructive"}>
                        {formData.type === "build" ? "Build" : "Break"}
                      </Badge>
                    </div>
                    {formData.description && (
                      <p className="text-sm text-muted-foreground mb-3">{formData.description}</p>
                    )}
                    <div className="flex items-center justify-between text-xs mb-3">
                      <div className="flex items-center space-x-4">
                        {formData.time && (
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>{formData.time}</span>
                          </div>
                        )}
                        <span className="px-2 py-1 bg-secondary rounded">{formData.frequency}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Target className="h-3 w-3" />
                        <span>{availableGoals.find((g) => g.id.toString() === formData.goalId)?.title}</span>
                      </div>
                    </div>
                    {(formData.cue || formData.reward) && (
                      <div className="space-y-2 text-xs">
                        {formData.cue && (
                          <div>
                            <span className="font-medium text-blue-600">Cue:</span> {formData.cue}
                          </div>
                        )}
                        {formData.reward && (
                          <div>
                            <span className="font-medium text-green-600">Reward:</span> {formData.reward}
                          </div>
                        )}
                      </div>
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
