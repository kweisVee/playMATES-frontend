import { API_BASE_URL, API_ENDPOINTS, getAuthHeaders } from "@/lib/config/api"

export interface Sport {
    id: number
    name: string 
    definition?: string
    imageUrl?: string
    category?: string
    isActive: boolean
    createdBy: number
    createdAt: string
    updatedAt: string
    creator: {
        id: number
        username: string
    }
}

export interface CreateSportData {
  name: string
  definition?: string
  category?: string
  imageUrl?: string
}

export class SportService {
  static async createSport(data: CreateSportData): Promise<Sport> {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.SPORT.CREATE}`, {
      method: "POST",
      headers: getAuthHeaders(),
      credentials: "include",
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: "Failed to create sport" }))
      throw new Error(errorData.message || "Failed to create sport")
    }

    return response.json()
  }

  static async getAllSports(): Promise<Sport[]> {
    console.log("sport.ts: SportService: Get All Sports starting...")

        const url = `${API_BASE_URL}${API_ENDPOINTS.SPORT.LIST}`
        const headers = getAuthHeaders()

        console.log("API call URL:", url)
        console.log("Headers being sent:", headers)

        const response = await fetch(url, {
            method: "GET",
            headers: headers,
            credentials: "include", // Send cookies with request
        })
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: "sport.ts: SportService: Failed to fetch sports" }))
            throw new Error(errorData.message || "sport.ts: SportService: Failed to fetch sports")
        }

        return response.json()
    }
}