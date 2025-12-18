"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, CreditCard, Shield, Lock, Star, Clock, Users, Smartphone } from "lucide-react"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"
import { useSessionGuard } from "@/hooks/useSessionGuard"
import { createEnrollment } from "@/lib/api/enrollments"
import { createPayment } from "@/lib/api/payments"
import { getCourse } from "@/lib/api/courses" // GET /api/courses/[id]

export default function CheckoutPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const courseId = Number(searchParams.get("courseId"))
  const { authorized, userId, email } = useSessionGuard(null, true)

  const [submitting, setSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [course, setCourse] = useState(null)

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    billingAddress: "",
    city: "",
    zipCode: "",
    paymentMethod: "card",
    mpesaPhone: "",
  })

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        if (!courseId) throw new Error("Missing courseId.")
        // Your route returns a single row with fields like: title, summary, cover_image_url, price, currency, ...
        const raw = await getCourse(courseId)
        const c = {
          id: raw.id,
          title: raw.title || "Untitled Course",
          summary: raw.summary || "",
          image: raw.cover_image_url || "/placeholder.svg",
          price: raw.price != null ? Number(raw.price) : 0,
          currency: (raw.currency || "USD").toUpperCase(),
          category_name: raw.category_name || null,
          estimated_duration_minutes: raw.estimated_duration_minutes,
          creator_name: raw.creator_name || null,
        }
        if (alive) {
          setCourse(c)
          setError(null)
        }
      } catch (e) {
        if (alive) setError(e?.message || "Failed to load course")
      } finally {
        if (alive) setLoading(false)
      }
    })()
    return () => { alive = false }
  }, [courseId])

  const priceNumber = useMemo(() => (course?.price ? Number(course.price) : 0), [course])
  const currency = course?.currency || "USD"
  const currencySymbol = currency === "KES" ? "KSh " : currency === "USD" ? "$" : ""
  const tax = useMemo(() => priceNumber * 0.08, [priceNumber])
  const total = useMemo(() => priceNumber + tax, [priceNumber, tax])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handlePaymentMethodChange = (method) => {
    setFormData((prev) => ({ ...prev, paymentMethod: method }))
  }

const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    setSubmitting(true);

    const uid = Number(userId); // from useSessionGuard
    if (!uid || !courseId) throw new Error("Missing user or course.");
    if (!course) throw new Error("Course not loaded.");

    // 1) Create PAYMENT first (no gateway; force 'paid')
    const amount_cents = Math.round((Number(course.price) || 0) * 100);
    const provider = formData.paymentMethod === "mpesa" ? "mpesa" : "paypal";

    const payment = await createPayment({
      user_id: uid,
      course_id: courseId,
      // enrollment_id left null for now; we’ll attach it after creating the enrollment
      amount_cents,
      currency: course.currency || "USD",
      provider,
      status: "paid",
      metadata: { source: "checkout", method: formData.paymentMethod },
    });

    // 2) After payment success, create ENROLLMENT
    const enrollment = await createEnrollment({
      user_id: uid,
      course_id: courseId,
      status: "active",
    }); // POST /api/enrollments returns { id, ... } :contentReference[oaicite:1]{index=1}

    // 3) OPTIONAL: attach the enrollment_id back to the payment (if you have PATCH /api/payments)
    // await updatePayment({ id: payment.id, enrollment_id: enrollment.id });

    alert("Payment recorded and enrollment created successfully!");
    router.push("/student-dashboard");
  } catch (err) {
    console.error(err);
    alert(err.message || "Something went wrong while completing enrollment.");
  } finally {
    setSubmitting(false);
  }
};


  if (authorized === null) return <p className="text-sm text-muted-foreground">Loading…</p>
  if (!authorized) return null

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Loading course…
      </div>
    )
  }
  if (error || !course) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3">
        <p className="text-destructive">{error || "Course not found"}</p>
        <Link className="underline" href="/courses">Back to Courses</Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/courses" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" />
              Back to Courses
            </Link>
            <div className="h-4 w-px bg-border" />
            <h1 className="text-xl font-semibold">Course Enrollment</h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Course Summary</CardTitle>
                <CardDescription>Review your selected course</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4">
                  <img
                    src={course.image}
                    alt={course.title}
                    className="w-24 h-24 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-balance">{course.title}</h3>
                    {course.creator_name && <p className="text-muted-foreground">by {course.creator_name}</p>}
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span>4.8</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>
                          {course.estimated_duration_minutes
                            ? `${Math.round(course.estimated_duration_minutes / 60)} hrs`
                            : "Self-paced"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>—</span>
                      </div>
                    </div>
                  </div>
                </div>

                {course.summary && <p className="text-muted-foreground">{course.summary}</p>}
                {course.category_name && (
                  <Badge variant="secondary" className="w-fit">{course.category_name}</Badge>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pricing Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Course Price</span>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">
                      {currencySymbol}{priceNumber.toFixed(2)} {currency}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span>Tax (8%)</span>
                  <span>{currencySymbol}{tax.toFixed(2)} {currency}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center text-lg font-semibold">
                  <span>Total</span>
                  <span className="text-primary">
                    {currencySymbol}{total.toFixed(2)} {currency}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-muted/50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Shield className="h-5 w-5 text-primary" />
                  <span>Your payment information is secure and encrypted</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground mt-2">
                  <Lock className="h-5 w-5 text-primary" />
                  <span>30-day money-back guarantee</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Information
                </CardTitle>
                <CardDescription>Complete your enrollment by providing payment details</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="font-medium">Personal Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input id="firstName" name="firstName" value={formData.firstName} onChange={handleInputChange} required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input id="lastName" name="lastName" value={formData.lastName} onChange={handleInputChange} required />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} required />
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="font-medium">Payment Method</h3>
                    <div className="grid grid-cols-3 gap-3">
                      <button
                        type="button"
                        onClick={() => handlePaymentMethodChange("card")}
                        className={`p-4 border rounded-lg flex flex-col items-center gap-2 transition-colors ${
                          formData.paymentMethod === "card"
                            ? "border-primary bg-primary/5 text-primary"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <CreditCard className="h-6 w-6" />
                        <span className="text-sm font-medium">Card</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handlePaymentMethodChange("paypal")}
                        className={`p-4 border rounded-lg flex flex-col items-center gap-2 transition-colors ${
                          formData.paymentMethod === "paypal"
                            ? "border-primary bg-primary/5 text-primary"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <div className="h-6 w-6 bg-blue-600 rounded flex items-center justify-center">
                          <span className="text-white text-xs font-bold">P</span>
                        </div>
                        <span className="text-sm font-medium">PayPal</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handlePaymentMethodChange("mpesa")}
                        className={`p-4 border rounded-lg flex flex-col items-center gap-2 transition-colors ${
                          formData.paymentMethod === "mpesa"
                            ? "border-primary bg-primary/5 text-primary"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <Smartphone className="h-6 w-6 text-green-600" />
                        <span className="text-sm font-medium">M-Pesa</span>
                      </button>
                    </div>
                  </div>

                  <Separator />

                  {formData.paymentMethod === "card" && (
                    <div className="space-y-4">
                      <h3 className="font-medium">Card Details</h3>
                      <div className="space-y-2">
                        <Label htmlFor="cardNumber">Card Number</Label>
                        <Input id="cardNumber" name="cardNumber" placeholder="1234 5678 9012 3456" value={formData.cardNumber} onChange={handleInputChange} required />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="expiryDate">Expiry Date</Label>
                          <Input id="expiryDate" name="expiryDate" placeholder="MM/YY" value={formData.expiryDate} onChange={handleInputChange} required />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="cvv">CVV</Label>
                          <Input id="cvv" name="cvv" placeholder="123" value={formData.cvv} onChange={handleInputChange} required />
                        </div>
                      </div>
                    </div>
                  )}

                  {formData.paymentMethod === "paypal" && (
                    <div className="space-y-4">
                      <h3 className="font-medium">PayPal Payment</h3>
                      <div className="p-4 border rounded-lg bg-muted/50">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="h-8 w-8 bg-blue-600 rounded flex items-center justify-center">
                            <span className="text-white text-sm font-bold">P</span>
                          </div>
                          <span className="font-medium">PayPal Checkout</span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">
                          You will be redirected to PayPal to complete your payment securely.
                        </p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Shield className="h-4 w-4" />
                          <span>Protected by PayPal Buyer Protection</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {formData.paymentMethod === "mpesa" && (
                    <div className="space-y-4">
                      <h3 className="font-medium">M-Pesa Payment</h3>
                      <div className="space-y-2">
                        <Label htmlFor="mpesaPhone">M-Pesa Phone Number</Label>
                        <Input id="mpesaPhone" name="mpesaPhone" placeholder="+254 7XX XXX XXX" value={formData.mpesaPhone} onChange={handleInputChange} required />
                      </div>
                      <div className="p-4 border rounded-lg bg-muted/50">
                        <div className="flex items-center gap-3 mb-3">
                          <Smartphone className="h-6 w-6 text-green-600" />
                          <span className="font-medium">M-Pesa STK Push</span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">
                          You will receive an STK push notification on your phone to complete the payment.
                        </p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Shield className="h-4 w-4" />
                          <span>Secured by Safaricom M-Pesa</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {formData.paymentMethod === "card" && (
                    <>
                      <Separator />
                      <div className="space-y-4">
                        <h3 className="font-medium">Billing Address</h3>
                        <div className="space-y-2">
                          <Label htmlFor="billingAddress">Address</Label>
                          <Input id="billingAddress" name="billingAddress" value={formData.billingAddress} onChange={handleInputChange} required />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="city">City</Label>
                            <Input id="city" name="city" value={formData.city} onChange={handleInputChange} required />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="zipCode">ZIP Code</Label>
                            <Input id="zipCode" name="zipCode" value={formData.zipCode} onChange={handleInputChange} required />
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  <Button type="submit" className="w-full" size="lg" disabled={submitting}>
                    {submitting
                      ? "Processing…"
                      : `Complete Enrollment - ${currencySymbol}${total.toFixed(2)} ${currency}`}
                  </Button>

                  <p className="text-xs text-muted-foreground text-center">
                    By completing this purchase, you agree to our Terms of Service and Privacy Policy.
                  </p>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
