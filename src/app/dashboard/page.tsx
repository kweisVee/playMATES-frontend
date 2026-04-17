"use client"

import { ProtectedRoute } from "@/components/protected-route"
import { useAuthContext } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import { Calendar, Users, TrendingUp, Plus, Search, List, ArrowRight } from "lucide-react"
import { MeetupCard } from "@/components/meetup-card"
import { useEffect, useState } from "react"
import { Meetup, MeetupService } from "@/lib/services/meetup"
import { useRouter } from "next/navigation"

export default function Dashboard() {
  const { user } = useAuthContext()
  const router = useRouter()
  const [upcomingMeetups, setUpcomingMeetups] = useState<Meetup[]>([])
  const [recommendedMeetups, setRecommendedMeetups] = useState<Meetup[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalJoined: 0,
    totalHosted: 0,
    upcomingCount: 0,
  })

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        // Fetch user's meetups
        const hosting = await MeetupService.getUserHostedMeetups()
        const joined = await MeetupService.getUserJoinedMeetups()
        
        // Ensure hosting and joined are arrays
        const hostingArray = Array.isArray(hosting) ? hosting : []
        const joinedArray = Array.isArray(joined) ? joined : []

        // Merge hosted/joined meetups by id to avoid duplicates
        const personalMeetupsById = new Map<string, Meetup>()
        const personalMeetups = [...hostingArray, ...joinedArray]

        personalMeetups.forEach((meetup) => {
          if (meetup?.id !== undefined && meetup?.id !== null) {
            personalMeetupsById.set(String(meetup.id), meetup)
          }
        })
        const uniquePersonalMeetups = Array.from(personalMeetupsById.values())

        // Filter upcoming meetups
        const upcomingSorted = uniquePersonalMeetups
          .filter((m) => new Date(m.date) >= new Date())
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        const upcoming = upcomingSorted
          .slice(0, 3)

        setUpcomingMeetups(upcoming)

        // Fetch recommended meetups (all meetups for now)
        const allMeetups = await MeetupService.getMeetups()
        const recommended = Array.isArray(allMeetups)
          ? allMeetups
              .filter((m) => new Date(m.date) >= new Date())
              .filter((m) => !personalMeetupsById.has(String(m.id)))
              .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
              .slice(0, 4)
          : []

        setRecommendedMeetups(recommended)

        // Calculate stats
        setStats({
          totalJoined: joinedArray.length,
          totalHosted: hostingArray.length,
          upcomingCount: upcomingSorted.length,
        })
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error)
        console.log("Note: This is expected if backend API endpoints are not yet implemented")
        // Set defaults on error
        setUpcomingMeetups([])
        setRecommendedMeetups([])
        setStats({
          totalJoined: 0,
          totalHosted: 0,
          upcomingCount: 0,
        })
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const handleViewMeetup = (meetupId: string) => {
    router.push(`/meetup/${meetupId}`)
  }

  const renderCardSkeletons = (count: number, gridClasses: string) => (
    <div className={gridClasses}>
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index} className="rounded-2xl border-slate-200/80 dark:border-slate-700/50 bg-white dark:bg-slate-800/90 p-0 shadow-[0_16px_56px_-32px_rgba(15,23,42,0.35)]">
          <div className="animate-pulse space-y-4 p-5">
            <div className="flex items-start gap-3">
              <div className="h-12 w-12 rounded-xl bg-slate-200 dark:bg-slate-700" />
              <div className="min-w-0 flex-1 space-y-2">
                <div className="h-4 w-3/4 rounded bg-slate-200 dark:bg-slate-700" />
                <div className="h-3 w-1/3 rounded bg-slate-200 dark:bg-slate-700" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-3 w-2/3 rounded bg-slate-200 dark:bg-slate-700" />
              <div className="h-3 w-1/2 rounded bg-slate-200 dark:bg-slate-700" />
              <div className="h-3 w-4/5 rounded bg-slate-200 dark:bg-slate-700" />
            </div>
            <div className="h-10 w-full rounded-xl bg-slate-200 dark:bg-slate-700" />
          </div>
        </Card>
      ))}
    </div>
  )

  return (
    <ProtectedRoute>
      <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-emerald-50 via-white to-teal-50/60 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <div className="pointer-events-none absolute -left-24 top-16 h-80 w-80 rounded-full bg-emerald-300/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 top-40 h-72 w-72 rounded-full bg-cyan-300/20 blur-3xl" />

        {/* Welcome Section */}
        <section
          id="dashboard-welcome"
          data-section="welcome"
          className="dashboard-welcome py-10 md:py-12"
        >
          <div className="container mx-auto px-4">
            <div className="relative overflow-hidden rounded-[2rem] border border-emerald-200/60 bg-gradient-to-br from-emerald-700 via-emerald-800 to-teal-800 p-8 text-white shadow-[0_24px_64px_-24px_rgba(6,95,70,0.9)] md:p-10">
              <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
              <div className="pointer-events-none absolute -bottom-20 -left-10 h-48 w-48 rounded-full bg-teal-300/20 blur-3xl" />
              <div className="relative z-10">
                <h1 className="text-4xl font-black mb-2 md:text-5xl">
                  Welcome back, {user?.firstName}! 👋
                </h1>
                <p className="text-lg text-emerald-100/85">
                  Ready to play? Here&apos;s what&apos;s happening today.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Stats */}
        <section
          id="dashboard-quick-stats"
          data-section="quick-stats"
          className="container dashboard-quick-stats mx-auto px-4 -mt-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card className="rounded-2xl border-emerald-200/80 dark:border-emerald-900/50 bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-950/50 dark:to-slate-900 p-6 shadow-[0_16px_56px_-32px_rgba(6,95,70,0.45)]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Meetups Joined</p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">{stats.totalJoined}</p>
                </div>
                <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/40 rounded-full flex items-center justify-center">
                  <Users className="h-6 w-6 text-emerald-700 dark:text-emerald-400" />
                </div>
              </div>
            </Card>

            <Card className="rounded-2xl border-teal-200/80 dark:border-teal-900/50 bg-gradient-to-br from-teal-50 to-white dark:from-teal-950/50 dark:to-slate-900 p-6 shadow-[0_16px_56px_-32px_rgba(13,148,136,0.45)]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Meetups Hosted</p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">{stats.totalHosted}</p>
                </div>
                <div className="w-12 h-12 bg-teal-100 dark:bg-teal-900/40 rounded-full flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-teal-700 dark:text-teal-400" />
                </div>
              </div>
            </Card>

            <Card className="rounded-2xl border-slate-200/80 dark:border-slate-700/50 bg-gradient-to-br from-slate-50 to-white dark:from-slate-800/50 dark:to-slate-900 p-6 shadow-[0_16px_56px_-32px_rgba(15,23,42,0.35)]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Upcoming</p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">{stats.upcomingCount}</p>
                </div>
                <div className="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-slate-700 dark:text-slate-300" />
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* Quick Actions */}
        <section
          id="dashboard-quick-actions"
          data-section="quick-actions"
          className="container dashboard-quick-actions mx-auto px-4 mb-12"
        >
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/create-meetup">
              <Card className="rounded-2xl border-emerald-200/80 dark:border-emerald-900/50 bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-950/50 dark:to-slate-900 p-6 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_20px_60px_-30px_rgba(6,95,70,0.55)] cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/40 rounded-full flex items-center justify-center">
                    <Plus className="h-6 w-6 text-emerald-700 dark:text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-slate-900 dark:text-slate-100">Create Meetup</h3>
                    <p className="text-sm text-muted-foreground">Host a new event</p>
                  </div>
                </div>
              </Card>
            </Link>

            <Link href="/browse-all-meetups">
              <Card className="rounded-2xl border-teal-200/80 dark:border-teal-900/50 bg-gradient-to-br from-teal-50 to-white dark:from-teal-950/50 dark:to-slate-900 p-6 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_20px_60px_-30px_rgba(13,148,136,0.55)] cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-teal-100 dark:bg-teal-900/40 rounded-full flex items-center justify-center">
                    <Search className="h-6 w-6 text-teal-700 dark:text-teal-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-slate-900 dark:text-slate-100">Browse Meetups</h3>
                    <p className="text-sm text-muted-foreground">Find events near you</p>
                  </div>
                </div>
              </Card>
            </Link>

            <Link href="/my-meetups">
              <Card className="rounded-2xl border-slate-200/80 dark:border-slate-700/50 bg-gradient-to-br from-slate-50 to-white dark:from-slate-800/50 dark:to-slate-900 p-6 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_20px_60px_-30px_rgba(15,23,42,0.45)] cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center">
                    <List className="h-6 w-6 text-slate-700 dark:text-slate-300" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-slate-900 dark:text-slate-100">My Meetups</h3>
                    <p className="text-sm text-muted-foreground">Manage your events</p>
                  </div>
                </div>
              </Card>
            </Link>
          </div>
        </section>

        {/* Upcoming Meetups */}
        <section
          id="dashboard-upcoming-meetups"
          data-section="upcoming-meetups"
          className="container dashboard-upcoming-meetups mx-auto px-4 mb-12"
        >
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Your Upcoming Meetups</h2>
              <p className="mt-1 text-sm text-slate-500">
                Next events you&apos;re hosting or joining.
              </p>
            </div>
            <Link href="/my-meetups">
              <Button variant="ghost" size="sm" className="text-slate-700 dark:text-slate-300">
                View All
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="rounded-3xl border border-emerald-100/80 dark:border-slate-700/50 bg-white/75 dark:bg-slate-900/80 p-4 shadow-[0_22px_70px_-38px_rgba(15,23,42,0.45)] backdrop-blur-sm md:p-6">
            {loading ? (
              renderCardSkeletons(3, "grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3")
            ) : upcomingMeetups.length > 0 ? (
              <div className="grid grid-cols-1 items-stretch gap-5 md:grid-cols-2 xl:grid-cols-3">
                {upcomingMeetups.map((meetup) => (
                  <MeetupCard
                    key={meetup.id}
                    meetup={meetup}
                    onView={handleViewMeetup}
                    isHost={String(meetup.hostId) === String(user?.id)}
                  />
                ))}
              </div>
            ) : (
              <Card className="rounded-2xl border-slate-200/80 dark:border-slate-700/50 p-12 text-center shadow-[0_16px_56px_-32px_rgba(15,23,42,0.35)]">
                <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">No upcoming meetups</h3>
                <p className="text-muted-foreground mb-6">
                  Join or create a meetup to get started!
                </p>
                <div className="flex flex-col gap-3 justify-center sm:flex-row">
                  <Link href="/browse-all-meetups">
                    <Button>Browse Meetups</Button>
                  </Link>
                  <Link href="/create-meetup">
                    <Button variant="outline">Create Meetup</Button>
                  </Link>
                </div>
              </Card>
            )}
          </div>
        </section>

        {/* Recommended Meetups */}
        <section
          id="dashboard-recommended-meetups"
          data-section="recommended-meetups"
          className="container dashboard-recommended-meetups mx-auto px-4 pb-12"
        >
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Recommended for You</h2>
              <p className="mt-1 text-sm text-slate-500">
                Fresh meetups you haven&apos;t joined yet.
              </p>
            </div>
            <Link href="/browse-all-meetups">
              <Button variant="ghost" size="sm" className="text-slate-700 dark:text-slate-300">
                Browse All
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="rounded-3xl border border-emerald-100/80 dark:border-slate-700/50 bg-white/75 dark:bg-slate-900/80 p-4 shadow-[0_22px_70px_-38px_rgba(15,23,42,0.45)] backdrop-blur-sm md:p-6">
            {loading ? (
              renderCardSkeletons(4, "grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4")
            ) : recommendedMeetups.length > 0 ? (
              <div className="grid grid-cols-1 items-stretch gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {recommendedMeetups.map((meetup) => (
                  <MeetupCard
                    key={meetup.id}
                    meetup={meetup}
                    onView={handleViewMeetup}
                  />
                ))}
              </div>
            ) : (
              <Card className="rounded-2xl border-slate-200/80 dark:border-slate-700/50 p-12 text-center shadow-[0_16px_56px_-32px_rgba(15,23,42,0.35)]">
                <p className="text-muted-foreground">No meetups available at the moment.</p>
              </Card>
            )}
          </div>
        </section>
      </div>
    </ProtectedRoute>
  )
}
