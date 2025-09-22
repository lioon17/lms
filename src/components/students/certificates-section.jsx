import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, ExternalLink, Award } from "lucide-react"

export function CertificatesSection() {
  const certificates = [
    {
      id: 1,
      title: "Data Science Fundamentals",
      issueDate: "2024-01-10",
      verificationCode: "DS-2024-001-ABC123",
      downloadUrl: "#",
    },
    {
      id: 2,
      title: "JavaScript Mastery",
      issueDate: "2023-12-15",
      verificationCode: "JS-2023-045-XYZ789",
      downloadUrl: "#",
    },
    {
      id: 3,
      title: "UI/UX Design Principles",
      issueDate: "2023-11-20",
      verificationCode: "UX-2023-028-DEF456",
      downloadUrl: "#",
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-balance">
          <Award className="w-5 h-5" />
          Certificates
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {certificates.map((cert) => (
            <div key={cert.id} className="border rounded-lg p-4 space-y-3">
              <div>
                <h4 className="font-medium text-balance">{cert.title}</h4>
                <p className="text-sm text-muted-foreground">Issued: {new Date(cert.issueDate).toLocaleDateString()}</p>
              </div>

              <div className="flex flex-col gap-2">
                <Button size="sm" className="w-full">
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </Button>
                <Button size="sm" variant="outline" className="w-full bg-transparent">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Verify Certificate
                </Button>
              </div>

              <p className="text-xs text-muted-foreground font-mono">ID: {cert.verificationCode}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
