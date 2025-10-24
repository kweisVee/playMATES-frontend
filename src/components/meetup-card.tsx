"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, Calendar, Users, Clock } from "lucide-react"
import { Meetup } from "@/lib/services/meetup"
import { cn } from "@/lib/utils"

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
      year: "numeric" 
    })
  }

  return (
    <Card
      className={cn(
        "hover:shadow-lg transition-all duration-200 overflow-hidden",
        meetup.sportColor || "bg-blue-100"
      )}
    >
      <div className="p-6">
        {/* Header with Sport Icon and Title */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="text-4xl">{meetup.sportIcon || "⚽"}</div>
            <div>
              <h3 className="font-semibold text-lg text-foreground">
                {meetup.title}
              </h3>
              <p className="text-sm text-muted-foreground">{meetup.sport}</p>
            </div>
          </div>
          {isHost && (
            <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
              Host
            </span>
          )}
        </div>

        {/* Description */}
        {variant === "full" && meetup.description && (
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
            {meetup.description}
          </p>
        )}

        {/* Meetup Details */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-foreground">
            <Calendar className="h-4 w-4 text-primary" />
            <span>{formatDate(meetup.date)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-foreground">
            <Clock className="h-4 w-4 text-primary" />
            <span>{meetup.time}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-foreground">
            <MapPin className="h-4 w-4 text-primary" />
            <span>{meetup.location}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-foreground">
            <Users className="h-4 w-4 text-primary" />
            <span>
              {meetup.currentParticipants}/{meetup.maxParticipants} players
              {spotsLeft > 0 && (
                <span className="text-muted-foreground ml-1">
                  ({spotsLeft} spots left)
                </span>
              )}
            </span>
          </div>
        </div>

        {/* Skill Level Badge */}
        <div className="mb-4">
          <span className="inline-block bg-background/50 text-xs px-2 py-1 rounded-full capitalize">
            {meetup.skillLevel} Level
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          {onView && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onView(meetup.id)}
              className="flex-1"
            >
              View Details
            </Button>
          )}
          
          {!isHost && onJoin && !isJoined && (
            <Button
              size="sm"
              onClick={() => onJoin(meetup.id)}
              disabled={isFull || loading}
              className="flex-1"
            >
              {loading ? "Joining..." : isFull ? "Full" : "Join"}
            </Button>
          )}
          
          {!isHost && onLeave && isJoined && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onLeave(meetup.id)}
              disabled={loading}
              className="flex-1"
            >
              {loading ? "Leaving..." : "Leave"}
            </Button>
          )}
        </div>
      </div>
    </Card>
  )
}

