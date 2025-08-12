"use client"

import { useState } from "react"
import { UserService, SignUpData, SignInData } from "@/lib/services/user"

export function useUser() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const signUp = async (data: SignUpData) => {
    setIsLoading(true)
    setError("")

    try {
      const response = await UserService.signUp(data)
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

    try {
      const response = await UserService.signIn(data)
      return response
    } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "useUser.ts:Sign in failed"
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  return {
    signUp,
    signIn,
    isLoading,
    error,
  }
} 