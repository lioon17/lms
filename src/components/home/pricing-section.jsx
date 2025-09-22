import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, Star } from "lucide-react"

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for getting started",
    features: ["Access to 10 free courses", "Basic certificates", "Community support", "Mobile app access"],
    cta: "Get Started Free",
    popular: false,
  },
  {
    name: "Standard",
    price: "$29",
    period: "per month",
    description: "Most popular for serious learners",
    features: [
      "Access to full course catalog",
      "Verified certificates",
      "Priority support",
      "Offline downloads",
      "Progress tracking",
      "Quiz retakes",
    ],
    cta: "Start Learning",
    popular: true,
  },
  {
    name: "Premium",
    price: "$79",
    period: "per month",
    description: "For professionals and teams",
    features: [
      "Everything in Standard",
      "1-on-1 mentorship sessions",
      "Career guidance",
      "Advanced certificates",
      "Team management tools",
      "Custom learning paths",
      "API access",
    ],
    cta: "Go Premium",
    popular: false,
  },
]

export default function PricingSection() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-balance">
            Choose Your <span className="text-accent">Learning Plan</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto text-pretty">
            Start free and upgrade as you grow. All plans include lifetime access to purchased courses.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <Card
              key={index}
              className={`relative hover:shadow-lg transition-all duration-300 ${
                plan.popular ? "ring-2 ring-accent scale-105" : ""
              }`}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-accent text-accent-foreground">
                  <Star className="h-4 w-4 mr-1" />
                  Most Popular
                </Badge>
              )}

              <CardHeader className="text-center pb-8">
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">/{plan.period}</span>
                </div>
                <p className="text-muted-foreground">{plan.description}</p>
              </CardHeader>

              <CardContent className="space-y-4">
                {plan.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-accent flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </CardContent>

              <CardFooter>
                <Button className="w-full" variant={plan.popular ? "default" : "outline"} size="lg">
                  {plan.cta}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-muted-foreground mb-4">All plans include a 30-day money-back guarantee</p>
          <Button variant="ghost">Compare all features →</Button>
        </div>
      </div>
    </section>
  )
}
