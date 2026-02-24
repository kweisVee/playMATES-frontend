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
import { useAuthContext } from "@/contexts/AuthContext"

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
  const { user } = useAuthContext()
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
    maxParticipants: 2,
    skillLevel: "all",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  // Local state for maxParticipants input to allow free typing
  const [maxParticipantsInput, setMaxParticipantsInput] = useState<string>("2")
  const [zipcode, setZipcode] = useState<string>("")
  const [zipcodeLoading, setZipcodeLoading] = useState(false)

  // Show error alert if sports fail to load
  useEffect(() => {
    if (sportsError) {
      alert('Failed to load sports. Please refresh the page.')
    }
  }, [sportsError])

  // Sync maxParticipantsInput with formData.maxParticipants (for external updates)
  useEffect(() => {
    setMaxParticipantsInput(formData.maxParticipants.toString())
  }, [formData.maxParticipants])

  // Prefill city and state from user's profile if available (only once on mount)
  useEffect(() => {
    if (user?.city && !formData.city) {
      setFormData(prev => ({ ...prev, city: user.city || "" }))
    }
    if (user?.state && !formData.state) {
      setFormData(prev => ({ ...prev, state: user.state || "" }))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.city, user?.state])

  // Function to lookup city and state from zipcode
  const lookupZipcode = async (zip: string) => {
    if (!zip || zip.length < 5) return

    // Only lookup US zipcodes (5 digits)
    if (!/^\d{5}$/.test(zip)) return

    try {
      setZipcodeLoading(true)
      const response = await fetch(`https://api.zippopotam.us/us/${zip}`)
      
      if (response.ok) {
        const data = await response.json()
        if (data.places && data.places.length > 0) {
          const place = data.places[0]
          setFormData(prev => ({
            ...prev,
            city: place['place name'] || prev.city,
            state: place['state abbreviation'] || prev.state,
          }))
        }
      }
    } catch (error) {
      console.error("Failed to lookup zipcode:", error)
      // Silently fail - user can still manually enter city/state
    } finally {
      setZipcodeLoading(false)
    }
  }

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
      console.log("formData:", formData)
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
      <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-emerald-50 via-white to-teal-50/60">
        <div className="pointer-events-none absolute -left-24 top-16 h-80 w-80 rounded-full bg-emerald-300/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 top-40 h-72 w-72 rounded-full bg-cyan-300/20 blur-3xl" />

        <section className="py-10 md:py-12">
          <div className="container mx-auto px-4">
            <div className="relative overflow-hidden rounded-[2rem] border border-emerald-200/60 bg-gradient-to-br from-emerald-700 via-emerald-800 to-teal-800 p-8 text-white shadow-[0_24px_64px_-24px_rgba(6,95,70,0.9)] md:p-10">
              <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
              <div className="pointer-events-none absolute -bottom-20 -left-10 h-48 w-48 rounded-full bg-teal-300/20 blur-3xl" />
              <div className="relative z-10">
                <h1 className="text-4xl font-black mb-2 md:text-5xl">Create a Meetup</h1>
                <p className="text-lg text-emerald-100/85">
                  Host a sports activity and connect with players
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className="container mx-auto max-w-3xl px-4 py-8 pb-12">
          <form onSubmit={handleSubmit}>
            <Card className="create-meetup-card rounded-3xl border-emerald-100/80 bg-white/85 p-0 shadow-[0_26px_80px_-42px_rgba(15,23,42,0.45)] backdrop-blur-sm">
              <div className="space-y-6 p-5 md:p-8">
                <section className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
                  <h2 className="text-xl font-bold text-slate-900">Choose Sport</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Pick the sport first so attendees quickly understand the meetup.
                  </p>

                  <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
                    {loadingSports ? (
                      <div className="col-span-full py-8 text-center text-muted-foreground">
                        Loading sports...
                      </div>
                    ) : sports.length === 0 ? (
                      <div className="col-span-full py-8 text-center text-muted-foreground">
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
                            className={`rounded-xl border-2 p-4 text-left transition-all ${
                              isSelected
                                ? "border-emerald-500 bg-gradient-to-br from-emerald-50 to-teal-50 shadow-[0_12px_28px_-16px_rgba(5,150,105,0.8)]"
                                : "border-slate-200 bg-slate-50/60 hover:border-emerald-300 hover:bg-emerald-50/70"
                            }`}
                          >
                            {sport.imageUrl ? (
                              <img
                                src={sport.imageUrl}
                                alt={sport.name}
                                className="mb-2 h-12 w-12 object-contain"
                              />
                            ) : (
                              <div className="mb-2 text-3xl">{icon}</div>
                            )}
                            <div className={`text-sm font-semibold ${isSelected ? "text-emerald-700" : "text-slate-700"}`}>
                              {sport.name}
                            </div>
                          </button>
                        )
                      })
                    )}
                  </div>
                  {errors.sport && (
                    <p className="mt-2 text-sm text-red-500">{errors.sport}</p>
                  )}
                </section>

                <section className="rounded-2xl border border-emerald-100 bg-white p-5">
                  <h2 className="text-xl font-bold text-slate-900">Meetup Details</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Give your meetup a clear title and description.
                  </p>

                  <div className="mt-4 space-y-5">
                    <div>
                      <Label htmlFor="title" className="text-slate-700">Meetup Title *</Label>
                      <Input
                        id="title"
                        placeholder="e.g., Weekend Tennis Match at Central Park"
                        value={formData.title}
                        onChange={(e) =>
                          setFormData({ ...formData, title: e.target.value })
                        }
                        className="mt-2 h-11 border-emerald-200 focus-visible:ring-emerald-500"
                      />
                      {errors.title && (
                        <p className="mt-2 text-sm text-red-500">{errors.title}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="description" className="text-slate-700">Description</Label>
                      <textarea
                        id="description"
                        placeholder="Tell others about your meetup..."
                        value={formData.description}
                        onChange={(e) =>
                          setFormData({ ...formData, description: e.target.value })
                        }
                        className="mt-2 min-h-[120px] w-full rounded-md border border-emerald-200 bg-background p-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                  </div>
                </section>

                <section className="rounded-2xl border border-emerald-100 bg-white p-5">
                  <h2 className="text-xl font-bold text-slate-900">Location</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Enter where the meetup will happen.
                  </p>

                  <div className="mt-4 space-y-5">
                    <div>
                      <Label htmlFor="zipcode" className="text-slate-700">Zipcode</Label>
                      <Input
                        id="zipcode"
                        type="text"
                        placeholder="10001"
                        value={zipcode}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '').slice(0, 5)
                          setZipcode(value)
                          if (value.length === 5) {
                            lookupZipcode(value)
                          }
                        }}
                        className="mt-2 h-11 max-w-xs border-emerald-200 focus-visible:ring-emerald-500"
                        disabled={zipcodeLoading}
                      />
                      {zipcodeLoading && (
                        <p className="mt-1 text-sm text-muted-foreground">
                          Looking up location...
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="location" className="text-slate-700">Location *</Label>
                      <Input
                        id="location"
                        placeholder="e.g., Central Park Tennis Courts"
                        value={formData.location}
                        onChange={(e) =>
                          setFormData({ ...formData, location: e.target.value })
                        }
                        className="mt-2 h-11 border-emerald-200 focus-visible:ring-emerald-500"
                      />
                      {errors.location && (
                        <p className="mt-2 text-sm text-red-500">{errors.location}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <Label htmlFor="city" className="text-slate-700">City</Label>
                        <Input
                          id="city"
                          placeholder="New York"
                          value={formData.city}
                          onChange={(e) =>
                            setFormData({ ...formData, city: e.target.value })
                          }
                          className="mt-2 h-11 border-emerald-200 focus-visible:ring-emerald-500"
                        />
                      </div>
                      <div>
                        <Label htmlFor="state" className="text-slate-700">State</Label>
                        <Input
                          id="state"
                          placeholder="NY"
                          value={formData.state}
                          onChange={(e) =>
                            setFormData({ ...formData, state: e.target.value })
                          }
                          className="mt-2 h-11 border-emerald-200 focus-visible:ring-emerald-500"
                        />
                      </div>
                    </div>
                  </div>
                </section>

                <section className="rounded-2xl border border-emerald-100 bg-white p-5">
                  <h2 className="text-xl font-bold text-slate-900">Schedule & Capacity</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Set the event date, time, and participant limits.
                  </p>

                  <div className="mt-4 space-y-5">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <Label htmlFor="date" className="text-slate-700">Date *</Label>
                        <Input
                          id="date"
                          type="date"
                          value={formData.date}
                          onChange={(e) =>
                            setFormData({ ...formData, date: e.target.value })
                          }
                          className="mt-2 h-11 border-emerald-200 focus-visible:ring-emerald-500"
                          min={new Date().toISOString().split("T")[0]}
                        />
                        {errors.date && (
                          <p className="mt-2 text-sm text-red-500">{errors.date}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="time" className="text-slate-700">Time *</Label>
                        <Input
                          id="time"
                          type="time"
                          value={formData.time}
                          onChange={(e) =>
                            setFormData({ ...formData, time: e.target.value })
                          }
                          className="mt-2 h-11 border-emerald-200 focus-visible:ring-emerald-500"
                        />
                        {errors.time && (
                          <p className="mt-2 text-sm text-red-500">{errors.time}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <Label htmlFor="maxParticipants" className="text-slate-700">
                          Max Participants *
                        </Label>
                        <Input
                          id="maxParticipants"
                          type="number"
                          min="2"
                          max="50"
                          value={maxParticipantsInput}
                          onChange={(e) => {
                            const value = e.target.value;
                            setMaxParticipantsInput(value);
                            const numValue = parseInt(value, 10);
                            if (!isNaN(numValue) && numValue > 0) {
                              setFormData({
                                ...formData,
                                maxParticipants: numValue,
                              });
                            }
                          }}
                          onBlur={(e) => {
                            const value = parseInt(e.target.value, 10);
                            if (isNaN(value) || value < 2) {
                              const finalValue = 2;
                              setMaxParticipantsInput("2");
                              setFormData({
                                ...formData,
                                maxParticipants: finalValue,
                              });
                            } else if (value > 50) {
                              const finalValue = 50;
                              setMaxParticipantsInput("50");
                              setFormData({
                                ...formData,
                                maxParticipants: finalValue,
                              });
                            } else {
                              setMaxParticipantsInput(value.toString());
                            }
                          }}
                          className="mt-2 h-11 border-emerald-200 focus-visible:ring-emerald-500"
                        />
                        {errors.maxParticipants && (
                          <p className="mt-2 text-sm text-red-500">
                            {errors.maxParticipants}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="skillLevel" className="text-slate-700">Skill Level *</Label>
                        <div className="relative mt-2">
                          <select
                            id="skillLevel"
                            value={formData.skillLevel}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                skillLevel: e.target.value as CreateMeetupData["skillLevel"],
                              })
                            }
                            className="h-11 w-full appearance-none rounded-md border border-emerald-200 bg-background px-3 pr-10 text-sm text-slate-700 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          >
                            <option value="all">All Levels</option>
                            <option value="beginner">Beginner</option>
                            <option value="intermediate">Intermediate</option>
                            <option value="advanced">Advanced</option>
                          </select>
                          <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                            <svg
                              className="h-4 w-4 text-muted-foreground"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 9l-7 7-7-7"
                              />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                  <Button
                    type="submit"
                    className="h-11 flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-[0_16px_32px_-16px_rgba(13,148,136,0.85)] hover:from-emerald-700 hover:to-teal-700"
                    disabled={loading}
                  >
                    {loading ? "Creating..." : "Create Meetup"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    disabled={loading}
                    className="h-11 border-slate-300 text-slate-700 hover:bg-slate-50 sm:w-36"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </Card>
          </form>
        </div>
      </div>
    </ProtectedRoute>
  )
}
