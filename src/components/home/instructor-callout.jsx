import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, DollarSign, BookOpen, TrendingUp } from "lucide-react"

const benefits = [
  {
    icon: DollarSign,
    title: "Earn Revenue",
    description: "Get up to 70% revenue share from your course sales",
  },
  {
    icon: Users,
    title: "Reach Students",
    description: "Access our community of 50,000+ active learners",
  },
  {
    icon: BookOpen,
    title: "Easy Tools",
    description: "Use our intuitive course creation and management tools",
  },
  {
    icon: TrendingUp,
    title: "Grow Your Brand",
    description: "Build your reputation as an expert in your field",
  },
]

export default function InstructorCallout() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-3xl sm:text-4xl font-bold text-balance">
                Become an <span className="text-accent">Instructor</span>
              </h2>
              <p className="text-xl text-muted-foreground text-pretty">
                Share your expertise with thousands of learners worldwide and build a sustainable income stream.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              {benefits.map((benefit, index) => {
                const Icon = benefit.icon
                return (
                  <div key={index} className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center">
                      <Icon className="h-6 w-6 text-accent" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">{benefit.title}</h3>
                      <p className="text-sm text-muted-foreground">{benefit.description}</p>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg">Start Teaching Today</Button>
              <Button variant="outline" size="lg">
                Learn More
              </Button>
            </div>
          </div>

          <div className="relative">
             <img
              src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1488&q=80"
              alt="Instructor teaching online"
              className="rounded-2xl shadow-2xl"
            />
          <Card className="absolute -bottom-6 -left-6 bg-background/95 backdrop-blur">
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-accent mb-1">$2,500</div>
                  <div className="text-sm text-muted-foreground">Average monthly earnings</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}
