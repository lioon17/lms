import Header from "@/components/home/header"
import HeroSection from "@/components/home/hero-section"
import CourseHighlights from "@/components/home/course-highlights"
import WhyChooseUs from "@/components/home/why-choose-us"
import HowItWorks from "@/components/home/how-it-works"
import Testimonials from "@/components/home/testimonials"
import Certificates from "@/components/home/certificates"
import PricingSection from "@/components/home/pricing-section"
import InstructorCallout from "@/components/home/instructor-callout"
import FAQSection from "@/components/home/faq-section"
import Footer from "@/components/home/footer"

export default function LMSLandingPage() {
  return (
    <main className="min-h-screen">
        <Header/>
      <HeroSection />
      <CourseHighlights />
      <WhyChooseUs />
      <HowItWorks />
      <Testimonials />
      <Certificates />
      <PricingSection />
      <InstructorCallout />
      <FAQSection />
      <Footer />
    </main>
  )
}
