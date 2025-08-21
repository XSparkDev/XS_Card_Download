"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  MessageCircle, 
  HelpCircle, 
  FileText, 
  Download, 
  Globe, 
  Clock,
  CheckCircle,
  AlertCircle,
  Info,
  RefreshCw,
  User
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { HelpfulFeedback } from "@/components/ui/helpful-feedback"
import { submitContactForm, handleApiError, submitQueryWithoutCaptcha } from "@/utils/api"
import { HCaptchaComponent } from "@/components/ui/hcaptcha"

export default function SupportPage() {
  const [activeTab, setActiveTab] = useState("faq")
  const [expandedFaqs, setExpandedFaqs] = useState<Set<number>>(new Set())
  
  // Contact form state - use useEffect to prevent hydration issues
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

  // Prevent hydration issues
  React.useEffect(() => {
    setIsClient(true)
  }, [])

  const toggleFaq = (index: number) => {
    const newExpanded = new Set(expandedFaqs)
    if (newExpanded.has(index)) {
      newExpanded.delete(index)
    } else {
      newExpanded.add(index)
    }
    setExpandedFaqs(newExpanded)
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

      // Try the main API first
      let response
      try {
        response = await submitContactForm(contactFormData)
      } catch (apiError) {
        console.log("Main API failed, trying bypass...")
        // If main API fails, try the bypass (for development/testing)
        const bypassData = {
          name: formData.name,
          email: formData.email,
          message: `Contact Form Inquiry from ${formData.name}\n\nContact Information:\n- Name: ${formData.name}\n- Email: ${formData.email}${formData.company ? `\n- Company: ${formData.company}` : ''}\n\nMessage:\n${formData.message}`,
          to: "xscard@xspark.co.za",
          type: "contact"
        }
        response = await submitQueryWithoutCaptcha(bypassData)
      }
      
      if (response.success) {
        setSubmitStatus("success")
        // Reset form after successful submission
        setTimeout(() => {
          setFormData({ name: "", email: "", company: "", message: "" })
          setShowContactModal(false)
          setSubmitStatus("idle")
          setIsCaptchaVerified(false)
          setCaptchaToken(null)
        }, 2000)
      } else {
        throw new Error(response.message || "Submission failed")
      }
    } catch (error) {
      console.error("Contact form submission error:", error)
      const errorMessage = handleApiError(error)
      console.error("Error details:", errorMessage)
      setSubmitStatus("error")
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

  const faqData = [
    {
      question: "How do I verify my XS Card account?",
      summary: "Email verification happens automatically during signup. Check your email for a verification link.",
      answer: "Follow these steps to verify your XS Card account:\n\n1. **Sign up for XS Card**: Download the app and create your account with your email address\n2. **Check your email**: Look for a verification email from XS Card (check your spam folder if you don't see it)\n3. **Click the verification link**: Open the email and click the verification link to confirm your account\n4. **Return to the app**: Your account will now be verified and ready to use\n\n**Note**: If you don't receive the verification email, you can request a new one by visiting our [verification resend page](mailto:support@xscard.co.za?subject=Verification%20Email%20Resend) or contacting support directly.",
      helpfulCount: 127
    },
    {
      question: "How do I create additional digital business cards?",
      summary: "Create additional cards for different purposes using the add card feature (Premium feature).",
      answer: "**Important Note**: Your first digital business card is automatically created during signup on the \"Complete Your Profile\" page. These steps are for creating additional cards for different purposes.\n\n**Step 1: Access the Add Card Feature**\n• Open the XS Card app\n• Navigate to the Cards tab (bottom navigation)\n• Look for the \"+\" (plus) button in the top-right corner of the header\n• **Note**: The add button is only available for Premium users\n\n**Step 2: Fill in Your Personal Details**\nYou'll need to provide the following required information:\n• First Name (optional but recommended)\n• Last Name (optional but recommended)\n• Occupation * (required)\n• Company Name * (required)\n• Email Address * (required)\n• Phone Number * (required)\n\n**Step 3: Add Professional Images (Optional but Recommended)**\nEnhance your digital card with:\n• **Profile Picture**: Tap the profile picture placeholder to add your photo\n  - Choose between Camera or Gallery\n  - Grant camera and photo library permissions when prompted\n• **Company Logo**: Tap the company logo placeholder to add your company logo\n  - Same options: Camera or Gallery\n  - Helps create a professional appearance\n\n**Step 4: Review and Save**\n• Double-check all your information\n• Tap the \"Save\" button in the top-right corner\n• Your additional card will be created and saved to your account\n\n**Step 5: Your Additional Card is Ready!**\n• Your new digital business card will appear in the Cards tab\n• You can now share it via QR code\n• Add it to your digital wallet for easy access\n• Edit it anytime by tapping the edit icon\n\n**Pro Tips:**\n• Use high-quality images for the best professional appearance\n• Include your company logo to enhance brand recognition\n• Keep your contact information up-to-date\n• Create different cards for different purposes (work, personal, side business, etc.)\n• Premium users can create multiple cards for different purposes\n\n**Troubleshooting:**\n• Can't see the add button? You may need to upgrade to Premium\n• Permission issues? Go to Settings > XS Card and enable Camera and Photos permissions\n• Upload problems? Check your internet connection and try again\n\n**What's Next?**\nAfter creating your additional card, you can:\n• Share your QR code with new contacts\n• Add to digital wallet for quick access\n• Edit your card anytime\n• View analytics to see how many times your card has been scanned\n• Switch between different cards for different contexts",
      helpfulCount: 89
    },
    {
      question: "Can I share my digital card without the app?",
      summary: "Yes! Share your card via QR code, web link, digital wallet, social media, or direct contact actions - no app required for recipients.",
      answer: "Yes! You can share your digital business card with others even if they don't have the XS Card app installed. Here are all the ways you can share your card without requiring the recipient to download the app:\n\n**Primary Sharing Methods (No App Required):**\n\n**1. QR Code Sharing**\n• Your digital card displays a unique QR code\n• Anyone can scan it with their phone's camera\n• Opens a web page where they can save your contact information\n• Works on any smartphone with a camera\n\n**2. Web Page Link**\n• Direct URL to your contact save page\n• Can be shared via text message, email, or social media\n• Recipients can open the link in any web browser\n• Automatically downloads your contact information as a vCard file\n\n**3. Digital Wallet Pass**\n• Add your card to Apple Wallet (iOS) or Google Wallet (Android)\n• Share the wallet pass like a physical business card\n• Recipients can save it to their own wallet without the app\n• Includes your photo, company logo, and contact details\n\n**4. Social Media Sharing**\n• **Social Media**: Share a direct link to your contact save page on any platform\n• **Email**: Send your contact information directly via email\n\n**5. Direct Contact Actions**\n• **Phone**: Recipients can tap to call your number directly\n• **Email**: Recipients can tap to open their email app with your email pre-filled\n\n**What Recipients Experience:**\n• They can save your contact information to their phone\n• Download your contact details as a vCard file\n• View your professional profile with photo and company logo\n• Get a link to download the XS Card app (optional)\n\n**Benefits of App-Free Sharing:**\n• **Universal compatibility** - works on any device\n• **No barriers** - recipients don't need to install anything\n• **Professional appearance** - branded web page with your information\n• **Easy contact saving** - one-tap save to phone contacts\n\n**What Requires the App:**\n• Real-time card editing while sharing\n• Analytics tracking of shares and scans\n• Advanced sharing features within the app",
      helpfulCount: 156
    },
    {
      question: "What information can I include on my digital card?",
      summary: "Comprehensive professional information including contact details, visual elements, social media links, and customization options.",
      answer: "Your XS Card digital business card can include comprehensive professional information to help you make lasting connections. Here's everything you can add to create a complete digital profile:\n\n**Required Information (Must Include):**\n• First Name (optional but recommended)\n• Last Name (optional but recommended)\n• Occupation/Job Title (required)\n• Company Name (required)\n• Email Address (required)\n• Phone Number (required)\n\n**Visual Elements:**\n• **Profile Picture**: Add your professional photo\n  - Upload from camera or photo gallery\n  - Displays prominently on your card\n  - Creates a personal connection\n• **Company Logo**: Include your company branding\n  - Upload from camera or photo gallery\n  - Displays as background on your card\n  - Enhances professional appearance\n\n**Social Media Links (Optional):**\n• Various social media platforms\n• Your personal or company website URL\n• Direct links to your professional profiles\n\n**Customization Options:**\n• **Card Color Scheme**: Choose from multiple professional color options\n  - Customize the visual theme of your card\n  - Match your brand colors\n• **Logo Zoom Level**: Adjust the size of your company logo\n  - Fine-tune the appearance of your branding\n  - Ensure optimal visual balance\n\n**Professional Features:**\n• **QR Code**: Automatically generated for easy sharing\n• **Digital Wallet Pass**: Add to Apple Wallet or Google Wallet\n• **Contact Actions**: One-tap calling and email\n• **Social Media Integration**: Direct links to your profiles\n\n**What Recipients See:**\n• Your complete professional profile\n• High-quality profile picture and company logo\n• All contact information in one place\n• Direct access to your social media profiles\n• Professional color scheme and branding\n\n**Tips for Creating an Effective Card:**\n• Use a professional profile photo for better first impressions\n• Include your company logo to enhance brand recognition\n• Add relevant social media links to expand your network\n• Choose a color scheme that matches your brand\n• Keep information up-to-date for professional credibility\n\n**Premium Features:**\n• Multiple cards for different purposes (Premium users)\n• Advanced analytics to track card views and scans\n• Enhanced customization options",
      helpfulCount: 203
    },
    {
      question: "Is my contact information secure?",
      summary: "Yes, your data is protected by enterprise-grade encryption, authentication, privacy controls, and full POPIA compliance.",
      answer: "Yes, your contact information is protected by multiple layers of security measures. At XS Card, we prioritize the privacy and security of your personal data with enterprise-grade protection and strict privacy controls.\n\n**Security Measures:**\n\n**1. Enterprise-Grade Encryption**\n• **Data Encryption**: All your contact information is encrypted using enterprise-grade encryption\n• **Secure Storage**: Data is stored in secure, controlled environments protected from unauthorized access\n• **Firebase Security**: Built on Google's Firebase platform with industry-standard security protocols\n\n**2. Authentication & Authorization**\n• **Firebase Authentication**: Secure user authentication with Firebase ID tokens\n• **Token Validation**: Real-time token validation and automatic refresh\n• **Authorization Checks**: Strict access controls ensure only authorized users can access your data\n• **Token Blacklisting**: Revoked tokens are immediately blacklisted for security\n\n**3. Privacy Protection**\n• **Your Data, Your Control**: We don't sell or provide your data to third parties without your consent\n• **POPIA Compliance**: Full compliance with South African Protection of Personal Information Act\n• **Data Ownership**: Your contact information belongs to you and is yours to share with your network\n• **Consent-Based Sharing**: You control who gets access to your information\n\n**4. Secure Sharing Features**\n• **Unique QR Codes**: Each card has a unique, secure QR code for controlled sharing\n• **Time-Limited Access**: QR codes expire after 24 hours for enhanced security\n• **Verification Tokens**: SHA-256 hashed verification tokens prevent unauthorized access\n• **Web Page Security**: Secure HTTPS connections for all data transmission\n\n**5. Technical Security**\n• **Security Headers**: Comprehensive security headers including HSTS and CSP\n• **Content Security Policy**: Protects against cross-site scripting and other attacks\n• **HTTPS Encryption**: All data transmission is encrypted using SSL/TLS\n• **Input Validation**: Robust validation prevents malicious data injection\n\n**6. Data Protection Rights**\nUnder POPIA, you have the right to:\n• **Access your data**: Request access to your personal information\n• **Correct your data**: Request correction of inaccurate information\n• **Delete your data**: Request deletion of your personal information\n• **Object to processing**: Object to how your data is processed\n• **Lodge complaints**: File complaints with the Information Regulator\n\n**7. Safe Sharing Practices**\n• **Controlled Distribution**: You choose who receives your contact information\n• **Unique Web Addresses**: Each card has a unique, secure web address\n• **Professional Appearance**: Your information is presented professionally and securely\n• **No Unauthorized Access**: Only those you share with can view your details\n\n**8. Security Monitoring**\n• **Real-time Monitoring**: Continuous security monitoring and threat detection\n• **Data Breach Response**: Immediate response protocols in case of security incidents\n• **Regular Audits**: Regular security audits and vulnerability assessments\n• **Compliance Updates**: Ongoing updates to maintain security standards\n\n**What This Means for You:**\n• **Complete Control**: You decide who sees your contact information\n• **Professional Security**: Enterprise-grade protection for your data\n• **Legal Compliance**: Full compliance with South African privacy laws\n• **Transparent Practices**: Clear privacy policies and data handling procedures",
      helpfulCount: 178
    },
    {
      question: "Can I update my card information?",
      summary: "Yes! Easily update all card information anytime with real-time changes and comprehensive editing features.",
      answer: "Yes! You can easily update your digital business card information anytime. XS Card provides a comprehensive editing system that allows you to modify all aspects of your card to keep your information current and professional.\n\n**How to Access the Edit Feature:**\n\n**1. Navigate to Your Cards**\n• Open the XS Card app\n• Go to the Cards tab (bottom navigation)\n• View your digital business card\n\n**2. Access the Edit Button**\n• Look for the edit icon (pencil icon) in the top-right corner of the header\n• Tap the edit icon to open the editing screen\n\n**What You Can Update:**\n\n**Personal Information:**\n• First Name and Last Name\n• Occupation/Job Title\n• Company Name\n• Email Address\n• Phone Number\n\n**Visual Elements:**\n• **Profile Picture**: Update your professional photo\n  - Choose from camera or photo gallery\n  - Automatic upload to secure storage\n• **Company Logo**: Change your company branding\n  - Upload new logo from camera or gallery\n  - Adjust logo zoom level for perfect fit\n\n**Social Media Links:**\n• Various social media platforms\n• Your personal or company website\n• Direct links to your professional profiles\n\n**Card Customization:**\n• **Color Scheme**: Choose from multiple professional color options\n  - Customize the visual theme of your card\n  - Match your brand colors\n• **Logo Zoom Level**: Adjust the size of your company logo\n  - Fine-tune the visual appearance\n  - Ensure optimal branding display\n\n**Editing Process:**\n\n**1. Make Your Changes**\n• Update any field you want to change\n• Add or remove social media links\n• Change your profile picture or company logo\n• Select a new color scheme\n\n**2. Preview Your Changes**\n• Use the Preview button to see how your card will look\n• Review all changes before saving\n\n**3. Save Your Updates**\n• Tap the Save button to apply your changes\n• Your card will be updated immediately\n• Changes are reflected in real-time\n\n**Advanced Features:**\n\n**Multiple Cards (Premium Users):**\n• Edit any of your multiple cards\n• Each card can have different information\n• Perfect for different professional roles or companies\n\n**Image Management:**\n• **Profile Pictures**: High-quality image upload with automatic optimization\n• **Company Logos**: Professional logo display with zoom controls\n• **Permission Handling**: Automatic camera and photo library permission requests\n\n**Real-Time Updates:**\n• Changes are saved immediately\n• QR codes update automatically\n• Web page links reflect new information instantly\n\n**Tips for Effective Updates:**\n• Keep information current: Update contact details regularly\n• Use high-quality images: Professional photos and logos make better impressions\n• Choose appropriate colors: Select colors that match your brand\n• Review before saving: Use the preview feature to ensure everything looks perfect\n• Update social media: Keep your social media links current and active\n\n**What Happens After Updating:**\n• **Immediate reflection**: Changes appear on your card instantly\n• **QR code updates**: Your QR code automatically reflects new information\n• **Web page updates**: Your contact save page shows updated information\n• **Wallet pass updates**: Digital wallet passes can be refreshed with new information\n\n**Troubleshooting:**\n• Can't see edit button? Make sure you're on the Cards tab\n• Image upload issues? Check camera and photo library permissions\n• Save not working? Ensure all required fields are filled\n• Changes not appearing? Try refreshing the app or restarting",
      helpfulCount: 142
    },
    {
      question: "What devices are supported?",
      summary: "iOS and Android devices, web browsers, and tablets with full cross-platform compatibility and seamless synchronization.",
      answer: "XS Card is designed to work seamlessly across multiple platforms and devices, ensuring you can access your digital business cards wherever you are. Our app is built using React Native and Expo technology for maximum compatibility.\n\n**Supported Platforms:**\n\n**1. Mobile Devices**\n• **iOS Devices**: iPhone and iPad (iOS 12.0 and later)\n  - iPhone models (iPhone 6s and newer)\n  - iPad models (iPad Air 2 and newer)\n  - iPad Pro models\n  - iPod Touch (7th generation and newer)\n• **Android Devices**: Android phones and tablets (Android 6.0/API level 23 and later)\n  - Samsung Galaxy series\n  - Google Pixel series\n  - OnePlus devices\n  - Other Android devices with camera and internet connectivity\n\n**2. Web Browser Support**\n• **Desktop Browsers**: Chrome, Firefox, Safari, Edge (latest versions)\n• **Mobile Browsers**: Safari (iOS), Chrome (Android), Firefox Mobile\n• **Progressive Web App (PWA)**: Can be installed on desktop and mobile browsers\n\n**3. Tablet Support**\n• **iPad**: Full tablet-optimized experience with larger interface elements\n• **Android Tablets**: Responsive design that adapts to larger screens\n• **Landscape and Portrait**: Supports both orientations for optimal viewing\n\n**System Requirements:**\n\n**iOS Requirements:**\n• iOS 12.0 or later\n• Camera access for QR code scanning and photo capture\n• Internet connection for real-time features\n• Storage space: Minimum 50MB for app installation\n\n**Android Requirements:**\n• Android 6.0 (API level 23) or later\n• Camera permission for QR code scanning\n• Internet and storage permissions\n• Storage space: Minimum 50MB for app installation\n\n**Web Browser Requirements:**\n• Modern web browser with JavaScript enabled\n• Internet connection\n• Camera access (for QR code scanning on supported browsers)\n\n**Features by Platform:**\n\n**Mobile Apps (iOS/Android):**\n• Full feature access including camera, photo gallery, and native sharing\n• Push notifications for real-time updates\n• Offline capability for viewing saved cards\n• Native device integration (contacts, calendar, wallet)\n\n**Web Browser:**\n• View and manage digital business cards\n• QR code generation and scanning (camera-enabled browsers)\n• Basic sharing functionality\n• Responsive design for all screen sizes\n\n**Installation Options:**\n\n**Mobile Apps:**\n• **iOS**: Available through App Store (when released) or TestFlight for beta testing\n• **Android**: Available through Google Play Store (when released) or direct APK download\n\n**Web Access:**\n• No installation required - access directly through any web browser\n• Can be added to home screen for app-like experience\n\n**Cross-Platform Compatibility:**\n• Seamless data synchronization across all devices\n• Same account works on mobile and web\n• QR codes and sharing links work universally\n• Consistent user experience regardless of platform",
      helpfulCount: 95
    },
    {
      question: "How do I manage my contacts?",
      summary: "The app automatically organizes contacts you've shared cards with for easy searching and filtering.",
      answer: "The app automatically organizes contacts you've shared cards with. You can search, filter, and manage your network from the contacts section.",
      helpfulCount: 134
    },
    {
      question: "Can I export my contacts?",
      summary: "Yes! Export contacts in vCard format with individual and bulk export options, plus premium features for unlimited exports.",
      answer: "Yes! XS Card provides comprehensive contact export functionality that allows you to download your saved contacts in standard vCard (.vcf) format. This makes it easy to backup your contacts or import them into other applications.\n\n**Export Options:**\n\n**1. Individual Contact Export**\n• **How to access**: Tap on any contact in your contacts list to open the contact options\n• **Export format**: Single vCard (.vcf) file\n• **File naming**: Automatically named with the contact's name (e.g., \"John_Smith.vcf\")\n• **Process**: Opens a web browser to download the contact file directly to your device\n\n**2. Bulk Contact Export (Premium Feature)**\n• **Export all contacts**: Download all your saved contacts in a single file\n• **File format**: Multiple vCards combined in one .vcf file\n• **File naming**: \"XS_Card_Contacts_[count][date].vcf\" (e.g., \"XS_Card_Contacts_25_2024-01-15.vcf\")\n• **Convenience**: Perfect for backing up your entire contact database\n\n**Export Process:**\n\n**For Individual Contacts:**\n• Open the XS Card app\n• Navigate to the Contacts tab\n• Tap on any contact to open contact options\n• Select \"Export Contact\" from the options menu\n• Confirm the export action\n• Your device's browser will open and automatically download the .vcf file\n\n**For Bulk Export (Premium):**\n• Access the bulk export feature through the contacts screen\n• Select all contacts you want to export\n• Choose the bulk export option\n• Confirm the export action\n• All selected contacts will be downloaded as a single .vcf file\n\n**Export File Details:**\n\n**vCard Format (.vcf):**\n• **Compatibility**: Works with all major contact applications\n• **Information included**: Name, phone number, email, company, occupation, and \"how we met\" notes\n• **Standards compliant**: Follows vCard 3.0 specification\n• **Cross-platform**: Compatible with iOS, Android, and desktop contact managers\n\n**Information Exported:**\n• **Personal details**: First name, last name\n• **Contact information**: Phone number, email address\n• **Professional info**: Company name, job title/occupation\n• **Context**: \"How we met\" information for relationship context\n• **Timestamps**: When the contact was added to your database\n\n**Compatibility:**\n\n**Supported Applications:**\n• **Mobile**: iOS Contacts, Android Contacts, Google Contacts\n• **Desktop**: Microsoft Outlook, Apple Contacts, Thunderbird\n• **Cloud services**: Google Contacts, iCloud, Microsoft 365\n• **CRM systems**: Most CRM platforms that support vCard import\n\n**File Management:**\n• **Download location**: Your device's default download folder\n• **File size**: Typically very small (1-5KB per contact)\n• **Storage**: No storage limits on exported files\n• **Backup**: Can be saved to cloud storage or external drives\n\n**Premium Features:**\n\n**Free Plan Limitations:**\n• Individual contact export only\n• Limited to 3 contacts total\n\n**Premium Plan Benefits:**\n• Unlimited contact storage\n• Bulk export functionality\n• Export all contacts at once\n• No restrictions on export frequency\n\n**Security and Privacy:**\n• **Data protection**: Exported files contain only the contact information you've saved\n• **No tracking**: Export process doesn't track or store your export activity\n• **Local processing**: Contact data is processed locally on your device\n• **Secure transfer**: Files are downloaded through secure HTTPS connections\n\n**Troubleshooting:**\n\n**Common Issues:**\n• Download not starting: Check your browser's download settings\n• File not opening: Ensure your device has a contact app installed\n• Import errors: Verify the .vcf file is not corrupted and try re-exporting\n\n**Tips for Successful Export:**\n• Ensure you have a stable internet connection\n• Allow browser downloads if prompted\n• Check your device's storage space before bulk exports\n• Use the same contact app for consistent import results",
      helpfulCount: 87
    }
  ]

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

  const resources = [
    {
      icon: FileText,
      title: "User Guide",
      description: "Complete guide to using XS Card",
      link: "#"
    },
    {
      icon: Download,
      title: "Download App",
      description: "Get the latest version",
      link: "#"
    },
    {
      icon: Globe,
      title: "API Documentation",
      description: "For developers and integrations",
      link: "#"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" className="text-white hover:text-white/80">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
              <div className="flex items-center space-x-2">
                <Image 
                  src="/images/xscard-logo.png" 
                  alt="XS Card Logo" 
                  width={80} 
                  height={24} 
                  className="h-6 w-auto" 
                />
                <span className="text-white font-medium">Support</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            How can we help you?
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            Get support, find answers, and learn how to make the most of your XS Card experience.
          </p>
        </div>

        {/* Contact Methods */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {contactMethods.map((method, index) => (
            <Card key={index} className="bg-white/10 backdrop-blur-sm border-white/20">
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
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-white/10 backdrop-blur-sm rounded-lg p-1">
            <button
              onClick={() => setActiveTab("faq")}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === "faq"
                  ? "bg-white text-gray-900"
                  : "text-white/70 hover:text-white"
              }`}
            >
              <HelpCircle className="w-4 h-4 inline mr-2" />
              FAQ
            </button>
            <button
              disabled
              className="flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors text-white/40 cursor-not-allowed opacity-50"
            >
              <FileText className="w-4 h-4 inline mr-2" />
              Resources
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "faq" && (
          <div className="space-y-4">
            {faqData.map((faq, index) => {
              const isExpanded = expandedFaqs.has(index)
              return (
                <Card key={index} className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-colors">
                  <CardHeader 
                    className="cursor-pointer"
                    onClick={() => toggleFaq(index)}
                  >
                    <CardTitle className="text-white text-lg flex items-center justify-between">
                      <div className="flex items-center">
                        <HelpCircle className="w-5 h-5 mr-2 text-purple-400" />
                        {faq.question}
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-white/60 text-sm font-normal">
                          {isExpanded ? "Hide details" : "Show details"}
                        </span>
                        <div className={`w-5 h-5 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                          <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  
                  {/* Summary (always visible) */}
                  <div className="px-6 pb-4">
                    <p className="text-white/60 text-sm italic">{faq.summary}</p>
                  </div>
                  
                  {/* Detailed Answer (expandable) */}
                  <div 
                    className={`overflow-hidden transition-all duration-500 ease-in-out ${
                      isExpanded ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
                    }`}
                  >
                    <div className="px-6 pb-4 max-h-[600px] overflow-y-auto">
                      <div 
                        className="text-white/80 leading-relaxed"
                        dangerouslySetInnerHTML={{
                          __html: faq.answer
                            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                            .replace(/\n/g, '<br>')
                            .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-purple-400 hover:text-purple-300 underline">$1</a>')
                        }}
                      />
                      
                      {/* Helpful Feedback Component */}
                      <HelpfulFeedback 
                        articleId={`faq-${index}`}
                        helpfulCount={faq.helpfulCount || 0}
                      />
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        )}

        {activeTab === "resources" && (
          <div className="grid md:grid-cols-3 gap-6">
            {resources.map((resource, index) => (
              <Card key={index} className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="p-3 bg-purple-500 rounded-lg">
                      <resource.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold">{resource.title}</h3>
                      <p className="text-white/70 text-sm">{resource.description}</p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full border-white/30 text-white hover:bg-white/10"
                    onClick={() => window.open(resource.link, '_blank')}
                  >
                    Access Resource
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}



        {/* Still Need Help */}
        <div className="mt-12 text-center">
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-white mb-4">
                Still need help?
              </h3>
              <p className="text-white/80 mb-6 max-w-md mx-auto">
                Our support team is here to help you get the most out of XS Card.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  className="bg-custom-btn-gradient hover:opacity-90 text-white"
                  onClick={openContactModal}
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Contact Us
                </Button>
                <Button 
                  className="bg-custom-btn-gradient hover:opacity-90 text-white"
                  onClick={() => window.location.href = 'tel:+27872655236'}
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Call Us
                </Button>
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
                      placeholder="your.email@company.com"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div>
                    <label htmlFor="company" className="block text-sm font-medium text-white mb-2">
                      Company Name
                    </label>
                    <input
                      type="text"
                      id="company"
                      name="company"
                      value={formData.company}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 text-gray-900 placeholder-gray-500"
                      placeholder="Your Company Name (Optional)"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-white mb-2">
                      How can we help you?
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
                <a href="#" className="hover:text-white transition-colors">
                  Privacy
                </a>
                <a href="#" className="hover:text-white transition-colors">
                  Terms
                </a>
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
                  X Spark Ltd. Pty
                </a>
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
