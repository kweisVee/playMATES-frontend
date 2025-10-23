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
    const url = `${API_BASE_URL}${API_ENDPOINTS.AUTH.SIGNUP}`;
    const headers = getDefaultHeaders();
    console.log("API call URL:", url);
    console.log("Headers being sent:", headers);
    console.log("Request body:", JSON.stringify(data));
    
    const response = await fetch(url, {
      method: "POST",
      headers: headers,
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
    const url = `${API_BASE_URL}${API_ENDPOINTS.AUTH.SIGNIN}`;
    const headers = getDefaultHeaders();
    console.log("API call URL:", url);
    console.log("Headers being sent:", headers);
    console.log("Request body:", JSON.stringify(data));
    
    const response = await fetch(url, {
      method: "POST",
      headers: headers,
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
    const url = `${API_BASE_URL}${API_ENDPOINTS.AUTH.GET_PROFILE}`;
    const headers = getAuthHeaders();
    console.log("API call URL:", url);
    console.log("Headers being sent:", headers);
    
    const response = await fetch(url, {
      method: "GET", 
      headers: headers,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Get Profile failed");
    }

    return response.json()
  }
} 