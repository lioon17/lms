"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, Users, Award, BarChart3, ArrowLeft, Mail, Lock, Shield } from "lucide-react"
import { useRouter } from "next/navigation"


export default function HomePage() {
  const { user, login, register } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [forgotPasswordStep, setForgotPasswordStep] = useState("email")
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const [acceptedPrivacyPolicy, setAcceptedPrivacyPolicy] = useState(false)

  // Top of file
const ROLE_ROUTES = {
  admin: "/dashboard",
  student: "/student-dashboard",        // <- adjust if your student route differs
  instructor: "/instructor/dashboard",  // optional
};

const routeForRole = (r) => ROLE_ROUTES[(r || "").toLowerCase()] || "/dashboard";

  // Redirect if already logged in
  if (user) {
    router.push("/dashboard")
    return null
  }

const handleLogin = async (formData) => {
  setIsLoading(true);
  const email = formData.get("email")?.trim().toLowerCase();
  const password = formData.get("password") || "";

  const toastId = toast.loading("Signing you in...");
  try {
    const res = await fetch("/api/auth/signin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      toast.error(data?.error || "Invalid credentials", { id: toastId });
      return;
    }

    // Prefer ?returnTo=... from the URL (set by your guard)
    const sp = new URLSearchParams(window.location.search);
    const returnTo = sp.get("returnTo");

    // Get role from signin response or fall back to /api/auth/session
    let role = data?.role || data?.user?.role;
    if (!role) {
      const s = await fetch("/api/auth/session", { cache: "no-store" }).then((r) => r.json());
      role = s?.role;
    }

    toast.success("Welcome back!", { id: toastId });
    router.replace(returnTo || routeForRole(role));
  } catch (e) {
    toast.error(e.message || "Something went wrong", { id: toastId });
  } finally {
    setIsLoading(false);
  }
};


  const handleRegister = async (formData) => {
  setIsLoading(true)
  const name = formData.get("name")?.trim()
  const email = formData.get("email")?.trim().toLowerCase()
  const password = formData.get("password") || ""
  const role = formData.get("role") || "student"
  
  
  if (password.length < 6) {
    toast.error("Password must be at least 6 characters long")
    setIsLoading(false)
    return
  }

  try {
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, role }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data?.error || "Signup failed")

    // success → optionally auto sign-in or route to /signin
      toast.success("Account created. Please sign in.")
  } catch (e) {
    alert(e.message)
  } finally {
    setIsLoading(false)
  }
}

  const handleForgotPasswordEmail = async (event) => {
  event.preventDefault()
  setIsLoading(true)
  const formData = new FormData(event.currentTarget)
  const emailValue = formData.get("email")?.trim().toLowerCase()
  setEmail(emailValue)

  try {
    await fetch("/api/auth/request-reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: emailValue }),
    })
    // always advance (route hides enumeration)
   toast.success("If the email exists, a code was sent.")
    setForgotPasswordStep("otp")
  } catch {
    // same UX—avoid enumeration
    toast.success("If the email exists, a code was sent.")
    setForgotPasswordStep("otp")
  } finally {
    setIsLoading(false)
  }
}

  const handleOtpSubmit = async (event) => {
    event.preventDefault()
    setIsLoading(true)

    // Simulate OTP verification
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setForgotPasswordStep("newPassword")
    setIsLoading(false)
  }

  // replace handleNewPasswordSubmit
const handleNewPasswordSubmit = async (event) => {
  event.preventDefault()
  setIsLoading(true)
  const form = new FormData(event.currentTarget)
  const newPassword = form.get("password")
  const confirmPassword = form.get("confirmPassword")

   if (newPassword.length < 6) {
    toast.error("Password must be at least 6 characters long")
    setIsLoading(false)
    return
  }

  if (newPassword !== confirmPassword) {
     toast.error("Passwords do not match")
    setIsLoading(false)
    return
  }

  // join 6 input boxes into one code (e.g., "123456")
  const code = otp.join("")

  try {
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp: code, new_password: newPassword }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data?.error || "Reset failed")

    setForgotPasswordStep("success")
  } catch (e) {
    alert(e.message)
  } finally {
    setIsLoading(false)
  }
}
// replace your handleOtpChange
const handleOtpChange = (index, value) => {
  if (value.length <= 1) {
    const newOtp = [...otp]   // ← fix here
    newOtp[index] = value.replace(/\D/g, "") // keep numeric
    setOtp(newOtp)

    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus()
    }
  }
}

  const handleBackToLogin = () => {
    setShowForgotPassword(false)
    setForgotPasswordStep("email")
    setOtp(["", "", "", "", "", ""])
  }

  if (showForgotPassword) {
    return (
      <div className="min-h-screen bg-background">
        <div className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-secondary/5">
          <div className="container mx-auto px-4 py-16">
            <div className="flex justify-center items-center min-h-[80vh]">
              <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    {forgotPasswordStep === "email" && <Mail className="h-8 w-8 text-primary" />}
                    {forgotPasswordStep === "otp" && <Shield className="h-8 w-8 text-primary" />}
                    {forgotPasswordStep === "newPassword" && <Lock className="h-8 w-8 text-primary" />}
                    {forgotPasswordStep === "success" && (
                      <div className="h-8 w-8 bg-green-500 rounded-full flex items-center justify-center text-white">
                        ✓
                      </div>
                    )}
                  </div>
                  <CardTitle>
                    {forgotPasswordStep === "email" && "Reset Password"}
                    {forgotPasswordStep === "otp" && "Verify Code"}
                    {forgotPasswordStep === "newPassword" && "New Password"}
                    {forgotPasswordStep === "success" && "Password Reset"}
                  </CardTitle>
                  <CardDescription>
                    {forgotPasswordStep === "email" && "Enter your email to receive a reset code"}
                    {forgotPasswordStep === "otp" && `Enter the 6-digit code sent to ${email}`}
                    {forgotPasswordStep === "newPassword" && "Create your new password"}
                    {forgotPasswordStep === "success" && "Your password has been successfully reset"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {forgotPasswordStep === "email" && (
                    <form onSubmit={handleForgotPasswordEmail} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="reset-email">Email Address</Label>
                        <Input id="reset-email" name="email" type="email" placeholder="Enter your email" required />
                      </div>
                      <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? "Sending Code..." : "Send Reset Code"}
                      </Button>
                    </form>
                  )}

                  {forgotPasswordStep === "otp" && (
                    <form onSubmit={handleOtpSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label>Verification Code</Label>
                        <div className="flex gap-2 justify-center">
                          {otp.map((digit, index) => (
                            <Input
                              key={index}
                              id={`otp-${index}`}
                              type="text"
                              inputMode="numeric"
                              maxLength={1}
                              value={digit}
                              onChange={(e) => handleOtpChange(index, e.target.value)}
                              className="w-12 h-12 text-center text-lg font-semibold"
                              required
                            />
                          ))}
                        </div>
                      </div>
                      <Button type="submit" className="w-full" disabled={isLoading || otp.some((d) => !d)}>
                        {isLoading ? "Verifying..." : "Verify Code"}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        className="w-full text-sm"
                        onClick={() => setForgotPasswordStep("email")}
                      >
                        Resend Code
                      </Button>
                    </form>
                  )}

                  {forgotPasswordStep === "newPassword" && (
                    <form onSubmit={handleNewPasswordSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="new-password">New Password</Label>
                        <Input
                          id="new-password"
                          name="password"
                          type="password"
                          placeholder="Enter new password"
                          required
                           minLength={6}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirm-password">Confirm Password</Label>
                        <Input
                          id="confirm-password"
                          name="confirmPassword"
                          type="password"
                          placeholder="Confirm new password"
                          required
                           minLength={6}
                        />
                      </div>
                      <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? "Updating Password..." : "Update Password"}
                      </Button>
                    </form>
                  )}

                  {forgotPasswordStep === "success" && (
                    <div className="space-y-4 text-center">
                      <p className="text-sm text-muted-foreground">You can now sign in with your new password</p>
                      <Button onClick={handleBackToLogin} className="w-full">
                        Back to Sign In
                      </Button>
                    </div>
                  )}

                  {forgotPasswordStep !== "success" && (
                    <Button variant="ghost" onClick={handleBackToLogin} className="w-full flex items-center gap-2">
                      <ArrowLeft className="h-4 w-4" />
                      Back to Sign In
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <div className="container mx-auto px-4 py-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-4xl lg:text-6xl font-bold text-balance leading-tight">
                  Transform Your Learning Journey
                </h1>
                <p className="text-xl text-muted-foreground text-pretty">
                  Join thousands of learners in our comprehensive Learning Management System. Create, manage, and track
                  educational content with powerful tools designed for success.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <BookOpen className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <div className="font-semibold">500+ Courses</div>
                    <div className="text-sm text-muted-foreground">Expert-led content</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 bg-secondary/10 rounded-lg">
                    <Users className="h-6 w-6 text-secondary" />
                  </div>
                  <div>
                    <div className="font-semibold">10K+ Students</div>
                    <div className="text-sm text-muted-foreground">Active learners</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 bg-accent/10 rounded-lg">
                    <Award className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <div className="font-semibold">Certificates</div>
                    <div className="text-sm text-muted-foreground">Industry recognized</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 bg-chart-1/10 rounded-lg">
                    <BarChart3 className="h-6 w-6 text-chart-1" />
                  </div>
                  <div>
                    <div className="font-semibold">Progress Tracking</div>
                    <div className="text-sm text-muted-foreground">Detailed analytics</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Login/Register Form */}
            <div className="flex justify-center">
              <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                  <CardTitle>Welcome to EduPlatform</CardTitle>
                  <CardDescription>Sign in to your account or create a new one</CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="login" className="space-y-4">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="login">Sign In</TabsTrigger>
                      <TabsTrigger value="register">Sign Up</TabsTrigger>
                    </TabsList>

                    <TabsContent value="login">
                      <form action={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input id="email" name="email" type="email" placeholder="Enter your email" required />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="password">Password</Label>
                          <Input
                            id="password"
                            name="password"
                            type="password"
                            placeholder="Enter your password"
                            required
                          />
                        </div>
                        <Button type="submit" className="w-full" disabled={isLoading}>
                          {isLoading ? "Signing in..." : "Sign In"}
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          className="w-full text-sm"
                          onClick={() => setShowForgotPassword(true)}
                        >
                          Forgot your password?
                        </Button>
                        <div className="flex items-center justify-center gap-2 pt-2 border-t border-border/50">
                          <div className="flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></div>
                            <span className="text-xs font-medium text-muted-foreground/80">Powered by</span>
                            <span className="text-xs font-semibold text-foreground">Binary Core Systems</span>
                          </div>
                        </div>
                      </form>
                    </TabsContent>

                    <TabsContent value="register">
                      <form action={handleRegister} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Full Name</Label>
                          <Input id="name" name="name" type="text" placeholder="Enter your full name" required />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input id="email" name="email" type="email" placeholder="Enter your email" required />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="password">Password</Label>
                          <Input
                            id="password"
                            name="password"
                            type="password"
                            placeholder="Create a password"
                            required
                             minLength={6}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="role">Role</Label>
                          <select
                            id="role"
                            name="role"
                            className="w-full p-2 border border-input bg-background rounded-md"
                            required
                          >
                            <option value="student">Student</option>
                            <option value="instructor">Instructor</option>
                          </select>
                        </div>
                        <div className="flex items-start space-x-2">
                          <Checkbox
                            id="privacy-policy"
                            checked={acceptedPrivacyPolicy}
                            onCheckedChange={setAcceptedPrivacyPolicy}
                          />
                          <div className="grid gap-1.5 leading-none">
                            <Label
                              htmlFor="privacy-policy"
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              I agree to the{" "}
                              <a href="/privacy-policy" className="text-primary underline hover:no-underline">
                                Privacy Policy
                              </a>{" "}
                              and{" "}
                              <a href="/terms" className="text-primary underline hover:no-underline">
                                Terms of Service
                              </a>
                            </Label>
                          </div>
                        </div>
                        <Button type="submit" className="w-full" disabled={isLoading || !acceptedPrivacyPolicy}>
                          {isLoading ? "Creating account..." : "Create Account"}
                        </Button>
                      </form>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
