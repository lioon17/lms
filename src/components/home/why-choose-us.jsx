import { Card, CardContent } from "@/components/ui/card"
import { GraduationCap, Smartphone, RefreshCw, Award, DollarSign } from "lucide-react"

const benefits = [
  {
    icon: GraduationCap,
    title: "Expert Instructors",
    description: "Learn from industry professionals with years of real-world experience and proven track records.",
  },
  {
    icon: RefreshCw,
    title: "Track Progress & Redo",
    description: "Monitor your learning journey and retake courses anytime to master the concepts completely.",
  },
  {
    icon: Award,
    title: "Shareable Certificates",
    description: "Earn industry-recognized certificates that you can share on LinkedIn and add to your resume.",
  },
  {
    icon: DollarSign,
    title: "Affordable Pricing",
    description: "Access high-quality education at competitive prices with free re-enrollment options.",
  },
  {
    icon: Smartphone,
    title: "Learn Anywhere",
    description: "Access your courses on any device - mobile, tablet, or desktop - with seamless synchronization.",
  },
]

export default function WhyChooseUs() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-balance">
            Why Choose <span className="text-accent">Our Platform</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto text-pretty">
            We're committed to providing the best learning experience with features designed for your success
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon
            return (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-accent/10 rounded-full mb-6">
                    <Icon className="h-8 w-8 text-accent" />
                  </div>
                  <h3 className="text-xl font-semibold mb-4">{benefit.title}</h3>
                  <p className="text-muted-foreground text-pretty">{benefit.description}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
