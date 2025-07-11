import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Target, ArrowLeft, CheckCircle, Flame, Clock } from "lucide-react"
import Link from "next/link"

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Demo page intentionally left blank. */}

      {/* Call to Action */}
      <Card className="p-8 text-center bg-gradient-to-r from-blue-500 to-green-500 text-white">
        <h2 className="text-2xl font-bold mb-4">Ready to Start Your Journey?</h2>
        <p className="mb-6 opacity-90">
          Create your account to start tracking your habits and achieving your goals.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/signup">
            <Button size="lg" variant="secondary" className="text-lg px-8">
              Get Started Free
            </Button>
          </Link>
          <Link href="/login">
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 bg-transparent border-white text-white hover:bg-white hover:text-blue-600"
            >
              Sign In
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  )
}
