"use client"

import { ProtectedRoute } from "@/components/protected-route"
import { MeetupCard } from "@/components/meetup-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Search, Filter, Grid, List as ListIcon, X } from "lucide-react"
import { useState, useEffect, useCallback } from "react"
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
  const [actionLoading, setActionLoading] = useState(false)
  const [joinedMeetupIds, setJoinedMeetupIds] = useState<Set<string>>(new Set())
  const [joinedMeetupsLoading, setJoinedMeetupsLoading] = useState(false)

  const skillLevels = ["all", "beginner", "intermediate", "advanced"]

  useEffect(() => {
    fetchSports()
  }, [])

  useEffect(() => {
    if (user?.id) {
      fetchUserJoinedMeetups()
    } else {
      setJoinedMeetupIds(new Set())
      setJoinedMeetupsLoading(false)
    }
  }, [user?.id])

  const fetchSports = async () => {
    try {
      const data = await SportService.getAllSports()
      setSports(data.filter((sport: Sport) => sport.isActive))
    } catch (error) {
      console.error("Failed to fetch sports:", error)
    }
  }

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

  const fetchMeetups = useCallback(async () => {
    try {
      setLoading(true)
      const data = await MeetupService.getMeetups(filters)
      const upcomingMeetups = data.filter(
        (meetup: Meetup) => new Date(meetup.date) >= new Date()
      )
      setMeetups(upcomingMeetups)
    } catch (error) {
      console.error("Failed to fetch meetups:", error)
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    fetchMeetups()
  }, [fetchMeetups])

  const handleSearch = () => {
    setFilters((prev) => ({
      ...prev,
      search: searchTerm || undefined,
      sport: selectedSport !== "all" ? selectedSport : undefined,
      skillLevel: selectedSkillLevel !== "all" ? selectedSkillLevel : undefined,
    }))
  }

  const handleClearFilters = () => {
    setSearchTerm("")
    setSelectedSport("all")
    setSelectedSkillLevel("all")
    setFilters({})
  }

  const handleViewMeetup = (meetupId: string) => {
    router.push(`/meetup/${meetupId}`)
  }

  const handleJoinMeetup = async (meetupId: string) => {
    try {
      setActionLoading(true)
      await MeetupService.joinMeetup(meetupId)
      await Promise.all([fetchMeetups(), fetchUserJoinedMeetups()])
    } catch (error) {
      console.error("Failed to join meetup:", error)
      alert("Failed to join meetup. Please try again.")
    } finally {
      setActionLoading(false)
    }
  }

  const handleLeaveMeetup = async (meetupId: string) => {
    if (!confirm("Are you sure you want to leave this meetup?")) {
      return
    }

    try {
      setActionLoading(true)
      await MeetupService.leaveMeetup(meetupId)
      await Promise.all([fetchMeetups(), fetchUserJoinedMeetups()])
    } catch (error) {
      console.error("Failed to leave meetup:", error)
      alert("Failed to leave meetup. Please try again.")
    } finally {
      setActionLoading(false)
    }
  }

  const filteredMeetups = meetups.filter((meetup) => {
    const sportName = getSportName(meetup.sport)

    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      const matchesSearch =
        meetup.title.toLowerCase().includes(term) ||
        sportName.toLowerCase().includes(term) ||
        meetup.location.toLowerCase().includes(term)
      if (!matchesSearch) return false
    }

    if (selectedSport !== "all") {
      if (sportName.toLowerCase() !== selectedSport.toLowerCase()) {
        return false
      }
    }

    if (selectedSkillLevel !== "all") {
      if (meetup.skillLevel.toLowerCase() !== selectedSkillLevel.toLowerCase()) {
        return false
      }
    }

    return true
  })

  const hasActiveFilters =
    searchTerm.trim().length > 0 ||
    selectedSport !== "all" ||
    selectedSkillLevel !== "all"

  const renderCardSkeletons = () => (
    <div
      className={
        viewMode === "grid"
          ? "grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3"
          : "space-y-4"
      }
    >
      {Array.from({ length: viewMode === "grid" ? 6 : 3 }).map((_, index) => (
        <Card
          key={index}
          className="rounded-2xl border-slate-200/80 bg-white p-0 shadow-[0_16px_56px_-32px_rgba(15,23,42,0.35)]"
        >
          <div className="animate-pulse space-y-4 p-5">
            <div className="flex items-start gap-3">
              <div className="h-12 w-12 rounded-xl bg-slate-200" />
              <div className="min-w-0 flex-1 space-y-2">
                <div className="h-4 w-3/4 rounded bg-slate-200" />
                <div className="h-3 w-1/3 rounded bg-slate-200" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-3 w-2/3 rounded bg-slate-200" />
              <div className="h-3 w-1/2 rounded bg-slate-200" />
              <div className="h-3 w-4/5 rounded bg-slate-200" />
            </div>
            <div className="h-10 w-full rounded-xl bg-slate-200" />
          </div>
        </Card>
      ))}
    </div>
  )

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
                <h1 className="text-4xl font-black mb-2 md:text-5xl">Discover Meetups</h1>
                <p className="text-lg text-emerald-100/85">
                  Find and join sports activities near you
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 py-8">
          <Card className="mb-8 rounded-3xl border-emerald-100/80 bg-white/80 p-5 shadow-[0_22px_70px_-38px_rgba(15,23,42,0.45)] backdrop-blur-sm md:p-6">
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px_220px_auto]">
              <div className="relative lg:col-span-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-600" />
                <Input
                  placeholder="Search by title, sport, or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="h-11 border-emerald-200 pl-10 text-slate-700 placeholder:text-slate-400 focus-visible:ring-emerald-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Sport</label>
                <select
                  value={selectedSport}
                  onChange={(e) => setSelectedSport(e.target.value)}
                  className="h-11 w-full rounded-lg border border-emerald-200 bg-white px-3 text-slate-700 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="all">All Sports</option>
                  {sports.map((sport) => (
                    <option key={sport.id} value={sport.name}>
                      {sport.name.charAt(0).toUpperCase() + sport.name.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Skill Level</label>
                <select
                  value={selectedSkillLevel}
                  onChange={(e) => setSelectedSkillLevel(e.target.value)}
                  className="h-11 w-full rounded-lg border border-emerald-200 bg-white px-3 text-slate-700 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  {skillLevels.map((level) => (
                    <option key={level} value={level}>
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-end gap-2">
                <Button onClick={handleSearch} className="h-11 px-5">
                  <Search className="mr-2 h-4 w-4" />
                  Search
                </Button>
                {hasActiveFilters && (
                  <Button
                    variant="outline"
                    onClick={handleClearFilters}
                    className="h-11 border-slate-300 text-slate-700 hover:bg-slate-50"
                  >
                    <X className="mr-2 h-4 w-4" />
                    Clear
                  </Button>
                )}
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-emerald-100 pt-4">
              <p className="text-sm text-slate-500">
                {loading || joinedMeetupsLoading
                  ? "Loading meetups..."
                  : `${filteredMeetups.length} meetup${filteredMeetups.length === 1 ? "" : "s"} found`}
              </p>
              <div className="flex gap-2">
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("grid")}
                  className={viewMode === "grid" ? "bg-emerald-600 text-white hover:bg-emerald-700" : "border-slate-300 text-slate-700 hover:bg-slate-50"}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("list")}
                  className={viewMode === "list" ? "bg-emerald-600 text-white hover:bg-emerald-700" : "border-slate-300 text-slate-700 hover:bg-slate-50"}
                >
                  <ListIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>

          {loading || joinedMeetupsLoading ? (
            <div className="rounded-3xl border border-emerald-100/80 bg-white/75 p-4 shadow-[0_22px_70px_-38px_rgba(15,23,42,0.45)] backdrop-blur-sm md:p-6">
              {renderCardSkeletons()}
            </div>
          ) : filteredMeetups.length > 0 ? (
            <div className="rounded-3xl border border-emerald-100/80 bg-white/75 p-4 shadow-[0_22px_70px_-38px_rgba(15,23,42,0.45)] backdrop-blur-sm md:p-6">
              <div
                className={
                  viewMode === "grid"
                    ? "meetups-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
                    : "meetups-list space-y-4"
                }
              >
                {filteredMeetups.map((meetup) => (
                  <MeetupCard
                    key={meetup.id}
                    meetup={meetup}
                    variant={viewMode === "list" ? "full" : "compact"}
                    onJoin={handleJoinMeetup}
                    onLeave={handleLeaveMeetup}
                    onView={handleViewMeetup}
                    isJoined={joinedMeetupIds.has(meetup.id)}
                    isHost={String(meetup.hostId) === String(user?.id)}
                    loading={actionLoading}
                  />
                ))}
              </div>
            </div>
          ) : (
            <Card className="rounded-2xl border-slate-200/80 p-12 text-center shadow-[0_16px_56px_-32px_rgba(15,23,42,0.35)]">
              <Filter className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">No meetups found</h3>
              <p className="text-muted-foreground mb-6">
                Try adjusting your filters or search terms
              </p>
              <Button onClick={handleClearFilters}>
                Clear Filters
              </Button>
            </Card>
          )}
        </div>
      </div>
    </ProtectedRoute>
  )
}
