"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, Calendar, Users, Clock } from "lucide-react"
import { Meetup, getSportName } from "@/lib/services/meetup"

interface MeetupCardProps {
  meetup: Meetup
  variant?: "compact" | "full"
  onJoin?: (meetupId: string) => void
  onLeave?: (meetupId: string) => void
  onView?: (meetupId: string) => void
  isJoined?: boolean
  isHost?: boolean
  loading?: boolean
}

export function MeetupCard({
  meetup,
  variant = "compact",
  onJoin,
  onLeave,
  onView,
  isJoined = false,
  isHost = false,
  loading = false,
}: MeetupCardProps) {
  const spotsLeft = meetup.maxParticipants - meetup.currentParticipants
  const isFull = spotsLeft <= 0

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "short",
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

  const skillLabel =
    meetup.skillLevel === "all"
      ? "All Levels"
      : `${meetup.skillLevel.charAt(0).toUpperCase()}${meetup.skillLevel.slice(1)}`

  // List view (horizontal layout)
  if (variant === "full") {
    return (
      <Card className="meetup-card-horizontal overflow-hidden rounded-2xl border border-slate-200/80 bg-white dark:bg-slate-800/90 dark:border-slate-700/50 p-0 shadow-[0_16px_56px_-32px_rgba(15,23,42,0.45)] transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-200 dark:hover:border-emerald-700 hover:shadow-[0_24px_70px_-32px_rgba(6,95,70,0.45)]">
        <div className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center">
          <div className="flex min-w-0 flex-1 items-start gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-2xl">
              {meetup.sportIcon || "⚽"}
            </div>
            <div className="min-w-0">
              <h3 className="truncate font-bold text-base text-slate-900 dark:text-slate-100 leading-tight">
                {meetup.title}
              </h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{getSportName(meetup.sport)}</p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="inline-flex rounded-full border border-emerald-200 dark:border-emerald-700/50 bg-emerald-50 dark:bg-emerald-900/40 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                  {skillLabel}
                </span>
                {isHost && (
                  <span className="inline-flex rounded-full border border-emerald-300 bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white">
                    Host
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="grid flex-1 gap-2 text-sm text-slate-600 dark:text-slate-400 sm:grid-cols-2 lg:max-w-xl">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>{formatDate(meetup.date)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>{formatTime(meetup.time)}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-emerald-600 shrink-0" />
              <span className="truncate">{meetup.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>
                {meetup.currentParticipants}/{meetup.maxParticipants} joined
              </span>
            </div>
          </div>

          <div className="ml-auto flex shrink-0 flex-wrap gap-2 lg:justify-end">
            {onView && (
              <Button
                variant="outline"
                onClick={() => onView(meetup.id)}
                className="h-10 rounded-lg border-slate-300 dark:border-slate-600 font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
              >
                View
              </Button>
            )}

            {!isHost && onJoin && !isJoined && (
              <Button
                onClick={() => onJoin(meetup.id)}
                disabled={isFull || loading}
                className="h-10 rounded-lg font-medium"
              >
                {loading ? "Joining..." : isFull ? "Full" : "Join"}
              </Button>
            )}

            {!isHost && onLeave && isJoined && (
              <Button
                variant="outline"
                onClick={() => onLeave(meetup.id)}
                disabled={loading}
                className="h-10 rounded-lg border-rose-300 dark:border-rose-700 bg-rose-100 dark:bg-rose-900/40 font-medium text-rose-700 dark:text-rose-300 hover:bg-rose-200 dark:hover:bg-rose-900/60"
              >
                {loading ? "Leaving..." : "Leave"}
              </Button>
            )}
          </div>
        </div>
      </Card>
    )
  }

  // Grid view (vertical layout)
  return (
    <Card
      className="meetup-card-vertical group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white dark:bg-slate-800/90 dark:border-slate-700/50 p-0 shadow-[0_16px_56px_-32px_rgba(15,23,42,0.45)] transition-all duration-200 hover:-translate-y-1 hover:border-emerald-200 dark:hover:border-emerald-700 hover:shadow-[0_24px_70px_-32px_rgba(6,95,70,0.5)]"
    >
      <div className="flex h-full flex-col p-5">
        <div className="mb-4 flex items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-2xl">
            {meetup.sportIcon || "⚽"}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="mb-1 text-lg font-bold leading-tight text-slate-900 dark:text-slate-100">
              {meetup.title}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">{getSportName(meetup.sport)}</p>
          </div>
        </div>

        <div className="mb-5 space-y-2.5">
          <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-400">
            <Calendar className="h-4 w-4 shrink-0 text-emerald-600" />
            <span>{formatDate(meetup.date)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-400">
            <Clock className="h-4 w-4 shrink-0 text-emerald-600" />
            <span>{formatTime(meetup.time)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-400">
            <MapPin className="h-4 w-4 shrink-0 text-emerald-600" />
            <span className="truncate">{meetup.location}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-400">
            <Users className="h-4 w-4 shrink-0 text-emerald-600" />
            <span>
              {meetup.currentParticipants}/{meetup.maxParticipants} joined
            </span>
          </div>
        </div>

        <div className="mb-5 flex flex-wrap items-center gap-2">
          <span className="inline-flex rounded-full border border-emerald-200 dark:border-emerald-700/50 bg-emerald-50 dark:bg-emerald-900/40 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
            {skillLabel}
          </span>
          <span
            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
              isFull
                ? "bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300"
                : "bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300"
            }`}
          >
            {isFull
              ? "Meetup Full"
              : `${spotsLeft} ${spotsLeft === 1 ? "spot" : "spots"} left`}
          </span>
          {isHost && (
            <span className="inline-flex rounded-full border border-emerald-300 bg-emerald-600 px-3 py-1 text-xs font-semibold text-white">
              Host
            </span>
          )}
        </div>

        <div className="mt-auto flex gap-3 pt-2">
          {onView && (
            <Button
              variant="outline"
              size="lg"
              onClick={() => onView(meetup.id)}
              className="h-11 flex-1 rounded-xl border-slate-300 dark:border-slate-600 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
            >
              View
            </Button>
          )}

          {!isHost && onJoin && !isJoined && (
            <Button
              size="lg"
              onClick={() => onJoin(meetup.id)}
              disabled={isFull || loading}
              className="h-11 flex-1 rounded-xl text-sm font-medium"
            >
              {loading ? "Joining..." : isFull ? "Full" : "Join"}
            </Button>
          )}

          {!isHost && onLeave && isJoined && (
            <Button
              variant="outline"
              size="lg"
              onClick={() => onLeave(meetup.id)}
              disabled={loading}
              className="h-11 flex-1 rounded-xl border-rose-300 dark:border-rose-700 bg-rose-100 dark:bg-rose-900/40 text-sm font-medium text-rose-700 dark:text-rose-300 hover:bg-rose-200 dark:hover:bg-rose-900/60"
            >
              {loading ? "Leaving..." : "Leave"}
            </Button>
          )}
        </div>
      </div>
    </Card>
  )
}
