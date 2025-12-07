"use client"

import { ProtectedRoute } from "@/components/protected-route"
import { useAuthContext } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import { Calendar, Users, TrendingUp, Plus, Search, List } from "lucide-react"
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
        const userMeetups = await MeetupService.getUserHostedMeetups()
        
        // Ensure hosting and joined are arrays
        const hosting = Array.isArray(userMeetups?.hosting) ? userMeetups.hosting : []
        const joined = Array.isArray(userMeetups?.joined) ? userMeetups.joined : []
        
        // Filter upcoming meetups
        const upcoming = [...hosting, ...joined]
          .filter((m) => new Date(m.date) >= new Date())
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
          .slice(0, 3)
        
        setUpcomingMeetups(upcoming)
        
        // Fetch recommended meetups (all meetups for now)
        const allMeetups = await MeetupService.getMeetups()
        const recommended = Array.isArray(allMeetups) 
          ? allMeetups
              .filter((m) => new Date(m.date) >= new Date())
              .slice(0, 4)
          : []
        
        setRecommendedMeetups(recommended)
        
        // Calculate stats
        setStats({
          totalJoined: joined.length,
          totalHosted: hosting.length,
          upcomingCount: upcoming.length,
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

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-b from-primary/10 to-white">
        {/* Welcome Section */}
        <section className="bg-gradient-to-r from-primary/20 to-primary/10 py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl font-bold mb-2">
              Welcome back, {user?.firstName}! 👋
            </h1>
            <p className="text-lg text-muted-foreground">
              Ready to play? Here's what's happening today.
            </p>
          </div>
        </section>

        {/* Quick Stats */}
        <section className="container mx-auto px-4 -mt-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card className="p-6 bg-gradient-to-br from-green-50 to-white border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Meetups Joined</p>
                  <p className="text-3xl font-bold text-foreground">{stats.totalJoined}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-blue-50 to-white border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Meetups Hosted</p>
                  <p className="text-3xl font-bold text-foreground">{stats.totalHosted}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-orange-50 to-white border-orange-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Upcoming</p>
                  <p className="text-3xl font-bold text-foreground">{stats.upcomingCount}</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="container mx-auto px-4 mb-12">
          <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/create-meetup">
              <Card className="p-6 hover:shadow-lg transition-all cursor-pointer bg-gradient-to-br from-primary/10 to-white border-primary/20">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                    <Plus className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Create Meetup</h3>
                    <p className="text-sm text-muted-foreground">Host a new event</p>
                  </div>
                </div>
              </Card>
            </Link>

            <Link href="/browse">
              <Card className="p-6 hover:shadow-lg transition-all cursor-pointer bg-gradient-to-br from-purple-50 to-white border-purple-200">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <Search className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Browse Meetups</h3>
                    <p className="text-sm text-muted-foreground">Find events near you</p>
                  </div>
                </div>
              </Card>
            </Link>

            <Link href="/my-meetups">
              <Card className="p-6 hover:shadow-lg transition-all cursor-pointer bg-gradient-to-br from-cyan-50 to-white border-cyan-200">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-cyan-100 rounded-full flex items-center justify-center">
                    <List className="h-6 w-6 text-cyan-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">My Meetups</h3>
                    <p className="text-sm text-muted-foreground">Manage your events</p>
                  </div>
                </div>
              </Card>
            </Link>
          </div>
        </section>

        {/* Upcoming Meetups */}
        <section className="meetups-container mx-auto px-4 mb-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Your Upcoming Meetups</h2>
            <Link href="/my-meetups">
              <Button variant="ghost" size="sm">
                View All
              </Button>
            </Link>
          </div>
          
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading your meetups...</p>
            </div>
          ) : upcomingMeetups.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {upcomingMeetups.map((meetup) => (
                <MeetupCard
                  key={meetup.id}
                  meetup={meetup}
                  onView={handleViewMeetup}
                  isHost={meetup.hostId === user?.id}
                />
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No upcoming meetups</h3>
              <p className="text-muted-foreground mb-6">
                Join or create a meetup to get started!
              </p>
              <div className="flex gap-4 justify-center">
                <Link href="/browse-all-meetups">
                  <Button>Browse Meetups</Button>
                </Link>
                <Link href="/create-meetup">
                  <Button variant="outline">Create Meetup</Button>
                </Link>
              </div>
            </Card>
          )}
        </section>

        {/* Recommended Meetups */}
        <section className="container mx-auto px-4 pb-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Recommended for You</h2>
            <Link href="/browse-all-meetups">
              <Button variant="ghost" size="sm">
                Browse All
              </Button>
            </Link>
          </div>
          
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading recommendations...</p>
            </div>
          ) : recommendedMeetups.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {recommendedMeetups.map((meetup) => (
                <MeetupCard
                  key={meetup.id}
                  meetup={meetup}
                  onView={handleViewMeetup}
                />
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">No meetups available at the moment.</p>
            </Card>
          )}
        </section>
      </div>
    </ProtectedRoute>
  )
}

