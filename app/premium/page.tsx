"use client"

import React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  Check,
  Crown,
  Zap,
  Shield,
  Clock,
  Star,
  CreditCard,
  Users,
  BarChart3,
  Headphones,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { useAuth } from "../contexts/auth-context"

// PayPal integration removed

export default function PremiumPage() {
  const { user, userData, refreshUserData } = useAuth()
  const router = useRouter()
  const [selectedPlan, setSelectedPlan] = useState<"premium" | "enterprise" | null>(null)
  const [showInfoModal, setShowInfoModal] = useState(false)

  useEffect(() => {
    // Temporarily disable auth redirect to debug
    // if (!user) {
    //   router.push("/login")
    //   return
    // }
  }, [user, router])

  // Payment functionality removed

  // All payment processing removed

  const handleSelectPlan = (plan: "premium" | "enterprise") => {
    setSelectedPlan(plan)
    setShowInfoModal(true)
  }

  const handleCloseModal = () => {
    setShowInfoModal(false)
    setSelectedPlan(null)
  }

  const premiumFeatures = [
    {
      icon: Zap,
      title: "Unlimited Assignment Planners",
      description: "Create as many planners as you need without any limits",
      free: "3 planners",
      premium: "Unlimited",
      enterprise: "Unlimited",
    },
    {
      icon: Crown,
      title: "Priority AI Processing",
      description: "Get faster AI responses with priority queue access",
      free: "Standard speed",
      premium: "2x faster",
      enterprise: "3x faster",
    },
    {
      icon: Shield,
      title: "Advanced Export Options",
      description: "Export to multiple formats including Word, Excel, and custom templates",
      free: "PDF only",
      premium: "All formats",
      enterprise: "All formats + Custom",
    },
    {
      icon: Clock,
      title: "Email Reminders & Notifications",
      description: "Get automatic email notifications for upcoming deadlines",
      free: "Browser only",
      premium: "Email + Browser",
      enterprise: "Multi-channel alerts",
    },
    {
      icon: Star,
      title: "Customer Support",
      description: "Get priority customer support with faster response times",
      free: "Community support",
      premium: "Priority support",
      enterprise: "Dedicated support",
    },
    {
      icon: BarChart3,
      title: "Advanced Analytics",
      description: "Detailed insights into your productivity and assignment patterns",
      free: "Basic stats",
      premium: "Advanced analytics",
      enterprise: "Custom dashboards",
    },
  ]

  const enterpriseOnlyFeatures = [
    {
      icon: Users,
      title: "Team Collaboration",
      description: "Share planners with team members and collaborate in real-time",
    },
    {
      icon: Shield,
      title: "Admin Dashboard",
      description: "Manage team members, permissions, and organization settings",
    },
    {
      icon: CreditCard,
      title: "Custom Integrations",
      description: "Connect with your existing tools and workflows via API",
    },
    {
      icon: Headphones,
      title: "Dedicated Account Manager",
      description: "Personal support representative for your organization",
    },
  ]

  // Plan Info Modal Component (Payment Disabled)
  const PlanInfoModal = () => {
    if (!selectedPlan) return null

    const planDetails = {
      premium: {
        name: "Premium Plan",
        price: "$9.99",
        period: "/month",
        color: "from-purple-600 to-blue-600",
        features: [
          "Unlimited assignment planners",
          "Priority AI processing (2x faster)",
          "All export formats",
          "Email & browser notifications",
          "Priority customer support",
          "Advanced analytics dashboard",
        ],
      },
      enterprise: {
        name: "Enterprise Plan",
        price: "$29.99",
        period: "/month",
        color: "from-blue-600 to-indigo-600",
        features: [
          "Everything in Premium",
          "Team collaboration tools",
          "Admin dashboard",
          "Custom API integrations",
          "Dedicated account manager",
          "Custom reporting & dashboards",
          "Priority phone support",
        ],
      },
    }

    const plan = planDetails[selectedPlan]

    return (
      <Dialog open={showInfoModal} onOpenChange={handleCloseModal}>
        <DialogContent className="max-w-2xl p-0 overflow-hidden">
          {/* Header with gradient */}
          <div className={`bg-gradient-to-r ${plan.color} p-6 text-white`}>
            <DialogHeader>
              <div className="flex items-center justify-between">
                <DialogTitle className="text-2xl font-bold text-white">
                  {plan.name} Features
                </DialogTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCloseModal}
                  className="text-white hover:bg-white/20"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <DialogDescription className="text-white/90 mt-2">
                Coming soon • Contact us for early access
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="p-6">
            {/* Selected Plan Details */}
            <Card className="mb-6 border-2 border-purple-200 dark:border-purple-800">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold flex items-center gap-2">
                      {plan.name}
                      <Badge className={`bg-gradient-to-r ${plan.color} text-white`}>
                        {selectedPlan === "enterprise" ? "Best for Teams" : "Most Popular"}
                      </Badge>
                    </h3>
                    <div className="mt-2">
                      <span className="text-3xl font-bold">{plan.price}</span>
                      <span className="text-gray-600 dark:text-gray-400 ml-1">{plan.period}</span>
                    </div>
                  </div>
                  <Crown className={`h-8 w-8 text-${selectedPlan === "premium" ? "purple" : "blue"}-500`} />
                </div>

                {/* Features List */}
                <div className="space-y-2 mb-4">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Money-back guarantee */}
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                  <p className="text-sm text-green-700 dark:text-green-300 font-medium">
                    ✓ 30-day money-back guarantee
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Contact Section */}
            <div className="space-y-4">
              {/* Coming Soon Message */}
              <div className="text-center p-8 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-800 dark:to-gray-700 rounded-lg border border-purple-200 dark:border-purple-800 w-full">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Crown className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Coming Soon!</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  We're preparing an amazing premium experience for you.
                </p>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    <strong>Want early access?</strong>
                  </p>
                  <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">
                    📧 support@assignmentplanner.ai
                  </p>
                </div>
              </div>
            </div>

            {/* Info */}
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                Premium features will be available soon. Contact us for updates and early access opportunities.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  // Debug - show loading or user state
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading user data...</p>
          <p className="text-sm text-gray-500 mt-2">Auth loading: {String(loading)}</p>
          <p className="text-sm text-gray-500">User: {user ? 'Logged in' : 'Not logged in'}</p>
        </div>
      </div>
    )
  }

  // Debug - show when userData is missing
  if (!userData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading user profile...</p>
          <p className="text-sm text-gray-500 mt-2">User: {user?.email || 'No user'}</p>
          <p className="text-sm text-gray-500">UserData: {userData ? 'Loaded' : 'Missing'}</p>
          <Button 
            onClick={() => window.location.reload()} 
            className="mt-4"
            variant="outline"
          >
            Refresh Page
          </Button>
        </div>
      </div>
    )
  }

  if (userData.isPremium || userData.isEnterprise) {
    const currentPlan = userData.isEnterprise ? "Enterprise" : "Premium"
    const currentIcon = userData.isEnterprise ? Users : Crown

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="flex items-center gap-4 mb-8">
            <Button variant="outline" onClick={() => router.push("/dashboard")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>

          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              {React.createElement(currentIcon, { className: "h-10 w-10 text-white" })}
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">You're {currentPlan}!</h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Enjoy all the {currentPlan.toLowerCase()} features and unlimited access
            </p>
            {userData.premiumExpiresAt && (
              <Badge variant="secondary" className="mt-4">
                {currentPlan} until {new Date(userData.premiumExpiresAt).toLocaleDateString()}
              </Badge>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {premiumFeatures.map((feature, index) => {
              const Icon = feature.icon
              const currentFeature = userData.isEnterprise ? feature.enterprise : feature.premium
              return (
                <Card key={index} className="border-purple-200 dark:border-purple-800">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">{feature.description}</p>
                        <div className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-green-500" />
                          <span className="text-sm font-medium text-green-600 dark:text-green-400">
                            {currentFeature}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}

            {userData.isEnterprise &&
              enterpriseOnlyFeatures.map((feature, index) => {
                const Icon = feature.icon
                return (
                  <Card key={`enterprise-${index}`} className="border-blue-200 dark:border-blue-800">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Icon className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">{feature.description}</p>
                          <div className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-blue-500" />
                            <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                              Enterprise Feature
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" onClick={() => router.push("/dashboard")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>

        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Crown className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-4">
            Choose Your
            <span className="block bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Plan
            </span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Unlock unlimited planners, priority AI processing, and advanced features to supercharge your productivity
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Free Plan */}
          <Card className="border-gray-200 dark:border-gray-700">
            <CardHeader className="text-center pb-8">
              <CardTitle className="text-2xl text-gray-900 dark:text-white">Free</CardTitle>
              <div className="text-4xl font-bold text-gray-900 dark:text-white">$0</div>
              <p className="text-gray-600 dark:text-gray-300">Perfect for getting started</p>
            </CardHeader>
            <CardContent className="space-y-4">
              {premiumFeatures.map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                    <Check className="h-3 w-3 text-gray-500" />
                  </div>
                  <div>
                    <span className="text-sm text-gray-600 dark:text-gray-300">{feature.title}</span>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{feature.free}</div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Premium Plan */}
          <Card className="border-purple-500 relative scale-105 shadow-2xl">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <Badge className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2">Most Popular</Badge>
            </div>
            <CardHeader className="text-center pb-8">
              <CardTitle className="text-2xl text-gray-900 dark:text-white">Premium</CardTitle>
              <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                $9.99
              </div>
              <p className="text-gray-600 dark:text-gray-300">per month</p>
            </CardHeader>
            <CardContent className="space-y-4">
              {premiumFeatures.map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{feature.title}</span>
                    <div className="text-xs text-purple-600 dark:text-purple-400 font-medium">{feature.premium}</div>
                  </div>
                </div>
              ))}

              <div className="pt-6">
                <Button
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  onClick={() => handleSelectPlan("premium")}
                >
                  View Premium Features
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Enterprise Plan */}
          <Card className="border-blue-500 relative">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <Badge className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2">For Teams</Badge>
            </div>
            <CardHeader className="text-center pb-8">
              <CardTitle className="text-2xl text-gray-900 dark:text-white">Enterprise</CardTitle>
              <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                $29.99
              </div>
              <p className="text-gray-600 dark:text-gray-300">per month</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Everything in Premium, plus:
                </div>
                {enterpriseOnlyFeatures.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center">
                      <Check className="h-3 w-3 text-white" />
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{feature.title}</span>
                      <div className="text-xs text-blue-600 dark:text-blue-400">{feature.description}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-6">
                <Button
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  onClick={() => handleSelectPlan("enterprise")}
                >
                  View Enterprise Features
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <div className="bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              🚀 Premium Features Coming Soon!
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              We're working hard to bring you an amazing premium experience with advanced features and capabilities.
            </p>
            <div className="flex items-center justify-center gap-6 text-sm text-gray-600 dark:text-gray-400">
              <span>📧 Early Access Available</span>
              <span>📞 Contact Support</span>
              <span>🔔 Get Notified</span>
            </div>
          </div>
        </div>
      </div>

      {/* Plan Info Modal */}
      <PlanInfoModal />
    </div>
  )
}