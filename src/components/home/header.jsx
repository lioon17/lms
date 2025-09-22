import Link from "next/link"
import { Button } from "@/components/ui/button"
import { LogIn, BookOpen } from "lucide-react"

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <BookOpen className="h-8 w-8 text-accent" />
            <span className="text-xl font-bold">LearnHub</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="#courses" className="text-sm font-medium hover:text-accent transition-colors">
              Courses
            </Link>
            <Link href="#about" className="text-sm font-medium hover:text-accent transition-colors">
              About
            </Link>
            <Link href="#pricing" className="text-sm font-medium hover:text-accent transition-colors">
              Pricing
            </Link>
            <Link href="#contact" className="text-sm font-medium hover:text-accent transition-colors">
              Contact
            </Link>
          </nav>

          {/* Login Button */}
          <div className="flex items-center space-x-4">
            <Link href="/login">
              <Button variant="outline" size="sm" className="flex items-center gap-2 bg-transparent">
                <LogIn className="h-4 w-4" />
                <span className="hidden sm:inline">Login</span>
              </Button>
            </Link>
            <Button size="sm" className="hidden sm:inline-flex">
              Get Started
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
