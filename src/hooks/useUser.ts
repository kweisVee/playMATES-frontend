"use client"

import { useState } from "react"
import { UserService, SignUpData, SignInData } from "@/lib/services/user"
import { useAuthContext } from "@/contexts/AuthContext"

export function useUser() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const { login, logout } = useAuthContext()

  const signUp = async (data: SignUpData) => {
    setIsLoading(true)
    setError("")
    console.log("useUser.ts: Sign up starting...");

    try {
      const response = await UserService.signUp(data)

      login(response.token, response.user)
      console.log("useUser.ts: Sign up successful: ", response)

      return response
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "useUser.ts: Sign in failed"
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const signIn = async (data: SignInData) => {
    setIsLoading(true)
    setError("")
    console.log("useUser.ts: Sign In starting...");

    try {
      const response = await UserService.signIn(data)
      
      // IMPORTANT: With httpOnly cookies, the backend will automatically set the cookie
      // We don't need to store the token in localStorage anymore
      // The backend should send: Set-Cookie: token=xyz; HttpOnly; Secure; SameSite=Strict
      
      // Just update the auth context with user data
      login(response.token, response.user)
      console.log("useUser.ts: Sign In successful: ", response)

      return response
    } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "useUser.ts:Sign in failed"
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const signOut = async () => {
    console.log("useUser.ts: Sign Out starting...")
    
    // Call backend to clear the httpOnly cookie
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/user/signout`, {
        method: 'POST',
        credentials: 'include', // Important: sends cookies
      })
    } catch (error) {
      console.error("Failed to sign out on backend:", error)
    }
    
    logout()
    console.log("useUser.ts: Sign Out successful")
  }

  return {
    signUp,
    signIn,
    signOut,
    isLoading,
    error,
  }
} 