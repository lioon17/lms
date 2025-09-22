import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Award, Share2, Download, QrCode } from "lucide-react"

export default function Certificates() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-3xl sm:text-4xl font-bold text-balance">
                Earn <span className="text-accent">Verified Certificates</span>
              </h2>
              <p className="text-xl text-muted-foreground text-pretty">
                Showcase your achievements with industry-recognized certificates that employers trust and value.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center">
                  <Award className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Industry Recognition</h3>
                  <p className="text-muted-foreground">
                    Our certificates are recognized by leading companies and institutions worldwide.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center">
                  <QrCode className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">QR Verification</h3>
                  <p className="text-muted-foreground">
                    Each certificate includes a unique QR code for instant verification of authenticity.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center">
                  <Share2 className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Easy Sharing</h3>
                  <p className="text-muted-foreground">
                    Share directly to LinkedIn, add to your resume, or include in job applications.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg">
                <Download className="mr-2 h-5 w-5" />
                View Sample Certificate
              </Button>
              <Button variant="outline" size="lg">
                Learn More
              </Button>
            </div>
          </div>

          <div className="relative">
            <Card className="transform rotate-2 hover:rotate-0 transition-transform duration-300">
              <CardContent className="p-8">
                <div className="text-center space-y-6">
                  <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto">
                    <Award className="h-8 w-8 text-accent-foreground" />
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold">Certificate of Completion</h3>
                    <p className="text-muted-foreground">This certifies that</p>
                    <p className="text-xl font-semibold">John Doe</p>
                    <p className="text-muted-foreground">has successfully completed</p>
                    <p className="text-lg font-semibold text-accent">Full Stack Web Development</p>
                  </div>

                  <div className="flex justify-between items-center pt-6 border-t">
                    <div className="text-sm text-muted-foreground">
                      <p>Completed: March 2024</p>
                      <p>Grade: 95%</p>
                    </div>
                    <div className="w-16 h-16 bg-muted rounded flex items-center justify-center">
                      <QrCode className="h-8 w-8 text-muted-foreground" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}
