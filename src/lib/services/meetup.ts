import { API_BASE_URL, API_ENDPOINTS, getAuthHeaders } from "@/lib/config/api"

// Sport object as returned by backend (subset of full Sport interface)
export interface MeetupSport {
  id: number
  name: string
}

// TypeScript interfaces for meetup data
export interface Meetup {
  id: string
  title: string
  description: string
  sport: string | MeetupSport  // Backend can return either string or object
  sportIcon?: string
  sportColor?: string
  hostId: string
  hostName?: string
  location: string
  city?: string
  state?: string
  date: string
  time: string
  maxParticipants: number
  currentParticipants: number
  skillLevel: "beginner" | "intermediate" | "advanced" | "all"
  status: "upcoming" | "ongoing" | "completed" | "cancelled"
  participants?: Participant[]
  createdAt?: string
  updatedAt?: string
}

// Utility function to extract sport name from either string or object
// This ensures consistent handling across the codebase
export function getSportName(sport: string | MeetupSport | undefined): string {
  if (!sport) return ""
  if (typeof sport === "string") {
    return sport
  }
  if (typeof sport === "object" && "name" in sport) {
    return sport.name
  }
  return "Unknown Sport"
}

export interface Participant {
  id: string
  firstName: string
  lastName: string
  joinedAt?: string
}

export interface CreateMeetupData {
  title: string
  description: string
  sport: string
  sportIcon?: string
  sportColor?: string
  location: string
  city?: string
  state?: string
  date: string
  time: string
  maxParticipants: number
  skillLevel: "beginner" | "intermediate" | "advanced" | "all"
}

export interface UpdateMeetupData extends Partial<CreateMeetupData> {
  status?: "upcoming" | "ongoing" | "completed" | "cancelled"
}

export interface MeetupFilters {
  sport?: string
  location?: string
  city?: string
  state?: string
  date?: string
  skillLevel?: string
  search?: string
}

export interface UserMeetups {
  hosting: Meetup[]
  joined: Meetup[]
}

// Service class for meetup API calls
export class MeetupService {
  static async getMeetups(filters?: MeetupFilters) {
    console.log("meetup.ts: MeetupService: Get Meetups starting...")
    
    // Build query string from filters
    const queryParams = new URLSearchParams()
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value)
      })
    }
    
    const queryString = queryParams.toString()
    const url = `${API_BASE_URL}${API_ENDPOINTS.MEETUP.LIST}${queryString ? `?${queryString}` : ""}`
    const headers = getAuthHeaders()
    
    console.log("API call URL:", url)
    console.log("Headers being sent:", headers)
    
    const response = await fetch(url, {
      method: "GET",
      headers: headers,
      credentials: "include", // Send cookies with request
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: "Failed to fetch meetups" }))
      throw new Error(errorData.message || "Failed to fetch meetups")
    }

    return response.json()
  }

  static async getMeetupById(id: string) {
    console.log("meetup.ts: MeetupService: Get Meetup By ID starting...")
    const url = `${API_BASE_URL}${API_ENDPOINTS.MEETUP.GET_BY_ID(id)}`
    const headers = getAuthHeaders()
    
    console.log("API call URL:", url)
    console.log("Headers being sent:", headers)
    
    const response = await fetch(url, {
      method: "GET",
      headers: headers,
      credentials: "include", // Send cookies with request
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: "Failed to fetch meetup" }))
      throw new Error(errorData.message || "Failed to fetch meetup")
    }

    return response.json()
  }

  static async createMeetup(data: CreateMeetupData) {
    console.log("meetup.ts: MeetupService: Create Meetup starting...")
    const url = `${API_BASE_URL}${API_ENDPOINTS.MEETUP.CREATE}`
    const headers = getAuthHeaders()
    
    console.log("API call URL:", url)
    console.log("Headers being sent:", headers)
    console.log("Request body:", JSON.stringify(data))
    
    const response = await fetch(url, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(data),
      credentials: "include", // Send cookies with request
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: "meetup.ts: MeetupService: Failed to create meetup" }))
      throw new Error(errorData.message || "meetup.ts: MeetupService: Failed to create meetup")
    }

    return response.json()
  }

  static async updateMeetup(id: string, data: UpdateMeetupData) {
    console.log("meetup.ts: MeetupService: Update Meetup starting...")
    const url = `${API_BASE_URL}${API_ENDPOINTS.MEETUP.UPDATE(id)}`
    const headers = getAuthHeaders()
    
    console.log("API call URL:", url)
    console.log("Headers being sent:", headers)
    console.log("Request body:", JSON.stringify(data))
    
    const response = await fetch(url, {
      method: "PUT",
      headers: headers,
      body: JSON.stringify(data),
      credentials: "include", // Send cookies with request
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: "meetup.ts: MeetupService: Failed to update meetup" }))
      throw new Error(errorData.message || "meetup.ts: MeetupService: Failed to update meetup")
    }

    return response.json()
  }

  static async deleteMeetup(id: string) {
    console.log("meetup.ts: MeetupService: Delete Meetup starting...")
    const url = `${API_BASE_URL}${API_ENDPOINTS.MEETUP.DELETE(id)}`
    const headers = getAuthHeaders()
    
    console.log("API call URL:", url)
    console.log("Headers being sent:", headers)
    
    const response = await fetch(url, {
      method: "DELETE",
      headers: headers,
      credentials: "include", // Send cookies with request
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: "meetup.ts: MeetupService: Failed to delete meetup" }))
      throw new Error(errorData.message || "meetup.ts: MeetupService: Failed to delete meetup")
    }

    return response.json()
  }

  static async joinMeetup(id: string) {
    console.log("meetup.ts: MeetupService: Join Meetup starting...")
    const url = `${API_BASE_URL}${API_ENDPOINTS.MEETUP.JOIN(id)}`
    const headers = getAuthHeaders()
    
    console.log("API call URL:", url)
    console.log("Headers being sent:", headers)
    
    const response = await fetch(url, {
      method: "POST",
      headers: headers,
      credentials: "include", // Send cookies with request
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: "meetup.ts: MeetupService: Failed to join meetup" }))
      throw new Error(errorData.message || "meetup.ts: MeetupService: Failed to join meetup")
    }

    return response.json()
  }

  static async leaveMeetup(id: string) {
    console.log("meetup.ts: MeetupService: Leave Meetup starting...")
    const url = `${API_BASE_URL}${API_ENDPOINTS.MEETUP.LEAVE(id)}`
    const headers = getAuthHeaders()
    
    console.log("API call URL:", url)
    console.log("Headers being sent:", headers)
    
    const response = await fetch(url, {
      method: "POST",
      headers: headers,
      credentials: "include", // Send cookies with request
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: "meetup.ts: MeetupService: Failed to leave meetup" }))
      throw new Error(errorData.message || "meetup.ts: MeetupService: Failed to leave meetup")
    }

    return response.json()
  }

  static async getUserMeetups(): Promise<UserMeetups> {
    console.log("meetup.ts: MeetupService: Get User Meetups starting...")
    const url = `${API_BASE_URL}${API_ENDPOINTS.MEETUP.USER_MEETUPS}`
    const headers = getAuthHeaders()
    
    console.log("API call URL:", url)
    console.log("Headers being sent:", headers)
    
    const response = await fetch(url, {
      method: "GET",
      headers: headers,
      credentials: "include", // Send cookies with request
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: "meetup.ts: MeetupService: Failed to fetch user meetups" }))
      throw new Error(errorData.message || "meetup.ts: MeetupService: Failed to fetch user meetups")
    }

    return response.json()
  }
}

