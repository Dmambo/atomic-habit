import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Target, TrendingUp, Calendar, ArrowRight, CheckCircle, BarChart3, Zap } from "lucide-react"
import Link from "next/link"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-0">
          <div className="flex items-center space-x-2">
            <img src="/logo.png" alt="Atomic Habit Logo" className="w-8 h-8" />
            <span className="text-2xl sm:text-3xl md:text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              Atomic Habit
            </span>
          </div>
          <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
            <Link href="/login" className="w-full sm:w-auto">
              <Button variant="ghost" className="w-full sm:w-auto">Log In</Button>
            </Link>
            <Link href="/signup" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600">
                Sign Up
              </Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-10 sm:py-16 text-center">
        <Badge variant="secondary" className="mb-4">
          Inspired by Atomic Habits
        </Badge>
        <h1 className="text-3xl sm:text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-green-600 to-blue-600 bg-clip-text text-transparent">
          Set goals. Build habits. Achieve more.
        </h1>
        <p className="text-base sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Transform your life one small habit at a time. Track your progress, stay motivated, and build the life you
          want with our intuitive habit tracking app.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10 sm:mb-16 w-full max-w-md mx-auto">
          <Link href="/signup" className="w-full sm:w-auto">
            <Button
              size="lg"
              className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-lg px-8"
            >
              Start Building Habits
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
          <Link href="/demo" className="w-full sm:w-auto">
            <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg px-8 bg-transparent">
              View Demo
            </Button>
          </Link>
        </div>

        {/* You can add a real screenshot or illustration here, or leave this section empty. */}
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-10 sm:py-16">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">Why Choose Atomic Habit?</h2>
          <p className="text-base sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            Built on proven principles from James Clear's Atomic Habits, our app makes habit formation simple and
            effective.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 gap-y-8">
          <Card className="p-6 text-center hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-green-500 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Target className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold mb-2">Goal-Oriented Structure</h3>
            <p className="text-sm sm:text-base text-muted-foreground">
              Organize habits under specific goals. Track progress at both habit and goal levels for complete
              visibility.
            </p>
          </Card>

          <Card className="p-6 text-center hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-500 rounded-lg flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold mb-2">Visual Progress Tracking</h3>
            <p className="text-sm sm:text-base text-muted-foreground">
              Beautiful charts, streaks, and heatmaps keep you motivated and show your improvement over time.
            </p>
          </Card>

          <Card className="p-6 text-center hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-green-500 rounded-lg flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold mb-2">Smart Analytics</h3>
            <p className="text-sm sm:text-base text-muted-foreground">
              Detailed insights into your habits help you understand patterns and optimize your routine.
            </p>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-10 sm:py-16">
        <Card className="p-6 sm:p-8 md:p-12 text-center bg-gradient-to-r from-blue-500 to-green-500 text-white">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">Ready to Transform Your Life?</h2>
          <p className="text-base sm:text-xl mb-8 opacity-90">
            Join thousands of users who are building better habits and achieving their goals.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center w-full max-w-md mx-auto">
            <Link href="/signup" className="w-full sm:w-auto">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto text-lg px-8">
                Get Started Free
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </Card>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 border-t">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 md:gap-0">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <img src="/logo.png" alt="Atomic Habit Logo" className="w-6 h-6" />
            <span className="font-semibold">Atomic Habit</span>
          </div>
          <p className="text-sm text-muted-foreground text-center md:text-left">© 2024 Atomic Habit. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
