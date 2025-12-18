"use client"

import { ProtectedRoute } from "@/components/protected-route"
import { MeetupCard } from "@/components/meetup-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Search, Filter, Grid, List as ListIcon, ArrowLeft, MapPin, Calendar, Clock, Users, User, Edit, Trash2, AlertCircle } from "lucide-react"
import { useState, useEffect } from "react"
import { Meetup, MeetupService, MeetupFilters, getSportName } from "@/lib/services/meetup"
import { SportService, Sport } from "@/lib/services/sport"
import { useRouter } from "next/navigation"
import { useAuthContext } from "@/contexts/AuthContext"

export default function BrowsePage() {
  const router = useRouter()
  const { user } = useAuthContext()
  const [meetups, setMeetups] = useState<Meetup[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [searchTerm, setSearchTerm] = useState("")
  const [filters, setFilters] = useState<MeetupFilters>({})
  const [selectedSport, setSelectedSport] = useState<string>("all")
  const [selectedSkillLevel, setSelectedSkillLevel] = useState<string>("all")
  const [sports, setSports] = useState<Sport[]>([])
  const [selectedMeetupId, setSelectedMeetupId] = useState<string | null>(null)
  const [selectedMeetup, setSelectedMeetup] = useState<Meetup | null>(null)
  const [meetupLoading, setMeetupLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [joinedMeetupIds, setJoinedMeetupIds] = useState<Set<string>>(new Set())
  const [joinedMeetupsLoading, setJoinedMeetupsLoading] = useState(false)

  const skillLevels = ["all", "beginner", "intermediate", "advanced"]

  // Fetch sports on mount
  useEffect(() => {
    fetchSports()
  }, [])

  const fetchSports = async () => {
    try {
      const data = await SportService.getAllSports()
      setSports(data.filter((sport: Sport) => sport.isActive))
    } catch (error) {
      console.error("Failed to fetch sports:", error)
    }
  }

  // Fetch user's joined meetups on mount and when user changes
  useEffect(() => {
    if (user?.id) {
      fetchUserJoinedMeetups()
    } else {
      // If no user, clear joined meetups and mark as not loading
      setJoinedMeetupIds(new Set())
      setJoinedMeetupsLoading(false)
    }
  }, [user?.id])

  const fetchUserJoinedMeetups = async () => {
    try {
      setJoinedMeetupsLoading(true)
      const data = await MeetupService.getUserJoinedMeetups()
      const joinedIds = new Set(data.map((meetup: Meetup) => meetup.id))
      setJoinedMeetupIds(joinedIds)
    } catch (error) {
      console.error("Failed to fetch user joined meetups:", error)
    } finally {
      setJoinedMeetupsLoading(false)
    }
  }

  useEffect(() => {
    fetchMeetups()
  }, [filters])

  const fetchMeetups = async () => {
    try {
      setLoading(true)
      const data = await MeetupService.getMeetups(filters)
      // Filter out past meetups
      const upcomingMeetups = data.filter(
        (meetup: Meetup) => new Date(meetup.date) >= new Date()
      )
      setMeetups(upcomingMeetups)
    } catch (error) {
      console.error("Failed to fetch meetups:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    setFilters((prev) => ({
      ...prev,
      search: searchTerm || undefined,
      sport: selectedSport !== "all" ? selectedSport : undefined,
      skillLevel: selectedSkillLevel !== "all" ? selectedSkillLevel : undefined,
    }))
  }

  const handleJoinMeetup = async (meetupId: string) => {
    try {
      await MeetupService.joinMeetup(meetupId)
      // Refresh meetups after joining
      fetchMeetups()
      // Refresh joined meetups list
      fetchUserJoinedMeetups()
      // Refresh meetup details if viewing a specific meetup
      if (selectedMeetupId === meetupId && selectedMeetup) {
        const data = await MeetupService.getMeetupById(meetupId)
        setSelectedMeetup(data)
      }
    } catch (error) {
      console.error("Failed to join meetup:", error)
      alert("Failed to join meetup. Please try again.")
    }
  }

  const handleViewMeetup = async (meetupId: string) => {
    setSelectedMeetupId(meetupId)
    setMeetupLoading(true)
    try {
      const data = await MeetupService.getMeetupById(meetupId)
      setSelectedMeetup(data)
      // Scroll to results section
      setTimeout(() => {
        const resultsSection = document.querySelector('.results-section')
        if (resultsSection) {
          resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }, 100)
    } catch (error) {
      console.error("Failed to fetch meetup:", error)
      alert("Failed to load meetup details")
      setSelectedMeetupId(null)
      setSelectedMeetup(null)
    } finally {
      setMeetupLoading(false)
    }
  }

  const handleBackToList = () => {
    setSelectedMeetupId(null)
    setSelectedMeetup(null)
  }

  const handleJoin = async (meetupId: string) => {
    try {
      setActionLoading(true)
      await MeetupService.joinMeetup(meetupId)
      // Refresh meetup details if viewing a specific meetup
      if (selectedMeetupId === meetupId) {
        const data = await MeetupService.getMeetupById(meetupId)
        setSelectedMeetup(data)
      }
      // Refresh meetups list and joined meetups
      fetchMeetups()
      fetchUserJoinedMeetups()
    } catch (error) {
      console.error("Failed to join meetup:", error)
      alert("Failed to join meetup. Please try again.")
    } finally {
      setActionLoading(false)
    }
  }

  const handleLeave = async (meetupId: string) => {
    if (!confirm("Are you sure you want to leave this meetup?")) {
      return
    }

    try {
      setActionLoading(true)
      await MeetupService.leaveMeetup(meetupId)
      // Refresh meetup details if viewing a specific meetup
      if (selectedMeetupId === meetupId) {
        const data = await MeetupService.getMeetupById(meetupId)
        setSelectedMeetup(data)
      }
      // Refresh meetups list and joined meetups
      fetchMeetups()
      fetchUserJoinedMeetups()
    } catch (error) {
      console.error("Failed to leave meetup:", error)
      alert("Failed to leave meetup. Please try again.")
    } finally {
      setActionLoading(false)
    }
  }

  const filteredMeetups = meetups.filter((meetup) => {
    const sportName = getSportName(meetup.sport)
    
    // Search term filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      const matchesSearch = 
        meetup.title.toLowerCase().includes(term) ||
        sportName.toLowerCase().includes(term) ||
        meetup.location.toLowerCase().includes(term)
      if (!matchesSearch) return false
    }

    // Sport filter
    if (selectedSport !== "all") {
      if (sportName.toLowerCase() !== selectedSport.toLowerCase()) {
        return false
      }
    }

    // Skill level filter
    if (selectedSkillLevel !== "all") {
      if (meetup.skillLevel.toLowerCase() !== selectedSkillLevel.toLowerCase()) {
        return false
      }
    }

    return true
  })

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    })
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-b from-primary/10 to-white">
        {/* Header Section - Always Visible */}
        <section className="bg-gradient-to-r from-primary/20 to-primary/10 py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl font-bold mb-2">Discover Meetups</h1>
            <p className="text-lg text-muted-foreground">
              Find and join sports activities near you
            </p>
          </div>
        </section>

        <div className="container mx-auto px-4 py-8">
          {/* Search and Filters */}
          <Card className="p-6 mb-8">
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-600" />
                <Input
                  placeholder="Search by title, sport, or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="pl-10 border-green-300 focus:border-green-500 focus:ring-green-500"
                />
              </div>
              <Button onClick={handleSearch}>
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>

            {/* Filter Options */}
            <div className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">Sport</label>
                <select
                  value={selectedSport}
                  onChange={(e) => setSelectedSport(e.target.value)}
                  className="w-full p-2 border border-green-300 rounded-md bg-background focus:border-green-500 focus:ring-1 focus:ring-green-500"
                >
                  <option value="all">All Sports</option>
                  {sports.map((sport) => (
                    <option key={sport.id} value={sport.name}>
                      {sport.name.charAt(0).toUpperCase() + sport.name.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">Skill Level</label>
                <select
                  value={selectedSkillLevel}
                  onChange={(e) => setSelectedSkillLevel(e.target.value)}
                  className="w-full p-2 border border-green-300 rounded-md bg-background focus:border-green-500 focus:ring-1 focus:ring-green-500"
                >
                  {skillLevels.map((level) => (
                    <option key={level} value={level}>
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2">
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("grid")}
                  className={viewMode === "grid" ? "bg-green-100 hover:bg-green-200 text-green-700 border-green-300" : "border-green-500 text-green-700 hover:bg-green-50"}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("list")}
                  className={viewMode === "list" ? "bg-green-100 hover:bg-green-200 text-green-700 border-green-300" : "border-green-500 text-green-700 hover:bg-green-50"}
                >
                  <ListIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>

          {/* Results Section */}
          <div className="results-section">
            {selectedMeetupId && selectedMeetup ? (
              // Show Meetup Detail View
              <div className="space-y-6">
                <Button
                  variant="outline"
                  onClick={handleBackToList}
                  className="mb-4"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to List
                </Button>

                {meetupLoading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading meetup details...</p>
                  </div>
                ) : (
                  <>
                    {/* Meetup Header */}
                    <section
                      className={`${selectedMeetup.sportColor || "bg-blue-100"} py-8 rounded-lg`}
                    >
                      <div className="container mx-auto px-4">
                        <div className="flex items-start gap-6">
                          <div className="text-6xl">{selectedMeetup.sportIcon || "⚽"}</div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <div>
                                <h1 className="text-4xl font-bold mb-2">{selectedMeetup.title}</h1>
                                <p className="text-lg text-muted-foreground mb-4">
                                  {getSportName(selectedMeetup.sport)}
                                </p>
                                {selectedMeetup.status === "cancelled" && (
                                  <span className="inline-block bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                                    Cancelled
                                  </span>
                                )}
                                {new Date(selectedMeetup.date) < new Date() && selectedMeetup.status !== "cancelled" && (
                                  <span className="inline-block bg-gray-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                                    Past Event
                                  </span>
                                )}
                              </div>
                              {selectedMeetup.hostId === user?.id && (
                                <span className="bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-semibold">
                                  You're the Host
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </section>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                      {/* Main Content */}
                      <div className="lg:col-span-2 space-y-6">
                        {/* Description */}
                        <Card className="p-6">
                          <h2 className="text-2xl font-bold mb-4">About This Meetup</h2>
                          <p className="text-foreground whitespace-pre-wrap">
                            {selectedMeetup.description || "No description provided."}
                          </p>
                        </Card>

                        {/* Participants */}
                        <Card className="p-6">
                          <h2 className="text-2xl font-bold mb-4">
                            Participants ({selectedMeetup.currentParticipants}/{selectedMeetup.maxParticipants})
                          </h2>
                          {selectedMeetup.participants && selectedMeetup.participants.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              {selectedMeetup.participants.map((participant) => (
                                <div
                                  key={participant.id}
                                  className="flex items-center gap-3 p-3 bg-background/50 rounded-lg"
                                >
                                  <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                                    <User className="h-5 w-5 text-primary" />
                                  </div>
                                  <div>
                                    <p className="font-medium">
                                      {participant.firstName} {participant.lastName}
                                    </p>
                                    {participant.id === selectedMeetup.hostId && (
                                      <span className="text-xs text-muted-foreground">
                                        Host
                                      </span>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-muted-foreground">
                              No participants yet. Be the first to join!
                            </p>
                          )}
                        </Card>
                      </div>

                      {/* Sidebar */}
                      <div className="space-y-6">
                        {/* Details Card */}
                        <Card className="p-6">
                          <h2 className="text-xl font-bold mb-4">Details</h2>
                          <div className="space-y-4">
                            <div className="flex items-start gap-3">
                              <Calendar className="h-5 w-5 text-primary mt-0.5" />
                              <div>
                                <p className="font-medium">Date</p>
                                <p className="text-sm text-muted-foreground">
                                  {formatDate(selectedMeetup.date)}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-start gap-3">
                              <Clock className="h-5 w-5 text-primary mt-0.5" />
                              <div>
                                <p className="font-medium">Time</p>
                                <p className="text-sm text-muted-foreground">
                                  {selectedMeetup.time}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-start gap-3">
                              <MapPin className="h-5 w-5 text-primary mt-0.5" />
                              <div>
                                <p className="font-medium">Location</p>
                                <p className="text-sm text-muted-foreground">
                                  {selectedMeetup.location}
                                  {selectedMeetup.city && selectedMeetup.state && (
                                    <span className="block">
                                      {selectedMeetup.city}, {selectedMeetup.state}
                                    </span>
                                  )}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-start gap-3">
                              <Users className="h-5 w-5 text-primary mt-0.5" />
                              <div>
                                <p className="font-medium">Skill Level</p>
                                <p className="text-sm text-muted-foreground capitalize">
                                  {selectedMeetup.skillLevel === "all" ? "All Levels" : selectedMeetup.skillLevel}
                                </p>
                              </div>
                            </div>
                          </div>
                        </Card>

                        {/* Action Buttons */}
                        <Card className="p-6">
                          {selectedMeetup.hostId === user?.id ? (
                            <div className="space-y-3">
                              <Button
                                className="w-full"
                                disabled={actionLoading || selectedMeetup.status === "cancelled"}
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Meetup
                              </Button>
                            </div>
                          ) : selectedMeetup.participants?.some((p) => p.id === user?.id) ? (
                            <Button
                              variant="outline"
                              className="w-full bg-rose-100 text-rose-700 hover:bg-rose-200 border border-rose-300"
                              onClick={() => handleLeave(selectedMeetup.id)}
                              disabled={actionLoading || new Date(selectedMeetup.date) < new Date() || selectedMeetup.status === "cancelled"}
                            >
                              {actionLoading ? "Leaving..." : "Leave Meetup"}
                            </Button>
                          ) : (
                            <Button
                              className="w-full"
                              onClick={() => handleJoin(selectedMeetup.id)}
                              disabled={actionLoading || selectedMeetup.currentParticipants >= selectedMeetup.maxParticipants || new Date(selectedMeetup.date) < new Date() || selectedMeetup.status === "cancelled"}
                            >
                              {actionLoading
                                ? "Joining..."
                                : selectedMeetup.currentParticipants >= selectedMeetup.maxParticipants
                                ? "Meetup Full"
                                : new Date(selectedMeetup.date) < new Date()
                                ? "Event Ended"
                                : selectedMeetup.status === "cancelled"
                                ? "Event Cancelled"
                                : "Join Meetup"}
                            </Button>
                          )}
                        </Card>

                        {/* Host Info */}
                        <Card className="p-6">
                          <h2 className="text-xl font-bold mb-4">Host</h2>
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                              <User className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium">
                                {selectedMeetup.hostName || "Anonymous Host"}
                              </p>
                            </div>
                          </div>
                        </Card>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              // Show Meetups List
              <>
                <div className="allmeetups-results-container mb-4">
                  <p className="text-sm text-muted-foreground">
                    {loading ? "Loading..." : `${filteredMeetups.length} meetups found`}
                  </p>
                </div>

                {/* Meetups Grid/List */}
                {loading || joinedMeetupsLoading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading meetups...</p>
                  </div>
                ) : filteredMeetups.length > 0 ? (
                  <div
                    className={
                      viewMode === "grid"
                        ? "meetups-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                        : "meetups-listspace-y-4"
                    }
                  >
                    {filteredMeetups.map((meetup) => (
                      <MeetupCard
                        key={meetup.id}
                        meetup={meetup}
                        variant={viewMode === "list" ? "full" : "compact"}
                        onJoin={handleJoinMeetup}
                        onLeave={handleLeave}
                        onView={handleViewMeetup}
                        isJoined={joinedMeetupIds.has(meetup.id)}
                        isHost={meetup.hostId === user?.id}
                        loading={actionLoading}
                      />
                    ))}
                  </div>
                ) : (
                  <Card className="p-12 text-center">
                    <Filter className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No meetups found</h3>
                    <p className="text-muted-foreground mb-6">
                      Try adjusting your filters or search terms
                    </p>
                    <Button 
                      onClick={() => {
                        setSearchTerm("")
                        setSelectedSport("all")
                        setSelectedSkillLevel("all")
                        setFilters({})
                      }}
                      className=""
                    >
                      Clear Filters
                    </Button>
                  </Card>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}

