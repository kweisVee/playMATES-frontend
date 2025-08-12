// API Configuration
export const API_BASE_URL = "http://localhost:3001/api"

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    SIGNUP: "/user",
    SIGNIN: "/user/signin",
  },
} as const

// Common headers
export const getDefaultHeaders = () => ({
  "Content-Type": "application/json",
})