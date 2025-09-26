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
      localStorage.setItem("token", response.token)

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