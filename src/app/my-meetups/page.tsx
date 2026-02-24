"use client"

import { ProtectedRoute } from "@/components/protected-route"
import { MeetupCard } from "@/components/meetup-card"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Calendar, Plus } from "lucide-react"
import { useState, useEffect } from "react"
import { Meetup, MeetupService } from "@/lib/services/meetup"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function MyMeetupsPage() {
  const router = useRouter()
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
      const hostedMeetupsData = await MeetupService.getUserHostedMeetups()
      const joinedMeetupsData = await MeetupService.getUserJoinedMeetups()
      setHostingMeetups(hostedMeetupsData)
      setJoinedMeetups(joinedMeetupsData)
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

  const activeMeetups = (activeTab === "hosting" ? hostingMeetups : joinedMeetups) || []
  const upcomingMeetups = activeMeetups.filter(
    (m) => m.status === "upcoming" && new Date(m.date) >= new Date()
  )
  const pastMeetups = activeMeetups.filter(
    (m) => new Date(m.date) < new Date() || m.status === "completed"
  )
  const cancelledMeetups = activeMeetups.filter((m) => m.status === "cancelled")
  const activeTabLabel = activeTab === "hosting" ? "Hosting" : "Joined"

  const renderCardSkeletons = () => (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 3 }).map((_, index) => (
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
              <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h1 className="text-4xl font-black mb-2 md:text-5xl">My Meetups</h1>
                  <p className="text-lg text-emerald-100/85">
                    Manage your hosted and joined meetups
                  </p>
                </div>
                <Link href="/create-meetup">
                  <Button size="lg" className="bg-white text-emerald-800 hover:bg-emerald-50">
                    <Plus className="h-5 w-5 mr-2" />
                    Create Meetup
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 py-8">
          <Card className="mb-8 rounded-3xl border-emerald-100/80 bg-white/80 p-4 shadow-[0_22px_70px_-38px_rgba(15,23,42,0.45)] backdrop-blur-sm md:p-5">
            <div className="flex flex-wrap gap-2">
              <Button
                variant={activeTab === "hosting" ? "default" : "outline"}
                onClick={() => setActiveTab("hosting")}
                className={activeTab === "hosting" ? "bg-emerald-600 hover:bg-emerald-700" : "border-slate-300 text-slate-700 hover:bg-slate-50"}
              >
                Hosting ({hostingMeetups.length})
              </Button>
              <Button
                variant={activeTab === "joined" ? "default" : "outline"}
                onClick={() => setActiveTab("joined")}
                className={activeTab === "joined" ? "bg-emerald-600 hover:bg-emerald-700" : "border-slate-300 text-slate-700 hover:bg-slate-50"}
              >
                Joined ({joinedMeetups.length})
              </Button>
            </div>
          </Card>

          {loading ? (
            <div className="rounded-3xl border border-emerald-100/80 bg-white/75 p-4 shadow-[0_22px_70px_-38px_rgba(15,23,42,0.45)] backdrop-blur-sm md:p-6">
              {renderCardSkeletons()}
            </div>
          ) : (
            <>
              {/* Upcoming Meetups */}
              {upcomingMeetups.length > 0 && (
                <section className="mb-12">
                  <div className="mb-4">
                    <h2 className="text-2xl font-bold text-slate-900">Upcoming</h2>
                    <p className="text-sm text-slate-500">
                      Your next {activeTabLabel.toLowerCase()} events.
                    </p>
                  </div>
                  <div className="rounded-3xl border border-emerald-100/80 bg-white/75 p-4 shadow-[0_22px_70px_-38px_rgba(15,23,42,0.45)] backdrop-blur-sm md:p-6">
                    <div className="grid grid-cols-1 items-stretch gap-5 md:grid-cols-2 xl:grid-cols-3">
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
                  </div>
                </section>
              )}

              {/* Past Meetups */}
              {pastMeetups.length > 0 && (
                <section className="mb-12">
                  <div className="mb-4">
                    <h2 className="text-2xl font-bold text-slate-900">Past</h2>
                    <p className="text-sm text-slate-500">Completed or past-date meetups.</p>
                  </div>
                  <div className="rounded-3xl border border-emerald-100/80 bg-white/75 p-4 shadow-[0_22px_70px_-38px_rgba(15,23,42,0.45)] backdrop-blur-sm md:p-6">
                    <div className="grid grid-cols-1 items-stretch gap-5 md:grid-cols-2 xl:grid-cols-3">
                      {pastMeetups.map((meetup) => (
                        <MeetupCard
                          key={meetup.id}
                          meetup={meetup}
                          onView={handleViewMeetup}
                          isHost={activeTab === "hosting"}
                        />
                      ))}
                    </div>
                  </div>
                </section>
              )}

              {/* Cancelled Meetups */}
              {cancelledMeetups.length > 0 && (
                <section className="mb-12">
                  <div className="mb-4">
                    <h2 className="text-2xl font-bold text-slate-900">Cancelled</h2>
                    <p className="text-sm text-slate-500">Cancelled meetups for reference.</p>
                  </div>
                  <div className="rounded-3xl border border-emerald-100/80 bg-white/75 p-4 shadow-[0_22px_70px_-38px_rgba(15,23,42,0.45)] backdrop-blur-sm md:p-6">
                    <div className="grid grid-cols-1 items-stretch gap-5 md:grid-cols-2 xl:grid-cols-3">
                      {cancelledMeetups.map((meetup) => (
                        <MeetupCard
                          key={meetup.id}
                          meetup={meetup}
                          onView={handleViewMeetup}
                          isHost={activeTab === "hosting"}
                        />
                      ))}
                    </div>
                  </div>
                </section>
              )}

              {/* Empty State */}
              {activeMeetups.length === 0 && (
                <Card className="rounded-2xl border-slate-200/80 p-12 text-center shadow-[0_16px_56px_-32px_rgba(15,23,42,0.35)]">
                  <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">
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
