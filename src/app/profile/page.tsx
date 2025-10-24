"use client"

import { ProtectedRoute } from "@/components/protected-route"
import { useAuthContext } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { UserCircle, Edit, Save, X } from "lucide-react"
import { useState } from "react"
import { User } from "@/lib/services/user"

export default function ProfilePage() {
  const { user, login } = useAuthContext()
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<User>({
    id: user?.id || "",
    email: user?.email || "",
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    city: user?.city || "",
    state: user?.state || "",
    country: user?.country || "",
  })

  const handleSave = async () => {
    try {
      setLoading(true)
      
      // Make API call to update profile
      const response = await fetch(
        `http://localhost:3001/api/user/profile`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(formData),
        }
      )

      if (!response.ok) {
        throw new Error("Failed to update profile")
      }

      const updatedUser = await response.json()
      
      // Update the auth context with new user data
      const token = localStorage.getItem("token")
      if (token) {
        login(token, updatedUser)
      }
      
      setIsEditing(false)
      alert("Profile updated successfully!")
    } catch (error) {
      console.error("Failed to update profile:", error)
      alert("Failed to update profile. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      id: user?.id || "",
      email: user?.email || "",
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      city: user?.city || "",
      state: user?.state || "",
      country: user?.country || "",
    })
    setIsEditing(false)
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-b from-primary/10 to-white">
        {/* Header */}
        <section className="bg-gradient-to-r from-primary/20 to-primary/10 py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl font-bold mb-2">Your Profile</h1>
            <p className="text-lg text-muted-foreground">
              Manage your personal information
            </p>
          </div>
        </section>

        <div className="container mx-auto px-4 py-8 max-w-3xl">
          <Card className="p-8">
            {/* Profile Picture Section */}
            <div className="flex flex-col items-center mb-8 pb-8 border-b">
              <div className="w-32 h-32 bg-primary/20 rounded-full flex items-center justify-center mb-4">
                <UserCircle className="w-24 h-24 text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-1">
                {user?.firstName} {user?.lastName}
              </h2>
              <p className="text-muted-foreground">{user?.email}</p>
            </div>

            {/* Edit Toggle */}
            <div className="flex justify-end mb-6">
              {!isEditing ? (
                <Button onClick={() => setIsEditing(true)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button onClick={handleSave} disabled={loading}>
                    <Save className="h-4 w-4 mr-2" />
                    {loading ? "Saving..." : "Save Changes"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    disabled={loading}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              )}
            </div>

            {/* Profile Form */}
            <div className="space-y-6">
              {/* Personal Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) =>
                        setFormData({ ...formData, firstName: e.target.value })
                      }
                      disabled={!isEditing}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) =>
                        setFormData({ ...formData, lastName: e.target.value })
                      }
                      disabled={!isEditing}
                      className="mt-2"
                    />
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    disabled
                    className="mt-2 bg-muted"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Email cannot be changed
                  </p>
                </div>
              </div>

              {/* Location */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Location</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) =>
                        setFormData({ ...formData, city: e.target.value })
                      }
                      disabled={!isEditing}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      value={formData.state}
                      onChange={(e) =>
                        setFormData({ ...formData, state: e.target.value })
                      }
                      disabled={!isEditing}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      value={formData.country}
                      onChange={(e) =>
                        setFormData({ ...formData, country: e.target.value })
                      }
                      disabled={!isEditing}
                      className="mt-2"
                    />
                  </div>
                </div>
              </div>

              {/* Account Stats */}
              <div className="pt-6 border-t">
                <h3 className="text-lg font-semibold mb-4">Account Stats</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="p-4 bg-green-50 border-green-200">
                    <p className="text-sm text-muted-foreground mb-1">
                      Member Since
                    </p>
                    <p className="text-xl font-bold">
                      {new Date().getFullYear()}
                    </p>
                  </Card>
                  <Card className="p-4 bg-blue-50 border-blue-200">
                    <p className="text-sm text-muted-foreground mb-1">
                      Meetups Joined
                    </p>
                    <p className="text-xl font-bold">0</p>
                  </Card>
                  <Card className="p-4 bg-purple-50 border-purple-200">
                    <p className="text-sm text-muted-foreground mb-1">
                      Meetups Hosted
                    </p>
                    <p className="text-xl font-bold">0</p>
                  </Card>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  )
}

