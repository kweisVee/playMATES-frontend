"use client"

import { ProtectedRoute } from "@/components/protected-route"
import { MeetupCard } from "@/components/meetup-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Search, Filter, Grid, List as ListIcon } from "lucide-react"
import { useState, useEffect } from "react"
import { Meetup, MeetupService, MeetupFilters } from "@/lib/services/meetup"
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
    } catch (error) {
      console.error("Failed to join meetup:", error)
      alert("Failed to join meetup. Please try again.")
    }
  }

  const handleViewMeetup = (meetupId: string) => {
    router.push(`/meetup/${meetupId}`)
  }

  const filteredMeetups = meetups.filter((meetup) => {
    // Search term filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      const matchesSearch = 
        meetup.title.toLowerCase().includes(term) ||
        meetup.sport.toLowerCase().includes(term) ||
        meetup.location.toLowerCase().includes(term)
      if (!matchesSearch) return false
    }

    // Sport filter
    if (selectedSport !== "all") {
      if (meetup.sport.toLowerCase() !== selectedSport.toLowerCase()) {
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

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-b from-primary/10 to-white">
        {/* Header */}
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
              <Button onClick={handleSearch} className="bg-green-600 hover:bg-green-700">
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

          {/* Results */}
          <div className="mb-4">
            <p className="text-sm text-muted-foreground">
              {loading ? "Loading..." : `${filteredMeetups.length} meetups found`}
            </p>
          </div>

          {/* Meetups Grid/List */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading meetups...</p>
            </div>
          ) : filteredMeetups.length > 0 ? (
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  : "space-y-4"
              }
            >
              {filteredMeetups.map((meetup) => (
                <MeetupCard
                  key={meetup.id}
                  meetup={meetup}
                  variant={viewMode === "list" ? "full" : "compact"}
                  onJoin={handleJoinMeetup}
                  onView={handleViewMeetup}
                  isHost={meetup.hostId === user?.id}
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
                className="bg-green-600 hover:bg-green-700"
              >
                Clear Filters
              </Button>
            </Card>
          )}
        </div>
      </div>
    </ProtectedRoute>
  )
}

