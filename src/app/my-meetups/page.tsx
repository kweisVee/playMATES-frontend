"use client"

import { ProtectedRoute } from "@/components/protected-route"
import { MeetupCard } from "@/components/meetup-card"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Calendar, Plus } from "lucide-react"
import { useState, useEffect } from "react"
import { Meetup, MeetupService } from "@/lib/services/meetup"
import { useRouter } from "next/navigation"
import { useAuthContext } from "@/contexts/AuthContext"
import Link from "next/link"

export default function MyMeetupsPage() {
  const router = useRouter()
  const { user } = useAuthContext()
  const [activeTab, setActiveTab] = useState<"hosting" | "joined">("hosting")
  const [hostingMeetups, setHostingMeetups] = useState<Meetup[]>([])
  const [joinedMeetups, setJoinedMeetups] = useState<Meetup[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUserMeetups()
  }, [])

  const fetchUserMeetups = async () => {
    try {
      setLoading(true)
      const data = await MeetupService.getUserMeetups()
      setHostingMeetups(data.hosting || [])
      setJoinedMeetups(data.joined || [])
    } catch (error) {
      console.error("Failed to fetch user meetups:", error)
      setHostingMeetups([])
      setJoinedMeetups([])
    } finally {
      setLoading(false)
    }
  }

  const handleViewMeetup = (meetupId: string) => {
    router.push(`/meetup/${meetupId}`)
  }

  const handleLeaveMeetup = async (meetupId: string) => {
    if (!confirm("Are you sure you want to leave this meetup?")) {
      return
    }

    try {
      await MeetupService.leaveMeetup(meetupId)
      // Refresh the list after leaving
      fetchUserMeetups()
    } catch (error) {
      console.error("Failed to leave meetup:", error)
      alert("Failed to leave meetup. Please try again.")
    }
  }

  const handleCancelMeetup = async (meetupId: string) => {
    if (!confirm("Are you sure you want to cancel this meetup? This action cannot be undone.")) {
      return
    }

    try {
      await MeetupService.updateMeetup(meetupId, { status: "cancelled" })
      // Refresh the list after canceling
      fetchUserMeetups()
    } catch (error) {
      console.error("Failed to cancel meetup:", error)
      alert("Failed to cancel meetup. Please try again.")
    }
  }

  const activeMeetups = (activeTab === "hosting" ? hostingMeetups : joinedMeetups) || []
  const upcomingMeetups = activeMeetups.filter(
    (m) => m.status === "upcoming" && new Date(m.date) >= new Date()
  )
  const pastMeetups = activeMeetups.filter(
    (m) => new Date(m.date) < new Date() || m.status === "completed"
  )
  const cancelledMeetups = activeMeetups.filter((m) => m.status === "cancelled")

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-b from-primary/10 to-white">
        {/* Header */}
        <section className="bg-gradient-to-r from-primary/20 to-primary/10 py-12">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold mb-2">My Meetups</h1>
                <p className="text-lg text-muted-foreground">
                  Manage your hosted and joined meetups
                </p>
              </div>
              <Link href="/create-meetup">
                <Button size="lg">
                  <Plus className="h-5 w-5 mr-2" />
                  Create Meetup
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 py-8">
          {/* Tabs */}
          <div className="flex gap-2 mb-8">
            <Button
              variant={activeTab === "hosting" ? "default" : "outline"}
              onClick={() => setActiveTab("hosting")}
              className="flex-1 md:flex-none"
            >
              Hosting ({hostingMeetups.length})
            </Button>
            <Button
              variant={activeTab === "joined" ? "default" : "outline"}
              onClick={() => setActiveTab("joined")}
              className="flex-1 md:flex-none"
            >
              Joined ({joinedMeetups.length})
            </Button>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading your meetups...</p>
            </div>
          ) : (
            <>
              {/* Upcoming Meetups */}
              {upcomingMeetups.length > 0 && (
                <section className="mb-12">
                  <h2 className="text-2xl font-bold mb-4">Upcoming</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {upcomingMeetups.map((meetup) => (
                      <MeetupCard
                        key={meetup.id}
                        meetup={meetup}
                        onView={handleViewMeetup}
                        onLeave={
                          activeTab === "joined" ? handleLeaveMeetup : undefined
                        }
                        isJoined={activeTab === "joined"}
                        isHost={activeTab === "hosting"}
                      />
                    ))}
                  </div>
                </section>
              )}

              {/* Past Meetups */}
              {pastMeetups.length > 0 && (
                <section className="mb-12">
                  <h2 className="text-2xl font-bold mb-4">Past</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {pastMeetups.map((meetup) => (
                      <MeetupCard
                        key={meetup.id}
                        meetup={meetup}
                        onView={handleViewMeetup}
                        isHost={activeTab === "hosting"}
                      />
                    ))}
                  </div>
                </section>
              )}

              {/* Cancelled Meetups */}
              {cancelledMeetups.length > 0 && (
                <section className="mb-12">
                  <h2 className="text-2xl font-bold mb-4">Cancelled</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {cancelledMeetups.map((meetup) => (
                      <MeetupCard
                        key={meetup.id}
                        meetup={meetup}
                        onView={handleViewMeetup}
                        isHost={activeTab === "hosting"}
                      />
                    ))}
                  </div>
                </section>
              )}

              {/* Empty State */}
              {activeMeetups.length === 0 && (
                <Card className="p-12 text-center">
                  <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">
                    {activeTab === "hosting"
                      ? "No meetups hosted yet"
                      : "No meetups joined yet"}
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    {activeTab === "hosting"
                      ? "Create your first meetup to get started!"
                      : "Browse and join meetups to connect with other players!"}
                  </p>
                  <div className="flex gap-4 justify-center">
                    {activeTab === "hosting" ? (
                      <Link href="/create-meetup">
                        <Button>
                          <Plus className="h-4 w-4 mr-2" />
                          Create Meetup
                        </Button>
                      </Link>
                    ) : (
                      <Link href="/browse-all-meetups">
                        <Button>Browse Meetups</Button>
                      </Link>
                    )}
                  </div>
                </Card>
              )}
            </>
          )}
        </div>
      </div>
    </ProtectedRoute>
  )
}

