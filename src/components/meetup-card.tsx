"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, Calendar, Users, Clock } from "lucide-react"
import { Meetup, getSportName } from "@/lib/services/meetup"
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

  // List view (horizontal layout)
  if (variant === "full") {
    return (
      <Card className="meetup-card-horizontal bg-white border-2 border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all duration-200 overflow-hidden">
        <div className="px-6 py-4 flex items-center gap-6">
          {/* Icon and Title Section */}
          <div className="flex items-center gap-3 min-w-[250px]">
            <div className="text-3xl">{meetup.sportIcon || "⚽"}</div>
            <div>
              <h3 className="font-bold text-base text-foreground leading-tight">
                {meetup.title}
              </h3>
              <p className="text-sm text-gray-500">{getSportName(meetup.sport)}</p>
            </div>
          </div>

          {/* Date and Time */}
          <div className="min-w-[140px]">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <span>{formatDate(meetup.date)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
              <Clock className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <span>{meetup.time}</span>
            </div>
          </div>

          {/* Location */}
          <div className="flex items-center gap-2 text-sm text-gray-600 min-w-[160px]">
            <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" />
            <span className="truncate">{meetup.location}</span>
          </div>

          {/* Participants */}
          <div className="flex items-center gap-2 text-sm text-gray-600 min-w-[60px]">
            <Users className="h-4 w-4 text-gray-400 flex-shrink-0" />
            <span>{meetup.currentParticipants}/{meetup.maxParticipants}</span>
          </div>

          {/* Skill Level */}
          <div className="min-w-[120px]">
            <span className="inline-block bg-gray-100 text-gray-700 text-sm px-3 py-1.5 rounded-lg capitalize font-medium">
              {meetup.skillLevel === "all" ? "All Levels" : meetup.skillLevel}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 ml-auto">
            {onView && (
              <Button
                variant="outline"
                onClick={() => onView(meetup.id)}
                className="text-sm px-6 h-10 border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium rounded-lg"
              >
                View
              </Button>
            )}
            
            {!isHost && onJoin && !isJoined && (
              <Button
                onClick={() => onJoin(meetup.id)}
                disabled={isFull || loading}
                className="text-sm px-6 h-10 font-medium rounded-lg"
              >
                {loading ? "Joining..." : isFull ? "Full" : "Join"}
              </Button>
            )}
            
            {!isHost && onLeave && isJoined && (
              <Button
                variant="outline"
                onClick={() => onLeave(meetup.id)}
                disabled={loading}
                className="text-sm px-6 h-10 border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium rounded-lg"
              >
                {loading ? "Leaving..." : "Leave"}
              </Button>
            )}
          </div>

          {isHost && (
            <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full whitespace-nowrap ml-2">
              Host
            </span>
          )}
        </div>
      </Card>
    )
  }

  // Grid view (vertical layout)
  return (
    <Card
      className="meetup-card-vertical bg-white border-2 border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all duration-200 overflow-hidden"
    >
      <div className="p-6">
        {/* Header with Sport Icon and Title */}
        <div className="flex items-start gap-3 mb-4">
          <div className="text-4xl">{meetup.sportIcon || "⚽"}</div>
          <div className="flex-1">
            <h3 className="font-bold text-lg text-foreground leading-tight mb-1">
              {meetup.title}
            </h3>
            <p className="text-sm text-gray-500">{getSportName(meetup.sport)}</p>
          </div>
          {isHost && (
            <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full whitespace-nowrap">
              Host
            </span>
          )}
        </div>

        {/* Meetup Details */}
        <div className="space-y-2.5 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <Calendar className="h-4 w-4 text-gray-400 flex-shrink-0" />
            <span>{formatDate(meetup.date)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <Clock className="h-4 w-4 text-gray-400 flex-shrink-0" />
            <span>{meetup.time}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" />
            <span>{meetup.location}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <Users className="h-4 w-4 text-gray-400 flex-shrink-0" />
            <span>{meetup.currentParticipants}/{meetup.maxParticipants} spots available</span>
          </div>
        </div>

        {/* Skill Level Badge */}
        <div className="mb-6">
          <span className="inline-block bg-gray-100 text-gray-700 text-sm px-4 py-2 rounded-lg capitalize font-medium">
            {meetup.skillLevel === "all" ? "All Levels" : meetup.skillLevel}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          {onView && (
            <Button
              variant="outline"
              size="lg"
              onClick={() => onView(meetup.id)}
              className="flex-1 text-sm h-12 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-medium rounded-xl"
            >
              View
            </Button>
          )}
          
          {!isHost && onJoin && !isJoined && (
            <Button
              size="lg"
              onClick={() => onJoin(meetup.id)}
              disabled={isFull || loading}
              className="flex-1 text-sm h-12 font-medium rounded-xl"
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
              className="flex-1 text-sm h-12 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-medium rounded-xl"
            >
              {loading ? "Leaving..." : "Leave"}
            </Button>
          )}
        </div>
      </div>
    </Card>
  )
}

