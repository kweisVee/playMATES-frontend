"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { User } from "@/lib/services/user"

interface AuthContextType {
  user: User | null // Stores user data (firstName, email, etc.)
  isAuthenticated: boolean // True if user is logged in, false if not
  login: (token: string, user: User) => void // Login function
  logout: () => void // Logout function
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  
  useEffect(() => {
    const token = localStorage.getItem("token")
    if (token) {
      setIsAuthenticated(true)
      // You might want to fetch user data here
    }
  }, [])

  const login = (token: string, userData: User) => {
    localStorage.setItem("token", token)
    setUser(userData)
    setIsAuthenticated(true)
  }

  const logout = () => {
    localStorage.removeItem("token")
    setUser(null)
    setIsAuthenticated(false)
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
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
