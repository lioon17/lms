import { Card, CardContent } from "@/components/ui/card"
import { Search, Play, CheckCircle, Award } from "lucide-react"

const steps = [
  {
    step: 1,
    icon: Search,
    title: "Browse & Enroll",
    description: "Explore our course catalog and enroll in courses that match your learning goals and interests.",
  },
  {
    step: 2,
    icon: Play,
    title: "Learn Through Videos",
    description: "Access high-quality video lessons, interactive content, and downloadable resources at your own pace.",
  },
  {
    step: 3,
    icon: CheckCircle,
    title: "Take Quizzes",
    description: "Test your knowledge with quizzes at the end of each lesson and module to reinforce learning.",
  },
  {
    step: 4,
    icon: Award,
    title: "Earn Certificate",
    description: "Successfully complete the course and receive a verified certificate to showcase your achievement.",
  },
]

export default function HowItWorks() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-balance">
            How It <span className="text-accent">Works</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto text-pretty">
            Start your learning journey in just four simple steps
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon
            return (
              <div key={index} className="relative">
                <Card className="text-center hover:shadow-lg transition-shadow duration-300">
                  <CardContent className="p-8">
                    <div className="relative mb-6">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-accent rounded-full mb-4">
                        <Icon className="h-8 w-8 text-accent-foreground" />
                      </div>
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-bold">
                        {step.step}
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold mb-4">{step.title}</h3>
                    <p className="text-muted-foreground text-pretty">{step.description}</p>
                  </CardContent>
                </Card>

                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-border transform -translate-y-1/2"></div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
