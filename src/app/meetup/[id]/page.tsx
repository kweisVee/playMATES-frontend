"use client"

import { ProtectedRoute } from "@/components/protected-route"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  MapPin,
  Calendar,
  Clock,
  Users,
  User,
  Edit,
  Trash2,
  AlertCircle,
  AlertTriangle,
} from "lucide-react"
import { useState, useEffect } from "react"
import { Meetup, MeetupService, getSportName } from "@/lib/services/meetup"
import { useAuthContext } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import { useParams } from "next/navigation"
import { cn } from "@/lib/utils"
import { useSports } from "@/hooks/useSports"

type EditMeetupFormData = {
  title: string
  description: string
  sport: string
  location: string
  city: string
  state: string
  date: string
  time: string
  maxParticipants: number
  skillLevel: Meetup["skillLevel"]
}

export default function MeetupDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuthContext()
  const [meetup, setMeetup] = useState<Meetup | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editLoading, setEditLoading] = useState(false)
  const [editErrors, setEditErrors] = useState<Record<string, string>>({})
  const [editForm, setEditForm] = useState<EditMeetupFormData>({
    title: "",
    description: "",
    sport: "",
    location: "",
    city: "",
    state: "",
    date: "",
    time: "",
    maxParticipants: 2,
    skillLevel: "all",
  })
  const { data: sports = [] } = useSports()

  const meetupId = params.id as string

  useEffect(() => {
    fetchMeetup()
  }, [meetupId])

  const fetchMeetup = async () => {
    try {
      setLoading(true)
      const data = await MeetupService.getMeetupById(meetupId)
      setMeetup(data)
      setEditForm({
        title: data.title || "",
        description: data.description || "",
        sport: getSportName(data.sport),
        location: data.location || "",
        city: data.city || "",
        state: data.state || "",
        date: data.date || "",
        time: data.time || "",
        maxParticipants: data.maxParticipants || 2,
        skillLevel: data.skillLevel || "all",
      })
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
    if (!meetup) return
    setEditErrors({})
    setEditForm({
      title: meetup.title || "",
      description: meetup.description || "",
      sport: getSportName(meetup.sport),
      location: meetup.location || "",
      city: meetup.city || "",
      state: meetup.state || "",
      date: meetup.date || "",
      time: meetup.time || "",
      maxParticipants: meetup.maxParticipants || 2,
      skillLevel: meetup.skillLevel || "all",
    })
    setIsEditing(true)
  }

  const validateEditForm = () => {
    const errors: Record<string, string> = {}

    if (!editForm.title.trim()) errors.title = "Title is required"
    if (!editForm.sport.trim()) errors.sport = "Sport is required"
    if (!editForm.location.trim()) errors.location = "Location is required"
    if (!editForm.date) errors.date = "Date is required"
    if (!editForm.time) errors.time = "Time is required"
    if (editForm.maxParticipants < 2) {
      errors.maxParticipants = "Must allow at least 2 participants"
    }

    setEditErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSaveEdit = async () => {
    if (!validateEditForm()) return

    try {
      setEditLoading(true)
      await MeetupService.updateMeetup(meetupId, {
        title: editForm.title.trim(),
        description: editForm.description.trim(),
        sport: editForm.sport.trim(),
        location: editForm.location.trim(),
        city: editForm.city.trim(),
        state: editForm.state.trim(),
        date: editForm.date,
        time: editForm.time,
        maxParticipants: editForm.maxParticipants,
        skillLevel: editForm.skillLevel,
      })

      await fetchMeetup()
      setIsEditing(false)
      alert("Meetup updated successfully")
    } catch (error) {
      console.error("Failed to update meetup:", error)
      alert("Failed to update meetup. Please try again.")
    } finally {
      setEditLoading(false)
    }
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
              The meetup you&apos;re looking for doesn&apos;t exist or has been removed.
            </p>
            <Button onClick={() => router.push("/browse")}>
              Browse Meetups
            </Button>
          </Card>
        </div>
      </ProtectedRoute>
    )
  }

  const isHost = String(meetup.hostId) === String(user?.id)
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

  const formatTime = (timeValue: string) => {
    const [hours = "0", minutes = "00"] = timeValue.split(":")
    const date = new Date()
    date.setHours(Number(hours), Number(minutes), 0, 0)
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    })
  }

  const availableSpots = Math.max(
    meetup.maxParticipants - meetup.currentParticipants,
    0
  )
  const skillLabel =
    meetup.skillLevel === "all"
      ? "All Levels"
      : `${meetup.skillLevel.charAt(0).toUpperCase()}${meetup.skillLevel.slice(1)}`
  const participantActionLabel = actionLoading
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
            : "Join Meetup"

  return (
    <ProtectedRoute>
      <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-emerald-50 via-white to-teal-50/60">
        <div className="pointer-events-none absolute -left-24 top-16 h-80 w-80 rounded-full bg-emerald-300/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 top-40 h-72 w-72 rounded-full bg-cyan-300/20 blur-3xl" />

        <section className="container mx-auto px-4 pt-8 md:pt-10">
          <div className="relative overflow-hidden rounded-[2rem] border border-emerald-200/60 bg-gradient-to-br from-emerald-700 via-emerald-800 to-teal-800 p-6 text-white shadow-[0_24px_64px_-24px_rgba(6,95,70,0.9)] md:p-10">
            <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
            <div className="pointer-events-none absolute -bottom-20 -left-10 h-48 w-48 rounded-full bg-teal-300/20 blur-3xl" />

            <div className="relative z-10 flex flex-col gap-8">
              <div className="flex flex-col justify-between gap-6 lg:flex-row">
                <div className="flex items-start gap-4 md:gap-5">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-4xl ring-1 ring-white/25 backdrop-blur-sm md:h-20 md:w-20 md:text-5xl">
                    {meetup.sportIcon || "⚽"}
                  </div>
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-100/80">
                      {getSportName(meetup.sport)}
                    </p>
                    <h1 className="mt-1 text-3xl font-black leading-tight md:text-5xl">
                      {meetup.title}
                    </h1>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className="rounded-full border border-white/30 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide">
                        {skillLabel}
                      </span>
                      <span
                        className={cn(
                          "rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide",
                          isCancelled
                            ? "bg-red-500/90 text-white"
                            : isPast
                              ? "bg-slate-500/85 text-white"
                              : "bg-emerald-300/90 text-emerald-950"
                        )}
                      >
                        {isCancelled ? "Cancelled" : isPast ? "Past Event" : "Open Meetup"}
                      </span>
                      {isHost && (
                        <span className="rounded-full border border-white/35 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide">
                          You&apos;re the Host
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {isHost && (
                  <div className="flex items-start">
                    <Button
                      variant="secondary"
                      className="bg-white text-emerald-900 hover:bg-emerald-50"
                      onClick={handleEdit}
                      disabled={actionLoading || editLoading || isCancelled}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      {isEditing ? "Editing Meetup" : "Edit Meetup"}
                    </Button>
                  </div>
                )}
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm">
                  <p className="text-xs font-semibold uppercase tracking-wider text-white/75">
                    Date
                  </p>
                  <p className="mt-1 text-sm font-semibold md:text-base">
                    {formatDate(meetup.date)}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm">
                  <p className="text-xs font-semibold uppercase tracking-wider text-white/75">
                    Time
                  </p>
                  <p className="mt-1 text-sm font-semibold md:text-base">
                    {formatTime(meetup.time)}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm">
                  <p className="text-xs font-semibold uppercase tracking-wider text-white/75">
                    Location
                  </p>
                  <p className="mt-1 text-sm font-semibold md:text-base">
                    {meetup.location}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm">
                  <p className="text-xs font-semibold uppercase tracking-wider text-white/75">
                    Spots Left
                  </p>
                  <p className="mt-1 text-sm font-semibold md:text-base">
                    {availableSpots} of {meetup.maxParticipants}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-8 md:py-10">
          <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
            <div className="space-y-6">
              {isHost && isEditing && (
                <Card className="overflow-hidden rounded-2xl border-emerald-200/70 shadow-[0_20px_60px_-30px_rgba(6,95,70,0.6)]">
                  <div className="border-b border-emerald-100 bg-gradient-to-r from-emerald-50 to-teal-50 px-6 py-4">
                    <h2 className="text-xl font-bold text-emerald-900">Edit Meetup</h2>
                    <p className="text-sm text-emerald-700/80">
                      Update your meetup details and save when ready.
                    </p>
                  </div>
                  <div className="space-y-4 p-6">
                    <div>
                      <Label htmlFor="edit-title">Title *</Label>
                      <Input
                        id="edit-title"
                        value={editForm.title}
                        onChange={(e) =>
                          setEditForm({ ...editForm, title: e.target.value })
                        }
                        className="mt-2"
                      />
                      {editErrors.title && (
                        <p className="mt-1 text-sm text-red-500">{editErrors.title}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="edit-description">Description</Label>
                      <textarea
                        id="edit-description"
                        value={editForm.description}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            description: e.target.value,
                          })
                        }
                        className="mt-2 min-h-[120px] w-full rounded-md border bg-background p-3"
                      />
                    </div>

                    <div>
                      <Label htmlFor="edit-sport">Sport *</Label>
                      {sports.length > 0 ? (
                        <select
                          id="edit-sport"
                          value={editForm.sport}
                          onChange={(e) =>
                            setEditForm({ ...editForm, sport: e.target.value })
                          }
                          className="mt-2 w-full rounded-md border bg-background p-3"
                        >
                          <option value="">Select sport</option>
                          {sports.map((sport) => (
                            <option key={sport.id} value={sport.name}>
                              {sport.name}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <Input
                          id="edit-sport"
                          value={editForm.sport}
                          onChange={(e) =>
                            setEditForm({ ...editForm, sport: e.target.value })
                          }
                          className="mt-2"
                          placeholder="Sport name"
                        />
                      )}
                      {editErrors.sport && (
                        <p className="mt-1 text-sm text-red-500">{editErrors.sport}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="edit-location">Location *</Label>
                      <Input
                        id="edit-location"
                        value={editForm.location}
                        onChange={(e) =>
                          setEditForm({ ...editForm, location: e.target.value })
                        }
                        className="mt-2"
                      />
                      {editErrors.location && (
                        <p className="mt-1 text-sm text-red-500">{editErrors.location}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <Label htmlFor="edit-city">City</Label>
                        <Input
                          id="edit-city"
                          value={editForm.city}
                          onChange={(e) =>
                            setEditForm({ ...editForm, city: e.target.value })
                          }
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit-state">State</Label>
                        <Input
                          id="edit-state"
                          value={editForm.state}
                          onChange={(e) =>
                            setEditForm({ ...editForm, state: e.target.value })
                          }
                          className="mt-2"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <Label htmlFor="edit-date">Date *</Label>
                        <Input
                          id="edit-date"
                          type="date"
                          value={editForm.date}
                          onChange={(e) =>
                            setEditForm({ ...editForm, date: e.target.value })
                          }
                          className="mt-2"
                        />
                        {editErrors.date && (
                          <p className="mt-1 text-sm text-red-500">{editErrors.date}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="edit-time">Time *</Label>
                        <Input
                          id="edit-time"
                          type="time"
                          value={editForm.time}
                          onChange={(e) =>
                            setEditForm({ ...editForm, time: e.target.value })
                          }
                          className="mt-2"
                        />
                        {editErrors.time && (
                          <p className="mt-1 text-sm text-red-500">{editErrors.time}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <Label htmlFor="edit-max-participants">Max Participants *</Label>
                        <Input
                          id="edit-max-participants"
                          type="number"
                          min={2}
                          value={editForm.maxParticipants}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              maxParticipants: Number(e.target.value),
                            })
                          }
                          className="mt-2"
                        />
                        {editErrors.maxParticipants && (
                          <p className="mt-1 text-sm text-red-500">
                            {editErrors.maxParticipants}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="edit-skill-level">Skill Level</Label>
                        <select
                          id="edit-skill-level"
                          value={editForm.skillLevel}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              skillLevel: e.target.value as Meetup["skillLevel"],
                            })
                          }
                          className="mt-2 w-full rounded-md border bg-background p-3"
                        >
                          <option value="all">All Levels</option>
                          <option value="beginner">Beginner</option>
                          <option value="intermediate">Intermediate</option>
                          <option value="advanced">Advanced</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3 pt-2">
                      <Button onClick={handleSaveEdit} disabled={editLoading}>
                        {editLoading ? "Saving..." : "Save Changes"}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsEditing(false)
                          setEditErrors({})
                        }}
                        disabled={editLoading}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </Card>
              )}

              <Card className="rounded-2xl border-slate-200/80 shadow-[0_16px_56px_-32px_rgba(15,23,42,0.45)]">
                <div className="border-b border-slate-100 px-6 py-4">
                  <h2 className="text-2xl font-bold text-slate-900">About This Meetup</h2>
                </div>
                <div className="px-6 py-5">
                  <p className="leading-relaxed text-slate-700 whitespace-pre-wrap">
                    {meetup.description || "No description provided."}
                  </p>
                </div>
              </Card>

              <Card className="rounded-2xl border-slate-200/80 shadow-[0_16px_56px_-32px_rgba(15,23,42,0.45)]">
                <div className="border-b border-slate-100 px-6 py-4">
                  <h2 className="text-2xl font-bold text-slate-900">
                    Players in This Meetup
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    {meetup.currentParticipants} of {meetup.maxParticipants} spots filled
                  </p>
                </div>
                <div className="px-6 py-5">
                  {meetup.participants && meetup.participants.length > 0 ? (
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {meetup.participants.map((participant) => (
                        <div
                          key={participant.id}
                          className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/70 p-3"
                        >
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15">
                            <User className="h-5 w-5 text-primary" />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-medium text-slate-800">
                              {participant.firstName} {participant.lastName}
                            </p>
                            {String(participant.id) === String(meetup.hostId) && (
                              <span className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                                Host
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center text-slate-500">
                      No participants yet. Be the first to join.
                    </p>
                  )}
                </div>
              </Card>
            </div>

            <div className="space-y-6 lg:sticky lg:top-6">
              <Card className="rounded-2xl border-slate-200/80 shadow-[0_16px_56px_-32px_rgba(15,23,42,0.45)]">
                <div className="border-b border-slate-100 px-5 py-4">
                  <h2 className="text-lg font-bold text-slate-900">Meetup Details</h2>
                </div>
                <div className="space-y-4 px-5 py-5">
                  <div className="flex items-start gap-3">
                    <Calendar className="mt-0.5 h-5 w-5 text-emerald-600" />
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Date
                      </p>
                      <p className="font-medium text-slate-800">{formatDate(meetup.date)}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="mt-0.5 h-5 w-5 text-emerald-600" />
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Time
                      </p>
                      <p className="font-medium text-slate-800">{formatTime(meetup.time)}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="mt-0.5 h-5 w-5 text-emerald-600" />
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Location
                      </p>
                      <p className="font-medium text-slate-800">
                        {meetup.location}
                        {meetup.city && meetup.state && (
                          <span className="block text-sm text-slate-500">
                            {meetup.city}, {meetup.state}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Users className="mt-0.5 h-5 w-5 text-emerald-600" />
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Skill Level
                      </p>
                      <p className="font-medium text-slate-800">{skillLabel}</p>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="overflow-hidden rounded-2xl border-0 shadow-[0_22px_66px_-36px_rgba(6,95,70,0.85)]">
                <div className="bg-gradient-to-r from-emerald-700 to-teal-700 px-5 py-4">
                  <h2 className="text-lg font-bold text-white">Actions</h2>
                </div>
                <div className="space-y-3 bg-white px-5 py-5">
                  {isHost ? (
                    <>
                      {!isCancelled && (
                        <Button
                          variant="outline"
                          className="w-full border-amber-500 bg-amber-50 font-semibold text-amber-800 hover:bg-amber-100 hover:text-amber-900"
                          onClick={handleCancel}
                          disabled={actionLoading || isPast}
                        >
                          <AlertTriangle className="mr-2 h-4 w-4" />
                          Cancel Meetup
                        </Button>
                      )}
                      <Button
                        variant="destructive"
                        className="w-full"
                        onClick={handleDelete}
                        disabled={actionLoading}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Meetup
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        variant={isParticipant ? "outline" : "default"}
                        className={cn(
                          "w-full rounded-xl font-semibold",
                          isParticipant
                            ? "border border-rose-300 bg-rose-100 text-rose-700 hover:bg-rose-200"
                            : ""
                        )}
                        onClick={isParticipant ? handleLeave : handleJoin}
                        disabled={actionLoading || isFull || isPast || isCancelled}
                      >
                        {participantActionLabel}
                      </Button>
                      <p className="text-center text-xs text-slate-500">
                        Only the host can edit this meetup.
                      </p>
                    </>
                  )}
                </div>
              </Card>

              <Card className="rounded-2xl border-slate-200/80 shadow-[0_16px_56px_-32px_rgba(15,23,42,0.45)]">
                <div className="border-b border-slate-100 px-5 py-4">
                  <h2 className="text-lg font-bold text-slate-900">Host</h2>
                </div>
                <div className="px-5 py-5">
                  <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/15">
                      <User className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800">
                        {meetup.hostName || "Anonymous Host"}
                      </p>
                      <p className="text-sm text-slate-500">Organizer</p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </section>
      </div>
    </ProtectedRoute>
  )
}
