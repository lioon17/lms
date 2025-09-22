"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Award, Save, Eye, Download, Upload, Palette, Type, ImageIcon } from "lucide-react"

export function CourseCertificate({ course, onUpdate, onSave }) {
  const [certificateSettings, setCertificateSettings] = useState(
    course.certificateSettings || {
      enabled: true,
      title: `Certificate of Completion`,
      description: `This certifies that {student_name} has successfully completed the course "{course_title}" and demonstrated proficiency in the subject matter.`,
      template: "modern",
      backgroundColor: "#ffffff",
      textColor: "#1f2937",
      accentColor: "#3b82f6",
      issuerName: "EduPlatform",
      issuerTitle: "Course Provider",
      completionRequirements: {
        passAllQuizzes: true,
        minimumScore: 70,
        completeAllLessons: true,
      },
    },
  )

  const handleSettingsUpdate = (updates) => {
    const newSettings = { ...certificateSettings, ...updates }
    setCertificateSettings(newSettings)
    onUpdate({ ...course, certificateSettings: newSettings })
  }

  const handleRequirementsUpdate = (updates) => {
    handleSettingsUpdate({
      completionRequirements: { ...certificateSettings.completionRequirements, ...updates },
    })
  }

  const templateOptions = [
    { value: "modern", label: "Modern", description: "Clean design with bold typography" },
    { value: "classic", label: "Classic", description: "Traditional certificate style" },
    { value: "elegant", label: "Elegant", description: "Sophisticated with decorative elements" },
    { value: "minimal", label: "Minimal", description: "Simple and clean layout" },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Course Certificate</h2>
          <p className="text-muted-foreground">Configure completion certificates for your course</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={onSave} variant="outline" className="flex items-center gap-2 bg-transparent">
            <Save className="h-4 w-4" />
            Save Changes
          </Button>
          <Button variant="outline" className="flex items-center gap-2 bg-transparent">
            <Eye className="h-4 w-4" />
            Preview
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Settings */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Certificate Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="enabled">Enable Certificates</Label>
                  <p className="text-sm text-muted-foreground">Allow students to earn completion certificates</p>
                </div>
                <Switch
                  id="enabled"
                  checked={certificateSettings.enabled}
                  onCheckedChange={(enabled) => handleSettingsUpdate({ enabled })}
                />
              </div>

              {certificateSettings.enabled && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="title">Certificate Title</Label>
                    <Input
                      id="title"
                      value={certificateSettings.title}
                      onChange={(e) => handleSettingsUpdate({ title: e.target.value })}
                      placeholder="Certificate of Completion"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Certificate Text</Label>
                    <Textarea
                      id="description"
                      value={certificateSettings.description}
                      onChange={(e) => handleSettingsUpdate({ description: e.target.value })}
                      placeholder="Certificate description text..."
                      rows={4}
                    />
                    <p className="text-xs text-muted-foreground">
                      Use {"{student_name}"} and {"{course_title}"} as placeholders
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="issuerName">Issuer Name</Label>
                      <Input
                        id="issuerName"
                        value={certificateSettings.issuerName}
                        onChange={(e) => handleSettingsUpdate({ issuerName: e.target.value })}
                        placeholder="Your Organization"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="issuerTitle">Issuer Title</Label>
                      <Input
                        id="issuerTitle"
                        value={certificateSettings.issuerTitle}
                        onChange={(e) => handleSettingsUpdate({ issuerTitle: e.target.value })}
                        placeholder="Course Provider"
                      />
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {certificateSettings.enabled && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="h-5 w-5" />
                    Design & Template
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Certificate Template</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {templateOptions.map((template) => (
                        <div
                          key={template.value}
                          className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                            certificateSettings.template === template.value
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50"
                          }`}
                          onClick={() => handleSettingsUpdate({ template: template.value })}
                        >
                          <div className="font-medium">{template.label}</div>
                          <div className="text-sm text-muted-foreground">{template.description}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="backgroundColor">Background Color</Label>
                      <div className="flex gap-2">
                        <Input
                          id="backgroundColor"
                          type="color"
                          value={certificateSettings.backgroundColor}
                          onChange={(e) => handleSettingsUpdate({ backgroundColor: e.target.value })}
                          className="w-12 h-10 p-1"
                        />
                        <Input
                          value={certificateSettings.backgroundColor}
                          onChange={(e) => handleSettingsUpdate({ backgroundColor: e.target.value })}
                          placeholder="#ffffff"
                          className="flex-1"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="textColor">Text Color</Label>
                      <div className="flex gap-2">
                        <Input
                          id="textColor"
                          type="color"
                          value={certificateSettings.textColor}
                          onChange={(e) => handleSettingsUpdate({ textColor: e.target.value })}
                          className="w-12 h-10 p-1"
                        />
                        <Input
                          value={certificateSettings.textColor}
                          onChange={(e) => handleSettingsUpdate({ textColor: e.target.value })}
                          placeholder="#1f2937"
                          className="flex-1"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="accentColor">Accent Color</Label>
                      <div className="flex gap-2">
                        <Input
                          id="accentColor"
                          type="color"
                          value={certificateSettings.accentColor}
                          onChange={(e) => handleSettingsUpdate({ accentColor: e.target.value })}
                          className="w-12 h-10 p-1"
                        />
                        <Input
                          value={certificateSettings.accentColor}
                          onChange={(e) => handleSettingsUpdate({ accentColor: e.target.value })}
                          placeholder="#3b82f6"
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Organization Logo</Label>
                      <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center">
                        {certificateSettings.logoUrl ? (
                          <div className="space-y-2">
                            <img
                              src={certificateSettings.logoUrl || "/placeholder.svg"}
                              alt="Logo"
                              className="h-12 mx-auto"
                            />
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleSettingsUpdate({ logoUrl: undefined })}
                            >
                              Remove
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <ImageIcon className="h-8 w-8 mx-auto text-muted-foreground" />
                            <Button size="sm" variant="outline">
                              <Upload className="h-4 w-4 mr-2" />
                              Upload Logo
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Signature Image</Label>
                      <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center">
                        {certificateSettings.signatureUrl ? (
                          <div className="space-y-2">
                            <img
                              src={certificateSettings.signatureUrl || "/placeholder.svg"}
                              alt="Signature"
                              className="h-12 mx-auto"
                            />
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleSettingsUpdate({ signatureUrl: undefined })}
                            >
                              Remove
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <Type className="h-8 w-8 mx-auto text-muted-foreground" />
                            <Button size="sm" variant="outline">
                              <Upload className="h-4 w-4 mr-2" />
                              Upload Signature
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Completion Requirements</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Complete All Lessons</Label>
                      <p className="text-sm text-muted-foreground">Student must complete every lesson</p>
                    </div>
                    <Switch
                      checked={certificateSettings.completionRequirements.completeAllLessons}
                      onCheckedChange={(completeAllLessons) => handleRequirementsUpdate({ completeAllLessons })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Pass All Quizzes</Label>
                      <p className="text-sm text-muted-foreground">Student must pass every quiz</p>
                    </div>
                    <Switch
                      checked={certificateSettings.completionRequirements.passAllQuizzes}
                      onCheckedChange={(passAllQuizzes) => handleRequirementsUpdate({ passAllQuizzes })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="minimumScore">Minimum Overall Score (%)</Label>
                    <Input
                      id="minimumScore"
                      type="number"
                      min="0"
                      max="100"
                      value={certificateSettings.completionRequirements.minimumScore}
                      onChange={(e) =>
                        handleRequirementsUpdate({
                          minimumScore: Number.parseInt(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Preview */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Certificate Preview</CardTitle>
            </CardHeader>
            <CardContent>
              {certificateSettings.enabled ? (
                <div
                  className="aspect-[4/3] border rounded-lg p-4 text-center flex flex-col justify-center"
                  style={{
                    backgroundColor: certificateSettings.backgroundColor,
                    color: certificateSettings.textColor,
                  }}
                >
                  <div className="space-y-3">
                    {certificateSettings.logoUrl && (
                      <img src={certificateSettings.logoUrl || "/placeholder.svg"} alt="Logo" className="h-8 mx-auto" />
                    )}
                    <h3 className="text-lg font-bold" style={{ color: certificateSettings.accentColor }}>
                      {certificateSettings.title}
                    </h3>
                    <div className="text-sm space-y-1">
                      <p>John Doe</p>
                      <p className="text-xs opacity-75">
                        {certificateSettings.description
                          .replace("{student_name}", "John Doe")
                          .replace("{course_title}", course.title || "Sample Course")
                          .substring(0, 100)}
                        ...
                      </p>
                    </div>
                    <div className="text-xs opacity-75 mt-4">
                      <p>{certificateSettings.issuerName}</p>
                      <p>{certificateSettings.issuerTitle}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="aspect-[4/3] border-2 border-dashed border-muted-foreground/25 rounded-lg flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <Award className="h-8 w-8 mx-auto mb-2" />
                    <p>Certificates disabled</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {certificateSettings.enabled && (
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full bg-transparent">
                  <Eye className="h-4 w-4 mr-2" />
                  Full Preview
                </Button>
                <Button variant="outline" className="w-full bg-transparent">
                  <Download className="h-4 w-4 mr-2" />
                  Download Sample
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
