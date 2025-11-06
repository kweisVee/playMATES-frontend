"use client"

import { ProtectedRoute } from "@/components/protected-route"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { useState, useEffect } from "react"
import { MeetupService, CreateMeetupData } from "@/lib/services/meetup"
import { useRouter } from "next/navigation"
import { Sport } from "@/lib/services/sport"
import { useSports } from "@/hooks/useSports"

// Icon mapping for sports (fallback when no imageUrl provided)
const SPORT_ICON_MAP: Record<string, string> = {
  tennis: "🎾",
  basketball: "🏀",
  soccer: "⚽",
  football: "🏈",
  volleyball: "🏐",
  badminton: "🏸",
  running: "🏃",
  cycling: "🚴",
  golf: "⛳",
  swimming: "🏊",
  baseball: "⚾",
  tabltennis: "🏓",
  boxing: "🥊",
  yoga: "🧘",
}

const getSportIcon = (sportName: string): string => {
  const key = sportName.toLowerCase().replace(/\s+/g, '')
  return SPORT_ICON_MAP[key] || "🏅" // Default sports medal icon
}

export default function CreateMeetupPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  
  // React Query hook - automatically handles fetching, caching, and loading states!
  const { data: sports = [], isLoading: loadingSports, error: sportsError } = useSports()
  
  const [formData, setFormData] = useState<CreateMeetupData>({
    title: "",
    description: "",
    sport: "",
    sportIcon: "",
    sportColor: "",
    location: "",
    city: "",
    state: "",
    date: "",
    time: "",
    maxParticipants: 4,
    skillLevel: "all",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Show error alert if sports fail to load
  useEffect(() => {
    if (sportsError) {
      alert('Failed to load sports. Please refresh the page.')
    }
  }, [sportsError])

  const handleSportSelect = (sport: Sport) => {
    const icon = sport.imageUrl || getSportIcon(sport.name)
    setFormData({
      ...formData,
      sport: sport.name,
      sportIcon: icon,
      sportColor: "", // You can add color logic later if needed
    })
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) newErrors.title = "Title is required"
    if (!formData.sport) newErrors.sport = "Please select a sport"
    if (!formData.location.trim()) newErrors.location = "Location is required"
    if (!formData.date) newErrors.date = "Date is required"
    if (!formData.time) newErrors.time = "Time is required"
    if (formData.maxParticipants < 2) newErrors.maxParticipants = "Must allow at least 2 participants"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      setLoading(true)
      const response = await MeetupService.createMeetup(formData)
      
      // Show success message and redirect
      alert("Meetup created successfully!")
      router.push(`/meetup/${response.id}`)
    } catch (error) {
      console.error("Failed to create meetup:", error)
      alert("Failed to create meetup. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-b from-primary/10 to-white">
        {/* Header */}
        <section className="bg-gradient-to-r from-primary/20 to-primary/10 py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl font-bold mb-2">Create a Meetup</h1>
            <p className="text-lg text-muted-foreground">
              Host a sports activity and connect with players
            </p>
          </div>
        </section>

        <div className="container mx-auto px-4 py-8 max-w-3xl">
          <form onSubmit={handleSubmit}>
            <Card className="p-8">
              {/* Sport Selection */}
              <div className="mb-6">
                <Label className="text-lg font-semibold mb-3 block">
                  Select Sport *
                </Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {loadingSports ? (
                    <div className="col-span-full text-center py-8 text-muted-foreground">
                      Loading sports...
                    </div>
                  ) : sports.length === 0 ? (
                    <div className="col-span-full text-center py-8 text-muted-foreground">
                      No sports available
                    </div>
                  ) : (
                    sports.map((sport) => {
                      const icon = getSportIcon(sport.name)
                      const isSelected = formData.sport === sport.name
                      return (
                        <button
                          key={sport.id}
                          type="button"
                          onClick={() => handleSportSelect(sport)}
                          className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                            isSelected
                              ? "border-primary bg-primary/10 shadow-[0_4px_20px_hsl(var(--primary)/0.4)] scale-105"
                              : "border-border hover:border-primary/50 hover:bg-primary/5 hover:shadow-sm hover:scale-105"
                          }`}
                        >
                          {sport.imageUrl ? (
                            <img 
                              src={sport.imageUrl} 
                              alt={sport.name}
                              className="w-12 h-12 mx-auto mb-2 object-contain"
                            />
                          ) : (
                            <div className="text-3xl mb-2">{icon}</div>
                          )}
                          <div className={`text-sm font-medium ${isSelected ? "text-primary font-semibold" : ""}`}>
                            {sport.name}
                          </div>
                        </button>
                      )
                    })
                  )}
                </div>
                {errors.sport && (
                  <p className="text-red-500 text-sm mt-2">{errors.sport}</p>
                )}
              </div>

              {/* Title */}
              <div className="mb-6">
                <Label htmlFor="title">Meetup Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Weekend Tennis Match at Central Park"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="mt-2"
                />
                {errors.title && (
                  <p className="text-red-500 text-sm mt-2">{errors.title}</p>
                )}
              </div>

              {/* Description */}
              <div className="mb-6">
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  placeholder="Tell others about your meetup..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full mt-2 p-3 border rounded-md min-h-[100px] bg-background"
                />
              </div>

              {/* Location */}
              <div className="mb-6">
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  placeholder="e.g., Central Park Tennis Courts"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  className="mt-2"
                />
                {errors.location && (
                  <p className="text-red-500 text-sm mt-2">{errors.location}</p>
                )}
              </div>

              {/* City and State */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    placeholder="New York"
                    value={formData.city}
                    onChange={(e) =>
                      setFormData({ ...formData, city: e.target.value })
                    }
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    placeholder="NY"
                    value={formData.state}
                    onChange={(e) =>
                      setFormData({ ...formData, state: e.target.value })
                    }
                    className="mt-2"
                  />
                </div>
              </div>

              {/* Date and Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <Label htmlFor="date">Date *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                    className="mt-2"
                    min={new Date().toISOString().split("T")[0]}
                  />
                  {errors.date && (
                    <p className="text-red-500 text-sm mt-2">{errors.date}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="time">Time *</Label>
                  <Input
                    id="time"
                    type="time"
                    value={formData.time}
                    onChange={(e) =>
                      setFormData({ ...formData, time: e.target.value })
                    }
                    className="mt-2"
                  />
                  {errors.time && (
                    <p className="text-red-500 text-sm mt-2">{errors.time}</p>
                  )}
                </div>
              </div>

              {/* Max Participants */}
              <div className="mb-6">
                <Label htmlFor="maxParticipants">Max Participants *</Label>
                <Input
                  id="maxParticipants"
                  type="number"
                  min="2"
                  max="50"
                  value={formData.maxParticipants}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      maxParticipants: parseInt(e.target.value) || 2,
                    })
                  }
                  className="mt-2"
                />
                {errors.maxParticipants && (
                  <p className="text-red-500 text-sm mt-2">
                    {errors.maxParticipants}
                  </p>
                )}
              </div>

              {/* Skill Level */}
              <div className="mb-8">
                <Label htmlFor="skillLevel">Skill Level *</Label>
                <select
                  id="skillLevel"
                  value={formData.skillLevel}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      skillLevel: e.target.value as CreateMeetupData["skillLevel"],
                    })
                  }
                  className="w-full mt-2 p-2 border rounded-md bg-background"
                >
                  <option value="all">All Levels</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-4">
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={loading}
                >
                  {loading ? "Creating..." : "Create Meetup"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={loading}
                >
                  Cancel
                </Button>
              </div>
            </Card>
          </form>
        </div>
      </div>
    </ProtectedRoute>
  )
}

