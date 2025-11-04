// API Configuration
export const API_BASE_URL = "http://localhost:3001/api"

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    SIGNUP: "/user",
    SIGNIN: "/user/signin",
    GET_PROFILE: "/user/profile",
    UPDATE_PROFILE: "/user/profile"
  },
  MEETUP: {
    LIST: "/meetup",
    CREATE: "/meetup",
    GET_BY_ID: (id: string) => `/meetup/${id}`,
    UPDATE: (id: string) => `/meetup/${id}`,
    DELETE: (id: string) => `/meetup/${id}`,
    JOIN: (id: string) => `/meetup/${id}/join`,
    LEAVE: (id: string) => `/meetup/${id}/leave`,
    USER_MEETUPS: "/user/meetups"
  },
  SPORT: {
    LIST: "/sports",
    CREATE: "/sports",
    GET_BY_ID: (id: string) => `/sports/${id}`,
  }
} as const

export const getDefaultHeaders = () => ({
  "Content-Type": "application/json",
  // "api-version": "v1", // Temporarily commented out due to CORS
})

export const getAuthHeaders = () => {
  // With httpOnly cookies, we don't need to manually add Authorization header
  // The cookie is automatically sent with credentials: 'include'
  return {
    "Content-Type": "application/json",
    // "api-version": "v1", // Temporarily commented out due to CORS
  }
}