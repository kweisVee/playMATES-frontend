import { API_BASE_URL, 
        API_ENDPOINTS, 
        getDefaultHeaders, 
        getAuthHeaders
  } from "@/lib/config/api"


export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  city: string
  state: string
  country: string
}

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
    console.log("user.ts: UserService: Sign up starting...");
    console.log("api call: ", `${API_BASE_URL}${API_ENDPOINTS.AUTH.SIGNUP}`);
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
    console.log("user.ts: UserService: Sign in starting...");
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

  static async getProfile() {
    console.log("user.ts: UserService: Get Profile starting...");
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH.GET_PROFILE}`, {
      method: "GET", 
      headers: getAuthHeaders(),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Get Profile failed");
    }

    return response.json()

  }
} 