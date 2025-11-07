"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { 
  Mail, 
  Phone, 
  HelpCircle, 
  FileText, 
  Download, 
  Globe, 
  Clock,
  RefreshCw,
  User
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { submitContactForm, handleApiError, submitQueryWithoutCaptcha, isDevelopment } from "@/utils/api"
import { HCaptchaComponent } from "@/components/ui/hcaptcha"

export default function PrivacyPolicy() {
  const { toast } = useToast()
  const [isScrolled, setIsScrolled] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [showContactModal, setShowContactModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle")
  const [isCaptchaVerified, setIsCaptchaVerified] = useState(false)
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    message: ""
  })
  const [isClient, setIsClient] = useState(false)

  // Scroll effect for navigation
  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Prevent hydration issues
  React.useEffect(() => {
    setIsClient(true)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Contact form functions
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    setIsSubmitting(true)
    setSubmitStatus("idle")

    try {
      // Format data for API
      const contactFormData = {
        name: formData.name,
        email: formData.email,
        company: formData.company,
        message: formData.message,
        captchaToken: captchaToken || undefined
      }

      let response
      
      // Use environment detection to determine submission method
      if (isDevelopment) {
        // Development: Use bypass for convenience
        console.log('🔍 DEBUG: Development environment - using bypass API')
        const bypassData = {
          name: formData.name,
          email: formData.email,
          message: `Contact Form Inquiry from ${formData.name}\n\nContact Information:\n- Name: ${formData.name}\n- Email: ${formData.email}${formData.company ? `\n- Company: ${formData.company}` : ''}\n\nMessage:\n${formData.message}`,
          to: "xscard@xspark.co.za",
          type: "contact"
        }
        response = await submitQueryWithoutCaptcha(bypassData)
      } else {
        // Production: Use real captcha verification
        console.log('🔍 DEBUG: Production environment - using real captcha verification')
        response = await submitContactForm(contactFormData)
      }

      console.log("Contact form submitted successfully:", response)
      setSubmitStatus("success")
      
      // Show success toast
      toast({
        title: "Message Sent Successfully!",
        description: "Thank you for your message. We'll get back to you soon.",
        variant: "default",
      })
      
      // Reset form
      setFormData({
        name: "",
        email: "",
        company: "",
        message: ""
      })
      setIsCaptchaVerified(false)
      setCaptchaToken(null)
      
    } catch (error) {
      console.error("Contact form submission error:", error)
      const errorMessage = handleApiError(error)
      console.error("Error details:", errorMessage)
      setSubmitStatus("error")
      
      // Show error toast
      toast({
        title: "Failed to Send Message",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const openContactModal = () => {
    setShowContactModal(true)
    setSubmitStatus("idle")
    setIsCaptchaVerified(false)
  }

  const closeContactModal = () => {
    setShowContactModal(false)
    setSubmitStatus("idle")
    setIsCaptchaVerified(false)
  }

  const handleCaptchaVerify = (verified: boolean, token?: string) => {
    setIsCaptchaVerified(verified)
    if (verified && token) {
      setCaptchaToken(token)
    } else {
      setCaptchaToken(null)
      setSubmitStatus("idle")
    }
  }

  const copyToClipboard = async (text: string, label: string) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text)
        toast({
          title: "Copied to clipboard!",
          description: `${label} has been copied to your clipboard.`,
          variant: "default",
          className: "bg-green-600 border-green-500 text-white",
        })
      } else {
        const textArea = document.createElement("textarea")
        textArea.value = text
        textArea.style.position = "fixed"
        textArea.style.left = "-999999px"
        textArea.style.top = "-999999px"
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()
        
        const successful = document.execCommand('copy')
        document.body.removeChild(textArea)
        
        if (successful) {
          toast({
            title: "Copied to clipboard!",
            description: `${label} has been copied to your clipboard.`,
            variant: "default",
            className: "bg-green-600 border-green-500 text-white",
          })
        } else {
          throw new Error("Copy command failed")
        }
      }
    } catch (error) {
      console.error("Copy failed:", error)
      toast({
        title: "Failed to copy",
        description: "Please copy the text manually.",
        variant: "destructive",
      })
    }
  }

  const contactMethods = [
    {
      icon: Mail,
      title: "Email Support",
      description: "Get help via email",
      details: "support@xscard.co.za",
      response: "Within 48 hours",
      color: "bg-blue-500"
    },
    {
      icon: Phone,
      title: "Phone Support",
      description: "Call us directly",
      details: "+27872655236",
      response: "Business hours",
      color: "bg-purple-500"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      {/* Navigation */}
      <nav
        className={`fixed top-4 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-white/20 backdrop-blur-lg border border-white/10"
            : "bg-white shadow-lg border border-gray-100"
        } ${
          "md:left-1/2 md:-translate-x-1/2 md:w-[800px] md:px-6 md:py-4 md:rounded-full " +
          "left-4 right-4 px-4 sm:px-6 py-2 sm:py-4 rounded-full"
        }`}
      >
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center space-x-2">
            <button
              onClick={scrollToTop}
              className="flex items-center space-x-2 cursor-pointer hover:opacity-80 transition-opacity"
            >
              <Image 
                src="/images/xscard-logo.png" 
                alt="XS Card Logo" 
                width={200} 
                height={67} 
                className="h-8 sm:h-10 md:h-12 lg:h-14 w-auto" 
                priority
              />
            </button>
          </div>
          
          {/* Desktop and Tablet Navigation (md and up) */}
          <div className="hidden md:flex items-center space-x-6 xl:space-x-8">
            <Link href="/">
              <button
                className={`transition-colors font-medium cursor-pointer ${
                  isScrolled
                    ? "text-white/90 hover:text-white"
                    : "text-gray-700 hover:text-purple-600"
                }`}
              >
                Home
              </button>
            </Link>
            <Link href="/privacy">
              <button
                className={`transition-colors font-medium cursor-pointer ${
                  isScrolled
                    ? "text-white/90 hover:text-white"
                    : "text-gray-700 hover:text-purple-600"
                }`}
              >
                Privacy
              </button>
            </Link>
            <button
              onClick={openContactModal}
              className={`transition-colors font-medium cursor-pointer ${
                isScrolled
                  ? "text-white/90 hover:text-white"
                  : "text-gray-700 hover:text-purple-600"
              }`}
            >
              Contact
            </button>
            <Link href="/support">
              <button
                className={`transition-colors font-medium cursor-pointer ${
                  isScrolled
                    ? "text-white/90 hover:text-white"
                    : "text-gray-700 hover:text-purple-600"
                }`}
              >
                Support
              </button>
            </Link>
          </div>
          
          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              className={`${
                isScrolled
                  ? "text-white/90 hover:text-white"
                  : "text-gray-700 hover:text-purple-600"
              }`}
              onClick={() => setShowMobileMenu(!showMobileMenu)}
            >
              <div className="relative w-6 h-6">
                <span className={`absolute top-1/2 left-0 w-6 h-0.5 bg-current transform transition-all duration-300 ${
                  showMobileMenu ? 'rotate-45 translate-y-0' : '-translate-y-1'
                }`}></span>
                <span className={`absolute top-1/2 left-0 w-6 h-0.5 bg-current transform transition-all duration-300 ${
                  showMobileMenu ? 'opacity-0' : 'opacity-100'
                }`}></span>
                <span className={`absolute top-1/2 left-0 w-6 h-0.5 bg-current transform transition-all duration-300 ${
                  showMobileMenu ? '-rotate-45 translate-y-0' : 'translate-y-1'
                }`}></span>
              </div>
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="md:hidden mt-4 pt-4 border-t border-white/10">
            <div className="flex flex-col space-y-3">
              <Link href="/">
                <button
                  className={`w-full text-left transition-colors font-medium cursor-pointer ${
                    isScrolled
                      ? "text-white/90 hover:text-white"
                      : "text-gray-700 hover:text-purple-600"
                  }`}
                  onClick={() => setShowMobileMenu(false)}
                >
                  Home
                </button>
              </Link>
              <Link href="/privacy">
                <button
                  className={`w-full text-left transition-colors font-medium cursor-pointer ${
                    isScrolled
                      ? "text-white/90 hover:text-white"
                      : "text-gray-700 hover:text-purple-600"
                  }`}
                  onClick={() => setShowMobileMenu(false)}
                >
                  Privacy
                </button>
              </Link>
              <button
                onClick={() => {
                  openContactModal()
                  setShowMobileMenu(false)
                }}
                className={`w-full text-left transition-colors font-medium cursor-pointer ${
                  isScrolled
                    ? "text-white/90 hover:text-white"
                    : "text-gray-700 hover:text-purple-600"
                }`}
              >
                Contact
              </button>
              <Link href="/support">
                <button
                  className={`w-full text-left transition-colors font-medium cursor-pointer ${
                    isScrolled
                      ? "text-white/90 hover:text-white"
                      : "text-gray-700 hover:text-purple-600"
                  }`}
                  onClick={() => setShowMobileMenu(false)}
                >
                  Support
                </button>
              </Link>
            </div>
          </div>
        )}
      </nav>
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-sm border-b border-white/10 pt-24">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Privacy Policy
            </h1>
            <p className="text-xl text-white/80 max-w-3xl mx-auto">
              How we collect, use, and protect your personal information
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Contact Methods */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {contactMethods.map((method, index) => (
            <Card 
              key={index} 
              className={`bg-white/10 backdrop-blur-sm border-white/20 transition-all duration-200 ${
                method.title === "Email Support" 
                  ? "hover:bg-white/15 cursor-pointer" 
                  : "hover:bg-white/15 cursor-pointer"
              }`}
              onClick={() => {
                if (method.title === "Email Support") {
                  window.location.href = `mailto:${method.details}`
                } else if (method.title === "Phone Support") {
                  copyToClipboard(method.details, "Phone number")
                }
              }}
            >
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-lg ${method.color}`}>
                    <method.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-semibold">{method.title}</h3>
                    <p className="text-white/70 text-sm">{method.description}</p>
                    <p className="text-white font-medium mt-1">{method.details}</p>
                    <div className="flex items-center mt-2">
                      <Clock className="w-4 h-4 text-white/60 mr-1" />
                      <span className="text-white/60 text-sm">{method.response}</span>
                    </div>
                    <div className="mt-2">
                      <span className="text-white/50 text-xs">
                        {method.title === "Email Support" ? "Click to open email client" : "Click to copy phone number"}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 md:p-12 border border-white/10">
          <div className="prose prose-invert max-w-none">
            <div className="text-white/90 space-y-8">
              <div className="text-center mb-12">
                <p className="text-lg text-white/70">
                  Last updated: February 20, 2025
                </p>
              </div>

              <section>
                <h2 className="text-2xl font-bold text-white mb-6">
                  Our Privacy Principles
                </h2>
                <div className="text-white/80 space-y-4">
                  <p>
                    At the core of XSCard's product is the enablement of sharing your information with those you want to share with. As a result, data privacy is critical to the product we offer. At XSCard, we believe in the importance of being able to control who gets that information.
                  </p>
                  <p>
                    To reflect this importance, we've designed our product with several principles in mind:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li><strong>Your data is yours</strong> - We don't sell or provide your data to third parties without your consent. It's just not what we do here at XSCard. Your data is yours to share with your network.</li>
                    <li><strong>Secure Storage</strong> - Your data is protected by Enterprise grade encryption and security.</li>
                    <li><strong>Safe Sharing</strong> - Every XSCard has a unique code and web address. Those you share your information with will be able to look at your details. If they share your card with others or their company, others may be able to view your details.</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-6">
                  1. Introduction
                </h2>
                <div className="text-white/80 space-y-4">
                  <p>
                    This privacy policy ("Policy") describes how the personally identifiable information ("Personal Information") you may provide in the XSCard software applications ("Software Applications" or "Service") and any of its related products and services (collectively, "Services") is collected, protected and used. It also describes the choices available to you regarding our use of your Personal Information and how you can access and update this information.
                  </p>
                  <p>
                    This Policy is a legally binding agreement between you ("User", "you" or "your") and XSCard ("XSCard", "we", "us" or "our"). XSCard is a South African-based digital business card service provider. By accessing and using the Software Applications and Services, you acknowledge that you have read, understood, and agree to be bound by the terms of this Agreement. This Policy does not apply to the practices of companies that we do not own or control, or to individuals that we do not employ or manage.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-6">
                  2. Automatic Collection of Information
                </h2>
                <div className="text-white/80 space-y-4">
                  <p>
                    Our top priority is customer data security. We may process only minimal user data, only as much as it is absolutely necessary to maintain the Software Applications and Services. Information collected automatically is used only to identify potential cases of abuse and establish statistical information regarding the usage of the Software Application and Services.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-6">
                  3. Collection of Personal Information
                </h2>
                <div className="text-white/80 space-y-4">
                  <p>
                    You can access and use the Software Application and Services without telling us who you are or revealing any information by which someone could identify you as a specific, identifiable individual. If, however, you wish to use some of the features in the Software Applications, you may be asked to provide certain Personal Information (for example, your name and email address). We receive and store any information you knowingly provide to us when you create an account, make a purchase, or fill any online forms in the Software Applications. When required, this information may include the following:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Personal details such as name, country of residence, etc.</li>
                    <li>Contact information such as email address, address, etc.</li>
                    <li>Account details such as user name, unique user ID, password, etc.</li>
                    <li>Payment information such as credit card details, bank details, etc.</li>
                    <li>Geolocation data such as latitude and longitude</li>
                    <li>Certain features on the mobile device such as contacts, calendar, gallery, etc.</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-6">
                  4. Use and Processing of Collected Information
                </h2>
                <div className="text-white/80 space-y-4">
                  <p>
                    In order to make the Software Applications and Services available to you, or to meet a legal obligation, we need to collect and use certain Personal Information. If you do not provide the information that we request, we may not be able to provide you with the requested products or services. Any of the information we collect from you may be used for the following purposes:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Create and manage user accounts</li>
                    <li>Deliver products or services</li>
                    <li>Improve products and services</li>
                    <li>Send administrative information</li>
                    <li>Respond to inquiries and offer support</li>
                    <li>Request user feedback</li>
                    <li>Improve user experience</li>
                    <li>Enforce terms and conditions and policies</li>
                    <li>Protect from abuse and malicious users</li>
                    <li>Respond to legal requests and prevent harm</li>
                    <li>Run and operate the Software Applications and Services</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-6">
                  5. Protection of Information and Compliance with South African Law
                </h2>
                <div className="text-white/80 space-y-4">
                  <p>
                    We comply with the Protection of Personal Information Act (POPIA) of South Africa. This means we:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Process your personal information lawfully and in a reasonable manner</li>
                    <li>Only collect personal information for a specific, explicitly defined purpose</li>
                    <li>Ensure that your personal information is complete, accurate, and not misleading</li>
                    <li>Maintain the integrity and confidentiality of your personal information</li>
                    <li>Only retain your personal information for as long as necessary to fulfill the purpose for which it was collected</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-6">
                  6. Billing and Payments
                </h2>
                <div className="text-white/80 space-y-4">
                  <p>
                    We use third party payment processors to assist us in processing your payment information securely. Such third party processors' use of your Personal Information is governed by their respective privacy policies which may or may not contain privacy protections as protective as this Policy. We suggest that you review their respective privacy policies.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-6">
                  7. Managing Information
                </h2>
                <div className="text-white/80 space-y-4">
                  <p>
                    You are able to delete certain Personal Information we have about you. The Personal Information you can delete may change as the Software Applications and Services change. When you delete Personal Information, however, we may maintain a copy of the unrevised Personal Information in our records for the duration necessary to comply with our obligations to our affiliates and partners, and for the purposes described below. If you would like to delete your Personal Information or permanently delete your account, you can do so by contacting us.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-6">
                  8. Disclosure of Information
                </h2>
                <div className="text-white/80 space-y-4">
                  <p>
                    Depending on the requested Services or as necessary to complete any transaction or provide any service you have requested, we may share your information with your consent with our trusted third parties that work with us, any other affiliates and subsidiaries we rely upon to assist in the operation of the Software Applications and Services available to you. We do not share Personal Information with unaffiliated third parties. These service providers are not authorized to use or disclose your information except as necessary to perform services on our behalf or comply with legal requirements.
                  </p>
                  <p>
                    As a data subject under POPIA, you have the right to:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Request access to your personal information</li>
                    <li>Request correction of your personal information</li>
                    <li>Request deletion of your personal information</li>
                    <li>Object to the processing of your personal information</li>
                    <li>Lodge a complaint with the Information Regulator</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-6">
                  9. Retention of Information
                </h2>
                <div className="text-white/80 space-y-4">
                  <p>
                    We will retain and use your Personal Information for the period necessary to comply with our legal obligations, resolve disputes, and enforce our agreements unless a longer retention period is required or permitted by law. We may use any aggregated data derived from or incorporating your Personal Information after you update or delete it, but not in a manner that would identify you personally.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-6">
                  10. Transfer of Information
                </h2>
                <div className="text-white/80 space-y-4">
                  <p>
                    As a South African company, we primarily store and process your data within South Africa. However, depending on your location and our service providers, data transfers may involve transferring and storing your information in a country other than your own. Where we do transfer data internationally, we ensure appropriate safeguards are in place to protect your information.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-6">
                  11. Cookies
                </h2>
                <div className="text-white/80 space-y-4">
                  <p>
                    Our websites may use cookies. A cookie is a small file of letters and numbers the website puts on your device if you allow it. These cookies recognize when your device has visited our website(s) before, so we can distinguish you from other users of the website. This improves your experience and our website(s).
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-6">
                  12. Privacy of Children
                </h2>
                <div className="text-white/80 space-y-4">
                  <p>
                    We do not knowingly collect any Personal Information from children under the age of 18. If you are under the age of 18, please do not submit any Personal Information through the Software Applications and Services.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-6">
                  13. Email Marketing
                </h2>
                <div className="text-white/80 space-y-4">
                  <p>
                    We offer electronic newsletters to which you may voluntarily subscribe at any time. We are committed to keeping your email address confidential and will not disclose your email address to any third parties except as allowed in the information use and processing section or for the purposes of utilizing a third party provider to send such emails. We will maintain the information sent via email in accordance with applicable laws and regulations.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-6">
                  14. Information Security
                </h2>
                <div className="text-white/80 space-y-4">
                  <p>
                    We secure information you provide on computer servers in a controlled, secure environment, protected from unauthorized access, use, or disclosure. We maintain reasonable administrative, technical, and physical safeguards in an effort to protect against unauthorized access, use, modification, and disclosure of Personal Information in its control and custody. However, no data transmission over the Internet or wireless network can be guaranteed.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-6">
                  15. Data Breach
                </h2>
                <div className="text-white/80 space-y-4">
                  <p>
                    In the event we become aware that the security of the Software Applications and Services has been compromised or users' Personal Information has been disclosed to unauthorized parties, we will take appropriate measures, including investigation and reporting, as well as notification to and cooperation with law enforcement authorities as required by applicable law.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-6">
                  16. Changes and Amendments
                </h2>
                <div className="text-white/80 space-y-4">
                  <p>
                    We reserve the right to modify this Policy or its terms relating to the Software Applications and Services from time to time in our discretion and will notify you of any material changes to the way in which we treat Personal Information.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-6">
                  17. Acceptance of This Policy
                </h2>
                <div className="text-white/80 space-y-4">
                  <p>
                    You acknowledge that you have read this Policy and agree to all its terms and conditions. By accessing and using the Software Applications and Services you agree to be bound by this Policy. If you do not agree to abide by the terms of this Policy, you are not authorized to access or use the Software Applications and Services.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-6">
                  18. Contact Us
                </h2>
                <div className="text-white/80 space-y-4">
                  <p>
                    If you would like to contact us to understand more about this Policy or wish to contact us concerning any matter relating to individual rights and your Personal Information, you may send an email to:
                  </p>
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <p className="text-white/90">
                      <strong>Email:</strong> support@xscard.co.za
                    </p>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>



        {/* Contact Modal */}
        {isClient && showContactModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
              className="absolute inset-0 backdrop-blur-sm animate-fade-in-scale safari-blur bg-black/50"
              onClick={closeContactModal}
            ></div>

            {/* Modal Content */}
            <div className="relative bg-gradient-to-br from-gray-900/95 to-black/95 backdrop-blur-sm border border-white/20 rounded-2xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto modal-scroll animate-fade-in-scale animation-delay-200">
              {/* Close Button */}
              <button
                onClick={closeContactModal}
                className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors text-xl"
              >
                ✕
              </button>

              {/* Header */}
              <div className="text-center mb-6">
                <div className="flex items-center justify-center mb-3">
                  <Image 
                    src="/favicon.png" 
                    alt="XS Card Logo" 
                    width={32} 
                    height={32} 
                    className="mr-3 rounded-lg"
                  />
                  <h3 className="text-2xl font-bold text-white">Get In Touch</h3>
                </div>
              </div>

              {/* Success/Error Messages */}
              {submitStatus === "success" && (
                <div className="mb-6 p-4 bg-green-500/20 border border-green-500/30 rounded-lg">
                  <p className="text-green-400 text-center font-medium">
                    ✅ Thank you! We'll be in touch within 24 hours.
                  </p>
                </div>
              )}

              {submitStatus === "error" && (
                <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
                  <p className="text-red-400 text-center font-medium">
                    ❌ Something went wrong. Please try again or contact us directly.
                  </p>
                </div>
              )}

              {/* Contact Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 text-gray-900 placeholder-gray-500"
                    placeholder="Your name"
                    disabled={isSubmitting}
                    required
                  />
                </div>

                <div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 text-gray-900 placeholder-gray-500"
                    placeholder="Your email"
                    disabled={isSubmitting}
                    required
                  />
                </div>

                <div>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 text-gray-900 placeholder-gray-500"
                    placeholder="Company (optional)"
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 text-gray-900 placeholder-gray-500 resize-none"
                    rows={4}
                    placeholder="Tell us about your needs, team size, or any questions..."
                    disabled={isSubmitting}
                  />
                </div>

                {/* Captcha */}
                <div>
                  <HCaptchaComponent
                    onVerify={handleCaptchaVerify}
                    isOverLightSection={false}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={
                    isSubmitting || !formData.name || !formData.email || !formData.message || submitStatus === "success"
                    // Temporarily bypass captcha requirement for testing
                    // || !isCaptchaVerified
                  }
                  className="w-full bg-custom-btn-gradient hover:opacity-90 text-white transition-opacity"
                >
                  {isSubmitting ? (
                    <div className="flex items-center space-x-2">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Sending...</span>
                    </div>
                  ) : (
                    "Send Message"
                  )}
                </Button>

                {/* Footer Text */}
                <div className="text-center pt-4">
                  <p className="text-white/80 text-sm">
                    We'll get back to you within 24 hours with personalized recommendations.
                  </p>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="px-6 py-12 border-t border-white/10 mt-20">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex items-center space-x-2 mb-4 md:mb-0">
                <Image 
                  src="/images/xscard-logo.png" 
                  alt="XS Card Logo" 
                  width={100} 
                  height={32} 
                  className="h-8 w-auto" 
                />
              </div>
              <div className="flex space-x-6 text-white/60">
                <Link href="/privacy" className="hover:text-white transition-colors">
                  Privacy
                </Link>
                <Link href="/terms" className="hover:text-white transition-colors">
                  Terms
                </Link>
                <Link href="/support" className="hover:text-white transition-colors">
                  Support
                </Link>
                <Link href="/admin" className="hover:text-white transition-colors flex items-center space-x-1">
                  <User className="w-4 h-4" />
                  <span>Admin Login</span>
                </Link>
              </div>
            </div>
            <div className="mt-8 pt-8 border-t border-white/10 text-center text-white/60">
              <p>&copy; 2024 X Spark. All rights reserved.</p>
              <p className="mt-2">
                Developed by{" "}
                <a 
                  href="https://xspark.co.za/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-purple-400 hover:text-purple-300 transition-colors underline"
                >
                  X Spark Pty Ltd
                </a>
              </p>
            </div>
          </div>
        </footer>
      </div>
      
      {/* Toast Notifications */}
      <Toaster />
    </div>
  )
}
