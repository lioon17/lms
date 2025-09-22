import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

const faqs = [
  {
    question: "How do I re-enroll if I fail a course?",
    answer:
      "You can re-enroll in any course for free within 30 days of completion. Simply go to your dashboard and click the 'Retake Course' button. All your previous progress will be saved, and you can focus on the areas that need improvement.",
  },
  {
    question: "Do I get lifetime access to courses?",
    answer:
      "Yes! Once you purchase a course, you have lifetime access to all course materials, including any future updates. You can learn at your own pace and revisit the content whenever you need a refresher.",
  },
  {
    question: "Are certificates verified and recognized?",
    answer:
      "Our certificates are industry-recognized and include QR codes for instant verification. They're accepted by leading companies and can be shared directly on LinkedIn, added to your resume, or included in job applications.",
  },
  {
    question: "Can I access courses on mobile devices?",
    answer:
      "Yes, our platform is fully responsive and we have dedicated mobile apps for iOS and Android. You can download courses for offline viewing, sync your progress across devices, and learn anywhere, anytime.",
  },
  {
    question: "What happens if I'm not satisfied with a course?",
    answer:
      "We offer a 30-day money-back guarantee on all paid courses. If you're not completely satisfied, contact our support team for a full refund. We want to ensure you have the best learning experience possible.",
  },
  {
    question: "How long do I have to complete a course?",
    answer:
      "There are no time limits! You can take as long as you need to complete any course. Whether you want to finish in a few days or spread it out over several months, the choice is yours.",
  },
]

export default function FAQSection() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/50">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-balance">
            Frequently Asked <span className="text-accent">Questions</span>
          </h2>
          <p className="text-xl text-muted-foreground text-pretty">
            Got questions? We've got answers. Find everything you need to know about our platform.
          </p>
        </div>

        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="bg-background rounded-lg px-6 border-0 shadow-sm"
            >
              <AccordionTrigger className="text-left hover:no-underline py-6">
                <span className="font-semibold">{faq.question}</span>
              </AccordionTrigger>
              <AccordionContent className="pb-6 text-muted-foreground">{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="text-center mt-12">
          <p className="text-muted-foreground mb-4">Still have questions?</p>
          <Button variant="outline">Contact Support</Button>
        </div>
      </div>
    </section>
  )
}
