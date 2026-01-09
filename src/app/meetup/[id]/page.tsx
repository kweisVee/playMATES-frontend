"use client"

import { ProtectedRoute } from "@/components/protected-route"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  MapPin,
  Calendar,
  Clock,
  Users,
  User,
  Edit,
  Trash2,
  AlertCircle,
} from "lucide-react"
import { useState, useEffect } from "react"
import { Meetup, MeetupService, getSportName } from "@/lib/services/meetup"
import { useAuthContext } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import { useParams } from "next/navigation"
import { cn } from "@/lib/utils"

export default function MeetupDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuthContext()
  const [meetup, setMeetup] = useState<Meetup | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)

  const meetupId = params.id as string

  useEffect(() => {
    fetchMeetup()
  }, [meetupId])

  const fetchMeetup = async () => {
    try {
      setLoading(true)
      const data = await MeetupService.getMeetupById(meetupId)
      setMeetup(data)
    } catch (error) {
      console.error("Failed to fetch meetup:", error)
      alert("Failed to load meetup details")
      router.push("/browse-all-meetups")
    } finally {
      setLoading(false)
    }
  }

  const handleJoin = async () => {
    try {
      setActionLoading(true)
      await MeetupService.joinMeetup(meetupId)
      fetchMeetup() // Refresh data
    } catch (error) {
      console.error("Failed to join meetup:", error)
      alert("Failed to join meetup. Please try again.")
    } finally {
      setActionLoading(false)
    }
  }

  const handleLeave = async () => {
    if (!confirm("Are you sure you want to leave this meetup?")) {
      return
    }

    try {
      setActionLoading(true)
      await MeetupService.leaveMeetup(meetupId)
      fetchMeetup() // Refresh data
    } catch (error) {
      console.error("Failed to leave meetup:", error)
      alert("Failed to leave meetup. Please try again.")
    } finally {
      setActionLoading(false)
    }
  }

  const handleEdit = () => {
    // Navigate to edit page (could be implemented later)
    alert("Edit functionality coming soon!")
  }

  const handleCancel = async () => {
    if (
      !confirm(
        "Are you sure you want to cancel this meetup? This action cannot be undone."
      )
    ) {
      return
    }

    try {
      setActionLoading(true)
      await MeetupService.updateMeetup(meetupId, { status: "cancelled" })
      fetchMeetup() // Refresh data
    } catch (error) {
      console.error("Failed to cancel meetup:", error)
      alert("Failed to cancel meetup. Please try again.")
    } finally {
      setActionLoading(false)
    }
  }

  const handleDelete = async () => {
    if (
      !confirm(
        "Are you sure you want to delete this meetup? This action cannot be undone."
      )
    ) {
      return
    }

    try {
      setActionLoading(true)
      await MeetupService.deleteMeetup(meetupId)
      alert("Meetup deleted successfully")
      router.push("/my-meetups")
    } catch (error) {
      console.error("Failed to delete meetup:", error)
      alert("Failed to delete meetup. Please try again.")
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading meetup details...</p>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  if (!meetup) {
    return (
      <ProtectedRoute>
        <div className="flex items-center justify-center min-h-screen">
          <Card className="p-8 text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Meetup Not Found</h2>
            <p className="text-muted-foreground mb-4">
              The meetup you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={() => router.push("/browse")}>
              Browse Meetups
            </Button>
          </Card>
        </div>
      </ProtectedRoute>
    )
  }

  const isHost = meetup.hostId === user?.id
  // Ensure both IDs are compared as strings for consistency
  const isParticipant = meetup.participants?.some((p) => String(p.id) === String(user?.id)) ?? false
  const isFull = meetup.currentParticipants >= meetup.maxParticipants
  const isPast = new Date(meetup.date) < new Date()
  const isCancelled = meetup.status === "cancelled"

  // Debug logging
  console.log("Meetup participants:", meetup.participants)
  console.log("User ID:", user?.id, "Type:", typeof user?.id)
  console.log("Is Participant:", isParticipant)
  console.log("Participant IDs:", meetup.participants?.map(p => ({ id: p.id, type: typeof p.id })))

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
        {/* Header with Sport Icon */}
        <section
          className={`${meetup.sportColor || "bg-blue-100"} py-16`}
        >
          <div className="container mx-auto px-4">
            <div className="flex items-start gap-6">
              <div className="text-6xl">{meetup.sportIcon || "⚽"}</div>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-4xl font-bold mb-2">{meetup.title}</h1>
                    <p className="text-lg text-muted-foreground mb-4">
                      {getSportName(meetup.sport)}
                    </p>
                    {isCancelled && (
                      <span className="inline-block bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                        Cancelled
                      </span>
                    )}
                    {isPast && !isCancelled && (
                      <span className="inline-block bg-gray-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                        Past Event
                      </span>
                    )}
                  </div>
                  {isHost && (
                    <span className="bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-semibold">
                      You're the Host
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Description */}
              <Card className="p-6">
                <h2 className="text-2xl font-bold mb-4">About This Meetup</h2>
                <p className="text-foreground whitespace-pre-wrap">
                  {meetup.description || "No description provided."}
                </p>
              </Card>

              {/* Participants */}
              <Card className="p-6">
                <h2 className="text-2xl font-bold mb-4">
                  Participants ({meetup.currentParticipants}/{meetup.maxParticipants})
                </h2>
                {meetup.participants && meetup.participants.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {meetup.participants.map((participant) => (
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
                          {participant.id === meetup.hostId && (
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
                        {formatDate(meetup.date)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">Time</p>
                      <p className="text-sm text-muted-foreground">
                        {meetup.time}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">Location</p>
                      <p className="text-sm text-muted-foreground">
                        {meetup.location}
                        {meetup.city && meetup.state && (
                          <span className="block">
                            {meetup.city}, {meetup.state}
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
                        {meetup.skillLevel === "all" ? "All Levels" : meetup.skillLevel}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Action Buttons */}
              <Card className="p-6">
                {isHost ? (
                  <div className="space-y-3">
                    <Button
                      className="w-full"
                      onClick={handleEdit}
                      disabled={actionLoading || isCancelled}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Meetup
                    </Button>
                    {!isCancelled && (
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={handleCancel}
                        disabled={actionLoading || isPast}
                      >
                        Cancel Meetup
                      </Button>
                    )}
                    <Button
                      variant="destructive"
                      className="w-full"
                      onClick={handleDelete}
                      disabled={actionLoading}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Meetup
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant={isParticipant ? "outline" : "default"}
                    className={cn(
                      "w-full font-medium rounded-xl",
                      isParticipant 
                        ? "bg-rose-100 text-rose-700 hover:bg-rose-200 border border-rose-300"
                        : ""
                    )}
                    onClick={isParticipant ? handleLeave : handleJoin}
                    disabled={actionLoading || isFull || isPast || isCancelled}
                  >
                    {actionLoading
                      ? isParticipant 
                        ? "Leaving..." 
                        : "Joining..."
                      : isParticipant
                      ? "Leave Meetup"
                      : isFull
                      ? "Meetup Full"
                      : isPast
                      ? "Event Ended"
                      : isCancelled
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
                      {meetup.hostName || "Anonymous Host"}
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}

