"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { User } from "@/lib/services/user"
import { UserService } from "@/lib/services/user"

interface AuthContextType {
  user: User | null // Stores user data (firstName, email, etc.)
  isAuthenticated: boolean // True if user is logged in, false if not
  isLoading: boolean //needed for signing in and refreshing the page
  login: (token: string, user: User) => void // Login function
  logout: () => void // Logout function
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // With httpOnly cookies, we can't check if a cookie exists from JavaScript
        // Instead, we try to get the profile. If the cookie is valid, it will work
        // If not, the backend will return an error
        try {
          const userData = await UserService.getProfile()
          setUser(userData)
          setIsAuthenticated(true)
          console.log("AuthContext: User authenticated via cookie")
        } catch (error) {
          console.log("AuthContext: No valid session cookie found")
          setUser(null)
          setIsAuthenticated(false)
        }
      } catch (error) {
        console.error("AuthContext: authProvider: Token validation failed: ", error)
        setUser(null)
        setIsAuthenticated(false)
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()
  }, [])

  const login = (token: string, userData: User) => {
    // With httpOnly cookies, the backend sets the cookie automatically
    // We don't need to store anything in localStorage
    // Just update the context state
    setUser(userData)
    setIsAuthenticated(true)
    setIsLoading(false)
  }

  const logout = () => {
    // The cookie will be cleared by the backend via the signout endpoint
    // We just need to clear the local state
    setUser(null)
    setIsAuthenticated(false)
    setIsLoading(false)
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuthContext = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider")
  }
  return context
}
