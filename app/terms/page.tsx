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

export default function TermsPage() {
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
      </nav>

      {/* Mobile Menu */}
      {showMobileMenu && (
        <div className="fixed top-20 left-4 right-4 z-40 md:hidden">
          <div className="bg-white/95 backdrop-blur-lg border border-white/20 rounded-2xl p-4 shadow-xl">
            <div className="flex flex-col space-y-3">
              <Link href="/">
                <button className="text-left w-full px-4 py-2 text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors">
                  Home
                </button>
              </Link>
              <Link href="/privacy">
                <button className="text-left w-full px-4 py-2 text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors">
                  Privacy
                </button>
              </Link>
              <button 
                onClick={() => {
                  openContactModal()
                  setShowMobileMenu(false)
                }}
                className="text-left w-full px-4 py-2 text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
              >
                Contact
              </button>
              <Link href="/support">
                <button className="text-left w-full px-4 py-2 text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors">
                  Support
                </button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-24">
        {/* Hero Section */}
        <div className="text-center mb-12 md:mt-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Terms and Conditions
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            Please read these terms and conditions carefully before using XS Card.
          </p>
          <p className="text-sm text-white/60 mt-2">
            Last updated: February 21, 2025
          </p>
        </div>

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

        {/* Terms Content */}
        <div className="space-y-8">
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="p-8">
              <div className="prose prose-invert max-w-none">
                <h2 className="text-2xl font-bold text-white mb-6">Terms & Conditions</h2>
                
                <h3 className="text-xl font-bold text-white mb-4">1. Our Disclosures</h3>
                <p className="text-white/80 mb-4">
                  Our complete terms and conditions are contained below, but some important points for you to know before you become a customer are set out below:
                </p>
                <ul className="text-white/80 mb-6 list-disc list-inside space-y-2">
                  <li>We may amend these Terms, remove features or functionality of the Platform or your Membership at any time;</li>
                  <li>Your Membership has a term which is set out on the dashboard. You may cancel your Membership at any time but any such cancellation will only take effect at the expiry of your Membership term;</li>
                  <li>Unless your Membership is suspended or terminated in accordance with these Terms, your Membership will roll over on an ongoing basis;</li>
                  <li>We will handle your personal information in accordance with our privacy policy;</li>
                  <li>To the maximum extent permitted by law, the Fees and Product Fees are non-refundable;</li>
                  <li>Our liability under these Terms is limited to us resupplying the Platform to you or, in our sole discretion, to us repaying you the amount of the Fees or Product Fees paid by you to us during the term of your Membership, and we will not be liable for Consequential Loss, any loss that is a result of a Third Party Service, or any loss or corruption of data; and</li>
                  <li>We may terminate a Membership immediately to correct a system issue, e.g., account duplication, or if you are found to be misusing the Platform.</li>
                </ul>
                <p className="text-white/80 mb-6">
                  <strong>Nothing in these Terms limits your rights under the South African Consumer Protection Act.</strong>
                </p>

                <h3 className="text-xl font-bold text-white mb-4">2. Introduction</h3>
                <p className="text-white/80 mb-4">
                  <strong>2.1.</strong> These terms and conditions (Terms) are entered into between XS Card (we, us or our) and you, together the Parties and each a Party.
                </p>
                <p className="text-white/80 mb-4">
                  <strong>2.2.</strong> We provide a cloud-based, software as a service platform where individuals and businesses can manage and share their digital business cards through QR codes and receive and manage contact information (Platform) and physical NFC cards (Products).
                </p>
                <p className="text-white/80 mb-4">
                  <strong>2.3.</strong> In these Terms, you means the person or entity registered with us as an Accountholder or where you do not have an Account, the person or entity using the Platform.
                </p>
                <p className="text-white/80 mb-6">
                  <strong>2.4.</strong> If you are using the Platform on behalf of your employer or a business entity, you, in your individual capacity, represent and warrant that you are authorised to act on behalf of your employer or the business entity and to bind the entity and the entity's personnel to these Terms.
                </p>
                <p className="text-white/80 mb-6">
                  <strong>2.5.</strong> You also represent that you are at least 18 years old and have the legal capacity to enter into this Agreement.
                </p>

                <h3 className="text-xl font-bold text-white mb-4">3. Acceptance and Platform License</h3>
                <p className="text-white/80 mb-4">
                  <strong>3.1.</strong> You accept these Terms by registering on the Platform and/or using the Platform.
                </p>
                <p className="text-white/80 mb-4">
                  <strong>3.2.</strong> Subject to your compliance with these Terms, we grant you a non-exclusive, revocable, worldwide, non-transferable licence to use our Platform in accordance with these Terms.
                </p>
                <p className="text-white/80 mb-4">
                  <strong>3.3.</strong> We may amend these Terms at any time, by providing written notice to you. By continuing to use the Platform after the notice or 30 days after notification (whichever date is earlier), you agree to the amended Terms. If you do not agree to the amendment, you may terminate your Membership in accordance with the "Cancellation of Memberships" clause.
                </p>
                <p className="text-white/80 mb-4">
                  <strong>3.4.</strong> If you access or download our mobile application from (1) the Apple App Store, you agree to any Usage Rules set forth in the App Store Terms of Service or (2) the Google Play Store, you agree to the Android, Google Inc. Terms and Conditions including the Google Apps Terms of Service.
                </p>
                <p className="text-white/80 mb-4">
                  If you access or download our mobile application from the Apple App Store, you acknowledge that your use of the App is also subject to the Apple Media Services Terms and the Apple Standard End User License Agreement (available at <a href="https://www.apple.com/legal/internet-services/itunes/dev/stdeula/" target="_blank" rel="noopener noreferrer" className="underline">https://www.apple.com/legal/internet-services/itunes/dev/stdeula/</a>).
                </p>
                
                <p className="text-white/80 mb-4">
                  <strong>3.6.</strong> When using the Platform, you must not do or attempt to do anything that is unlawful or inappropriate, including:
                </p>
                <ul className="text-white/80 mb-6 list-disc list-inside space-y-2 ml-6">
                  <li>anything that would constitute a breach of an individual's privacy (including uploading private or personal information without an individual's consent) or any other legal rights;</li>
                  <li>using the Platform to defame, harass, threaten, menace or offend any person, including using the Platform to send unsolicited electronic messages;</li>
                  <li>tampering with or modifying the Platform (including by transmitting viruses and using trojan horses);</li>
                  <li>using data mining, robots, screen scraping or similar data gathering and extraction tools on the Platform; or</li>
                  <li>facilitating or assisting a third party to do any of the above acts.</li>
                </ul>

                <h3 className="text-xl font-bold text-white mb-4">4. XS Card Services</h3>
                <p className="text-white/80 mb-4">
                  <strong>4.1.</strong> In consideration for your payment of the Fees, we agree to provide you with access to the Platform, the support services as detailed in this section, and any other services we agree to provide as set out in your Account. These services will be provided in accordance with the Consumer Protection Act of South Africa and other applicable laws.
                </p>
                <p className="text-white/80 mb-4">
                  <strong>4.2.</strong> We agree to use our best endeavors to make the Platform available at all times. However, from time to time we may perform reasonable scheduled and emergency maintenance, and the Platform may be unavailable during the times we are performing such maintenance.
                </p>
                <p className="text-white/80 mb-4">
                  <strong>4.3.</strong> Should you be unable to access the Platform, or should you have any other questions or issues impacting on your use and enjoyment of the Platform, you must place a request via the contact form or via email to support@xscard.co.za. We will endeavor to respond to any support requests in a reasonable period.
                </p>
                <p className="text-white/80 mb-4">
                  <strong>4.4.</strong> You acknowledge and agree that the Platform may be reliant on, or interface with third party systems that are not provided by us (Third Party Services). To the maximum extent permitted by law, we shall have no Liability for any Third Party Services, or any unavailability of the Platform due to a failure of the Third Party Services.
                </p>
                <p className="text-white/80 mb-4">
                  <strong>4.5.</strong> You acknowledge and agree that data loss is an unavoidable risk when using any software. To the extent you input any data into the Platform, you agree to maintain a backup copy of any data you input into the Platform.
                </p>
                <p className="text-white/80 mb-4">
                  <strong>4.6.</strong> Where your account is linked to a business membership, you acknowledge and agree that your employer, the business entity and third parties may access your data, analytics or other details related to your use of the Platform.
                </p>
                <p className="text-white/80 mb-6">
                  <strong>4.7.</strong> To the maximum extent permitted by law, we shall have no Liability to you for any loss or corruption of data, or any scheduled or emergency maintenance that causes the Platform to be unavailable.
                </p>

                <h3 className="text-xl font-bold text-white mb-4">5. Our Intellectual Property</h3>
                <p className="text-white/80 mb-4">
                  <strong>5.1.</strong> You acknowledge and agree that any Intellectual Property or content (including copyright and trademarks) available on the Platform, the Platform itself, and any algorithms or machine learning models used on the Platform (Our Intellectual Property) will at all times vest, or remain vested, in us.
                </p>
                <p className="text-white/80 mb-4">
                  <strong>5.2.</strong> We authorize you to use Our Intellectual Property solely for your limited commercial use. You must not exploit Our Intellectual Property for any other purpose, nor allow, aid or facilitate such use by any third party. Use must be limited to devices that are controlled or approved by you.
                </p>
                <p className="text-white/80 mb-4">
                  <strong>5.3.</strong> You must not, directly or indirectly:
                </p>
                <ul className="text-white/80 mb-6 list-disc list-inside space-y-2 ml-6">
                  <li>enable any person or entity other than authorized users to access and use the Platform or Products;</li>
                  <li>attempt to gain unauthorized access to any Platform or its related systems or networks;</li>
                  <li>use or access our Intellectual Property except in accordance with these Terms;</li>
                  <li>modify, copy or create any derivative work based upon our Platform or Products or any portion, feature or function of our Platform or Products;</li>
                  <li>reverse engineer, disassemble or decompile all or any portion of, or attempt to discover or recreate the source code for, the Platform or Products or access or use the Platform or Products in order to:
                    <ul className="text-white/80 mb-2 list-disc list-inside space-y-1 ml-6 mt-2">
                      <li>copy ideas, features, functions or graphics,</li>
                      <li>develop competing products or services, or</li>
                      <li>perform competitive analyses;</li>
                    </ul>
                  </li>
                  <li>remove, obscure or alter any proprietary notice related to the Platform or Products;</li>
                  <li>send or store malicious code;</li>
                  <li>use or permit others to use the Platform or Products in violation of applicable law;</li>
                  <li>use or permit others to use the Platform or Products other than as described in these Terms.</li>
                </ul>

                <h3 className="text-xl font-bold text-white mb-4">6. Your Data</h3>
                <p className="text-white/80 mb-4">
                  <strong>6.1.</strong> You own all data, information or content you upload into the Platform (Your Data), as well as any data or information output from the Platform using Your Data as input (Output Data). Note that Output Data does not include the Analytics (as described below).
                </p>
                <p className="text-white/80 mb-4">
                  <strong>6.2.</strong> You grant us an unlimited, worldwide, perpetual, royalty-free and assignable license to copy, transmit, store, backup and/or otherwise access or use Your Data and the Output Data to:
                </p>
                <ul className="text-white/80 mb-4 list-disc list-inside space-y-2 ml-6">
                  <li>communicate with you (including to send you information we believe may be of interest to you);</li>
                  <li>supply the Platform to you and otherwise perform our obligations under these Terms;</li>
                  <li>diagnose problems with the Platform;</li>
                  <li>enhance and otherwise modify the Platform;</li>
                  <li>perform Analytics;</li>
                  <li>develop other services, provided we de-identify Your Data; and</li>
                  <li>as reasonably required to perform our obligations under these Terms.</li>
                </ul>
                <p className="text-white/80 mb-4">
                  <strong>6.3.</strong> You agree that you are solely responsible for all of Your Data that you make available on or through the Platform. You represent and warrant that:
                </p>
                <ul className="text-white/80 mb-4 list-disc list-inside space-y-2 ml-6">
                  <li>you are either the sole and exclusive owner of Your Data or you have all rights, licenses, consents and releases that are necessary to grant to us the rights in Your Data (as contemplated by these Terms); and</li>
                  <li>neither Your Data nor the posting, uploading, publication, submission or transmission of Your Data or our use of Your Data on, through or by means of our Platform will infringe, misappropriate or violate a third party's intellectual property rights, or rights of publicity or privacy, or result in the violation of any applicable law or regulation.</li>
                </ul>
                <p className="text-white/80 mb-4">
                  <strong>6.4.</strong> You acknowledge and agree that we may monitor, analyze and compile statistical and performance information based on and/or related to your use of the Platform, in an aggregated and anonymized format (Analytics). You acknowledge and agree that we own all rights in the Analytics, and that we may use the Analytics for our own internal business purposes, provided that the Analytics do not contain any identifying information.
                </p>
                <p className="text-white/80 mb-4">
                  <strong>6.5.</strong> We do not endorse or approve, and are not responsible for, any of Your Data.
                </p>
                <p className="text-white/80 mb-4">
                  <strong>6.6.</strong> You acknowledge and agree that the Platform and the integrity and accuracy of the Output Data is reliant on the accuracy and completeness of Your Data, and the provision by you of Your Data that is inaccurate or incomplete may affect the use, output and operation of the Platform.
                </p>
                <p className="text-white/80 mb-6">
                  <strong>6.7.</strong> This clause will survive the termination or expiry of your Membership.
                </p>

                <h3 className="text-xl font-bold text-white mb-4">7. Warranties</h3>
                <p className="text-white/80 mb-4">
                  <strong>7.1.</strong> You represent, warrant and agree that:
                </p>
                <ul className="text-white/80 mb-6 list-disc list-inside space-y-2 ml-6">
                  <li>you will not use our Platform, including Our Intellectual Property, in any way that competes with our business;</li>
                  <li>there are no legal restrictions preventing you from entering into these Terms;</li>
                  <li>all information and documentation that you provide to us in connection with these Terms is true, correct and complete; and</li>
                  <li>you have not relied on any representations or warranties made by us in relation to the Platform (including as to whether the Platform is or will be fit or suitable for your particular purposes), unless expressly stipulated in these Terms.</li>
                </ul>

                <h3 className="text-xl font-bold text-white mb-4">8. South African Consumer Protection Law</h3>
                <p className="text-white/80 mb-4">
                  <strong>8.1.</strong> Certain legislation, including the Consumer Protection Act 68 of 2008 (CPA), and similar consumer protection laws and regulations, may confer you with rights, warranties, guarantees, and remedies relating to the provision of the Platform by us to you, which cannot be excluded, restricted, or modified (Consumer Law Rights).
                </p>
                <p className="text-white/80 mb-4">
                  <strong>8.2.</strong> If the CPA applies to you as a consumer, nothing in these Terms excludes your Consumer Law Rights under the CPA. You agree that our liability for the Platform provided to an entity defined as a consumer under the CPA is governed solely by the CPA and these Terms.
                </p>
                <p className="text-white/80 mb-4">
                  <strong>8.3.</strong> Subject to your Consumer Law Rights, and to the extent permitted by law, we exclude all express and implied warranties, and all material, work, and services (including the Platform) are provided to you "as is" and without warranties of any kind, whether express or implied, whether in statute, at law or on any other basis.
                </p>
                <p className="text-white/80 mb-6">
                  <strong>8.4.</strong> This clause will survive the termination or expiry of your Membership.
                </p>

                <h3 className="text-xl font-bold text-white mb-4">9. Liability</h3>
                <p className="text-white/80 mb-4">
                  <strong>9.1.</strong> Despite anything to the contrary, to the maximum extent permitted by law:
                </p>
                <ul className="text-white/80 mb-4 list-disc list-inside space-y-2 ml-6">
                  <li>you agree to indemnify us for any liability we incur due to your breach of the Acceptance and Platform Licence clause and the Intellectual Property clause of these Terms;</li>
                  <li>neither Party will be liable for Consequential Loss;</li>
                  <li>each Party's liability for any liability under these Terms will be reduced proportionately to the extent the relevant liability was caused or contributed to by the acts or omissions of the other Party;</li>
                  <li>our aggregate liability for any liability arising from or in connection with these Terms will be limited to us resupplying the Platform to you or, in our sole discretion, to us repaying you the amount of the Fees and Product Fees paid by you to us during the term of your Membership.</li>
                </ul>
                <p className="text-white/80 mb-6">
                  <strong>9.2.</strong> This clause will survive the termination or expiry of your Membership.
                </p>

                <h3 className="text-xl font-bold text-white mb-4">10. Subscription Terms and Billing</h3>
                <p className="text-white/80 mb-4">
                  <strong>10.1 Subscription Plans.</strong> XS Card offers auto-renewable subscription plans.
                </p>
                <p className="text-white/80 mb-2">
                  <strong>Available Plans:</strong>
                </p>
                <ul className="text-white/80 mb-4 list-disc list-inside space-y-2 ml-6">
                  <li>Premium (Monthly): 1 month – R159.99 per user/month (South Africa); $12.00 per user/month (outside South Africa)</li>
                  <li>Premium (Annual): 12 months – R1,800.00 per user/year (South Africa); $120.00 per user/year (outside South Africa)</li>
                </ul>
                <p className="text-white/80 mb-2">
                  Each subscription includes:
                </p>
                <ul className="text-white/80 mb-6 list-disc list-inside space-y-2 ml-6">
                  <li>Unlimited digital business cards</li>
                  <li>QR code generation and sharing</li>
                  <li>Cloud storage and backup</li>
                  <li>Contact management</li>
                  <li>Advanced customisation with custom branding</li>
                  <li>Premium QR code designs with brand colours</li>
                  <li>Basic analytics (scans, contacts)</li>
                  <li>Priority email support (within 12 hours)</li>
                </ul>

                <p className="text-white/80 mb-4">
                  <strong>10.2 Free Trial.</strong> Trial duration: 7 days. What's included: Full access to Premium features. No charge during trial: You will not be charged until the trial period ends. Cancel anytime: Cancel before the trial ends to avoid being charged. Automatic conversion: If you don't cancel, you'll automatically be charged for the subscription when the trial ends.
                </p>

                <p className="text-white/80 mb-2">
                  <strong>10.3 Automatic Renewal.</strong>
                </p>
                <ul className="text-white/80 mb-6 list-disc list-inside space-y-2 ml-6">
                  <li>All subscriptions automatically renew unless you cancel at least 24 hours before the end of your current billing period.</li>
                  <li>Your payment method will be charged within 24 hours before the start of each new subscription period.</li>
                  <li>The subscription price may change. We will notify you at least 30 days before any price increase. Continuing to use the service after the price change means you accept the new price.</li>
                </ul>

                <p className="text-white/80 mb-2">
                  <strong>10.4 Payment Processing.</strong>
                </p>
                <ul className="text-white/80 mb-2 list-disc list-inside space-y-2 ml-6">
                  <li>iOS users: Apple App Store via Apple's In-App Purchase (IAP) system, governed by Apple's terms and conditions</li>
                  <li>Android users: Google Play Store via Google's in-app billing system</li>
                </ul>
                <ul className="text-white/80 mb-6 list-disc list-inside space-y-2 ml-6">
                  <li>All fees are charged in advance for each billing period</li>
                  <li>Non-refundable except as required by law or stated in Section 10.7</li>
                  <li>Inclusive of applicable VAT/taxes where required</li>
                  <li>In your local currency as determined by Apple/Google</li>
                </ul>

                <p className="text-white/80 mb-2">
                  <strong>10.5 How to Cancel Your Subscription.</strong>
                </p>
                <p className="text-white/80 mb-2">For iOS (iPhone/iPad) users:</p>
                <ul className="text-white/80 mb-2 list-disc list-inside space-y-1 ml-6">
                  <li>Open Settings on your device</li>
                  <li>Tap your name at the top</li>
                  <li>Tap "Subscriptions"</li>
                  <li>Select "XS Card"</li>
                  <li>Tap "Cancel Subscription"</li>
                </ul>
                <p className="text-white/80 mb-4">Subscriptions purchased via the Apple App Store can only be cancelled through your Apple ID account settings.</p>
                <p className="text-white/80 mb-2">For Android users:</p>
                <ul className="text-white/80 mb-2 list-disc list-inside space-y-1 ml-6">
                  <li>Open Google Play Store</li>
                  <li>Tap your profile icon (top right)</li>
                  <li>Tap "Payments & subscriptions" → "Subscriptions"</li>
                  <li>Select "XS Card"</li>
                  <li>Tap "Cancel subscription"</li>
                </ul>
                <ul className="text-white/80 mb-6 list-disc list-inside space-y-2 ml-6">
                  <li>Cancel at least 24 hours before your renewal date to avoid being charged</li>
                  <li>After cancelling, you keep access until the end of your paid period</li>
                  <li>No refund for the remaining time in your current billing period</li>
                </ul>

                <p className="text-white/80 mb-2">
                  <strong>10.6 What Happens After Cancellation.</strong>
                </p>
                <ul className="text-white/80 mb-6 list-disc list-inside space-y-2 ml-6">
                  <li>You retain full access until the end of your current billing period</li>
                  <li>You will not be charged for future periods</li>
                  <li>Your account converts to a free tier (if available) or becomes read-only</li>
                  <li>Your data is retained according to our Privacy Policy</li>
                  <li>You can resubscribe at any time</li>
                </ul>

                <p className="text-white/80 mb-2">
                  <strong>10.7 Refund Policy.</strong>
                </p>
                <ul className="text-white/80 mb-4 list-disc list-inside space-y-2 ml-6">
                  <li>All subscription sales are final except where required by South African Consumer Protection Act or other applicable law; you experience technical issues preventing Platform access for more than 48 consecutive hours; or you were charged due to our billing error.</li>
                </ul>
                <p className="text-white/80 mb-2">For iOS users (Apple controlled refunds):</p>
                <ul className="text-white/80 mb-4 list-disc list-inside space-y-1 ml-6">
                  <li>Go to <span className="underline">reportaproblem.apple.com</span></li>
                  <li>Sign in with your Apple ID</li>
                  <li>Find the XS Card subscription charge</li>
                  <li>Click "Report a Problem" and follow the instructions</li>
                </ul>
                <p className="text-white/80 mb-4">We cannot process refunds for iOS purchases — Apple controls all refund decisions.</p>
                <p className="text-white/80 mb-2">For Android users (Google controlled refunds):</p>
                <ul className="text-white/80 mb-4 list-disc list-inside space-y-1 ml-6">
                  <li>Go to <span className="underline">play.google.com/store/account</span></li>
                  <li>Find the XS Card subscription</li>
                  <li>Click "Request a refund" or "Report a problem"</li>
                  <li>Follow Google's refund process</li>
                </ul>
                <p className="text-white/80 mb-2">For direct refund requests (where applicable):</p>
                <ul className="text-white/80 mb-6 list-disc list-inside space-y-1 ml-6">
                  <li>Email: support@xscard.co.za</li>
                  <li>Include: account email, subscription details, reason for refund</li>
                  <li>Response time: Within 7 business days</li>
                  <li>Processing time: Approved refunds processed within 14 business days</li>
                  <li>Refund method: Original payment method</li>
                  <li>Refunds are granted at our sole discretion, except where required by law, and depend on time held, usage, reason, and refund history.</li>
                </ul>

                <p className="text-white/80 mb-2">
                  <strong>10.8 Price Changes.</strong>
                </p>
                <ul className="text-white/80 mb-6 list-disc list-inside space-y-2 ml-6">
                  <li>We may change subscription prices at any time.</li>
                  <li>For existing subscribers: We'll notify you at least 30 days before any price increase; the new price applies from your next billing cycle after the notice period; you can cancel before the new price takes effect; continued use after the notice period means you accept the new price.</li>
                  <li>New subscribers always pay the current price listed in the App Store or Google Play.</li>
                </ul>

                <p className="text-white/80 mb-2">
                  <strong>10.9 Subscription Changes and Downgrades.</strong>
                </p>
                <ul className="text-white/80 mb-6 list-disc list-inside space-y-2 ml-6">
                  <li>Upgrades take effect immediately; you'll be charged a pro-rated amount for the remainder of your billing period; your next renewal will be at the new subscription price.</li>
                  <li>Downgrades take effect at the end of your current billing period; you continue with current features until then; no refund for the difference between plans.</li>
                </ul>

                <p className="text-white/80 mb-2">
                  <strong>10.10 Failed Payments.</strong>
                </p>
                <ul className="text-white/80 mb-2 list-disc list-inside space-y-2 ml-6">
                  <li>We'll attempt to collect payment for up to 7 days; Apple/Google will retry charging your payment method; you'll receive notifications; your account may be downgraded or suspended if payment cannot be processed.</li>
                </ul>
                <ul className="text-white/80 mb-6 list-disc list-inside space-y-2 ml-6">
                  <li>To resolve failed payments: update your payment method in the App Store or Google Play, ensure sufficient funds, and contact Apple/Google support if the issue persists.</li>
                </ul>

                <p className="text-white/80 mb-6">
                  <strong>10.11 Subscription Modifications by Us.</strong> We may modify subscription features with 30 days' notice, add new subscription tiers at any time, discontinue subscription tiers with 60 days' notice, and remove features from free tiers without notice. If we materially reduce features in your paid subscription tier, you may cancel and receive a pro-rated refund for unused time.
                </p>

                <h3 className="text-xl font-bold text-white mb-4">11. Termination</h3>
                <p className="text-white/80 mb-4">
                  <strong>11.1.</strong> You may cancel your Membership at any time by notifying us via email at support@xscard.co.za or via the Platform. Your cancellation will take effect at the end of your Membership term.
                </p>
                <p className="text-white/80 mb-4">
                  <strong>11.2.</strong> Subscriptions purchased via the Apple App Store can only be cancelled through your Apple ID account settings. Subscriptions purchased via the Google Play Store can only be cancelled through your Google Play account settings.
                </p>
                <p className="text-white/80 mb-4">
                  <strong>11.3.</strong> A Membership will terminate immediately upon written notice if:
                </p>
                <ul className="text-white/80 mb-6 list-disc list-inside space-y-2 ml-6">
                  <li>there is a breach of a material term of these Terms and that breach has not been remedied within 10 Business Days;</li>
                  <li>the Defaulting Party is unable to pay its debts as they fall due;</li>
                  <li>we need to correct a system issue, e.g., account duplication;</li>
                  <li>you are found to be misusing the Platform.</li>
                </ul>

                <h3 className="text-xl font-bold text-white mb-4">12. Notice Regarding Apple</h3>
                <p className="text-white/80 mb-4">
                  <strong>12.1.</strong> For iOS users, you acknowledge that these Terms are between you and us only, not with Apple Inc. (Apple), and Apple is not responsible for the Platform and any content available on the Platform.
                </p>
                <p className="text-white/80 mb-4">
                  <strong>12.2.</strong> Apple has no obligation to furnish you with any maintenance and support services with respect to our Platform if provided via the App Store.
                </p>
                <p className="text-white/80 mb-6">
                  <strong>12.3.</strong> Apple will have no warranty obligation whatsoever with respect to the mobile application, except for refunding the purchase price in case of application failure.
                </p>

                <h3 className="text-xl font-bold text-white mb-4">13. Governing Law</h3>
                <p className="text-white/80 mb-4">
                  <strong>13.1.</strong> These Terms are governed by the laws of the Republic of South Africa.
                </p>
                <p className="text-white/80 mb-6">
                  <strong>13.2.</strong> Each Party irrevocably submits to the exclusive jurisdiction of the courts of South Africa.
                </p>

                <h3 className="text-xl font-bold text-white mb-4">14. Privacy</h3>
                <p className="text-white/80 mb-4">
                  <strong>14.1.</strong> We are committed to protecting your privacy. Our collection and use of personal data are governed by the Protection of Personal Information Act, 2013 (POPIA).
                </p>
                <p className="text-white/80 mb-6">
                  <strong>14.2.</strong> For more information on how we collect, use, and protect your personal information, please refer to our Privacy Policy available on our website.
                </p>

                <h3 className="text-xl font-bold text-white mb-4">15. Changes to Terms</h3>
                <p className="text-white/80 mb-4">
                  <strong>15.1.</strong> We may, at our discretion, amend these Terms from time to time.
                </p>
                <p className="text-white/80 mb-4">
                  <strong>15.2.</strong> Any changes will be effective upon posting the updated Terms on our Platform.
                </p>
                <p className="text-white/80 mb-6">
                  <strong>15.3.</strong> Your continued use of the Platform after such changes constitutes your acceptance of the new Terms.
                </p>

                <h3 className="text-xl font-bold text-white mb-4">16. Notices</h3>
                <p className="text-white/80 mb-4">
                  <strong>16.1.</strong> Any notice given under these Terms must be in writing and addressed to the relevant Party at their registered address or principal place of business.
                </p>
                <p className="text-white/80 mb-4">
                  <strong>16.2.</strong> Notices may be sent by hand, registered post, or email, and will be deemed to have been received:
                </p>
                <ul className="text-white/80 mb-4 list-disc list-inside space-y-2 ml-6">
                  <li>if delivered by hand, on the date of delivery;</li>
                  <li>if sent by registered post, within 5 Business Days of posting;</li>
                  <li>if sent by email, at the time of transmission, provided no delivery failure notification is received.</li>
                </ul>

                <h3 className="text-xl font-bold text-white mb-4">17. Severability</h3>
                <p className="text-white/80 mb-4">
                  <strong>17.1.</strong> If any provision of these Terms is found to be invalid, illegal, or unenforceable, that provision will be deemed modified to the extent necessary to make it enforceable.
                </p>
                <p className="text-white/80 mb-6">
                  <strong>17.2.</strong> If such modification is not possible, the provision will be severed from these Terms, and the remaining provisions will continue in full force and effect.
                </p>

                <h3 className="text-xl font-bold text-white mb-4">18. Entire Agreement</h3>
                <p className="text-white/80 mb-6">
                  <strong>18.1.</strong> These Terms constitute the entire agreement between the Parties regarding the subject matter and supersede all prior agreements, understandings, and communications, whether written or oral.
                </p>

                <h3 className="text-xl font-bold text-white mb-4">Contacting us</h3>
                <p className="text-white/80 mb-4">
                  If you would like to contact us to understand more about these Terms or wish to contact us concerning any matter relating to our Platform and your use of it, you may send an email to support@xscard.co.za
                </p>
                <p className="text-white/60 text-sm">
                  These terms were last updated on February 21, 2025.
                </p>
              </div>
            </CardContent>
          </Card>
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
              <div>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-white mb-2">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 text-gray-900 placeholder-gray-500"
                      placeholder="Enter your full name"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 text-gray-900 placeholder-gray-500"
                      placeholder="Enter your email address"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div>
                    <label htmlFor="company" className="block text-sm font-medium text-white mb-2">
                      Company (Optional)
                    </label>
                    <input
                      type="text"
                      id="company"
                      name="company"
                      value={formData.company}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 text-gray-900 placeholder-gray-500"
                      placeholder="Enter your company name"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-white mb-2">
                      Message *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      required
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
              <p>&copy; 2024 XS Card. All rights reserved.</p>
              <p className="mt-2">
                Developed by{" "}
                <a 
                  href="https://xspark.co.za/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-purple-400 hover:text-purple-300 transition-colors underline"
                >
                  X Spark Ltd 
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
