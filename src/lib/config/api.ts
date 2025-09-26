// API Configuration
export const API_BASE_URL = "http://localhost:3001/api"

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    SIGNUP: "/user",
    SIGNIN: "/user/signin",
  },
} as const

export const getDefaultHeaders = () => ({
  "Content-Type": "application/json",
})

export const getAuthHeaders = () => {
  const token = localStorage.getItem("token")
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  }
}