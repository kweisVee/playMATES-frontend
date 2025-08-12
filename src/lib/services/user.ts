import { API_BASE_URL, API_ENDPOINTS, getDefaultHeaders } from "@/lib/config/api"

// TypeScript interface for signup data
export interface SignUpData {
  firstName: string
  lastName: string
  username: string
  email: string
  password: string
  city: string
  state: string
  country: string
}

export interface SignInData {
  email: string
  password: string
}

// Service class for user API calls
export class UserService {
  static async signUp(data: SignUpData) {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH.SIGNUP}`, {
      method: "POST",
      headers: getDefaultHeaders(),
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Sign up failed")
    }

    return response.json()
  }

  static async signIn(data: SignInData) {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH.SIGNIN}`, {
      method: "POST",
      headers: getDefaultHeaders(),
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Sign in failed")
    }

    return response.json()
  }
} 