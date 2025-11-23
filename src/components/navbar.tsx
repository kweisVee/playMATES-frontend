"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { UserCircle } from "lucide-react"
import { useState } from "react"
import { AuthModal } from "@/components/auth-modal"
import { useAuthContext } from "@/contexts/AuthContext"
import { useUser } from "@/hooks/useUser"
import { ThemeToggle } from "./theme-toggle"

export function Navbar() {
  const { isAuthenticated, user, isLoading } = useAuthContext()
  const { signOut } = useUser()

  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin")

  
  const openSignIn = () => {
    setAuthMode("signin")
    setShowAuthModal(true)
  }

  const openSignUp = () => {
    setAuthMode("signup")
    setShowAuthModal(true)
  }

  const handleLogout = async () => {
    await signOut()
  } 

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl font-bold">
            Play<span className="text-primary">Mate</span>
          </span>
        </Link>
        <nav className="hidden md:flex items-center gap-6">
          {isAuthenticated ? (
            <>
              <Link href="/dashboard" className="text-sm font-medium hover:text-primary transition-colors">
                Dashboard
              </Link>
              <Link href="/browse-all-meetups" className="text-sm font-medium hover:text-primary transition-colors">
                Browse Meetups
              </Link>
              <Link href="/my-meetups" className="text-sm font-medium hover:text-primary transition-colors">
                My Meetups
              </Link>
              <Link href="/create-meetup" className="text-sm font-medium hover:text-primary transition-colors">
                Create Meetup
              </Link>
            </>
          ) : (
            <>
              <Link href="/" className="text-sm font-medium hover:text-primary transition-colors">
                Home
              </Link>
              <Link href="/all-sports" className="text-sm font-medium hover:text-primary transition-colors">
                Browse Sports
              </Link>
              <Link href="#" className="text-sm font-medium hover:text-primary transition-colors">
                How It Works
              </Link>
              <Link href="#" className="text-sm font-medium hover:text-primary transition-colors">
                About
              </Link>
            </>
          )}
        </nav>
        <div className="flex items-center gap-3">
        <ThemeToggle />
        {isLoading ? (
            <div className="text-sm text-gray-500">Loading...</div>
          ) : isAuthenticated ? (
            <>
              <Link 
                href="/profile" 
                className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-primary/10 transition-colors cursor-pointer"
                onClick={() => console.log("Username clicked! Navigating to /profile...")}
              >
                <UserCircle className="h-4 w-4" />
                <span className="hidden lg:inline text-sm font-medium">{user?.firstName}</span>
              </Link>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" size="sm" className="hidden md:flex items-center gap-2" onClick={openSignIn}>
                <UserCircle className="h-4 w-4" />
                Sign In
              </Button>
              <Button size="sm" onClick={openSignUp}>
                Sign Up
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        mode={authMode}
        onToggleMode={() => setAuthMode(authMode === "signin" ? "signup" : "signin")}
      />
    </header>
  )
}
