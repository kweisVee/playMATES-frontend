"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { UserCircle } from "lucide-react"
import { useState } from "react"
import { AuthModal } from "@/components/auth-modal"
import { useAuthContext } from "@/contexts/AuthContext"
import { useUser } from "@/hooks/useUser"
import { ThemeToggle } from "./theme-toggle"
import { usePathname } from "next/navigation"

export function Navbar() {
  const { isAuthenticated, user, isLoading } = useAuthContext()
  const { signOut } = useUser()
  const pathname = usePathname()

  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin")
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  const openSignIn = () => {
    setAuthMode("signin")
    setShowAuthModal(true)
  }

  const openSignUp = () => {
    setAuthMode("signup")
    setShowAuthModal(true)
  }

  const handleLogout = () => {
    setShowLogoutConfirm(true)
  }

  const confirmLogout = async () => {
    setShowLogoutConfirm(false)
    await signOut()
  }

  const navLinkClass = (isActive: boolean) =>
    `relative text-sm font-semibold transition-colors ${
      isActive
        ? "text-emerald-700 after:absolute after:-bottom-2 after:left-0 after:h-0.5 after:w-full after:rounded-full after:bg-emerald-600 dark:text-emerald-300"
        : "text-slate-700 hover:text-emerald-700 dark:text-slate-300 dark:hover:text-emerald-300"
    }`

  return (
    <header className="sticky top-0 z-50 border-b border-emerald-100/70 bg-white/85 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/80">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="group flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-teal-600 text-xs font-black tracking-wide text-white shadow-[0_8px_24px_-10px_rgba(5,150,105,0.8)] transition-transform duration-200 group-hover:scale-105">
            PM
          </span>
          <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100">
            Play
            <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Mate
            </span>
          </span>
        </Link>
        <nav className="hidden md:flex items-center gap-6">
          {isLoading ? null : isAuthenticated ? (
            <>
              <Link href="/dashboard" className={navLinkClass(pathname === "/dashboard")}>
                Dashboard
              </Link>
              <Link
                href="/browse-all-meetups"
                className={navLinkClass(
                  pathname.startsWith("/browse-all-meetups") || pathname.startsWith("/meetup/")
                )}
              >
                Browse Meetups
              </Link>
              <Link href="/my-meetups" className={navLinkClass(pathname.startsWith("/my-meetups"))}>
                My Meetups
              </Link>
              <Link href="/create-meetup" className={navLinkClass(pathname.startsWith("/create-meetup"))}>
                Create Meetup
              </Link>
              {user?.role === "ADMIN" && (
                <Link href="/command" className={navLinkClass(pathname.startsWith("/command"))}>
                  Command
                </Link>
              )}
            </>
          ) : (
            <>
              <Link href="/" className={navLinkClass(pathname === "/")}>
                Home
              </Link>
              <Link href="/all-sports" className={navLinkClass(pathname.startsWith("/all-sports"))}>
                Browse Sports
              </Link>
              <Link href="#" className={navLinkClass(false)}>
                How It Works
              </Link>
              <Link href="#" className={navLinkClass(false)}>
                About
              </Link>
            </>
          )}
        </nav>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          {isLoading ? (
            <div className="text-sm text-slate-500">Loading...</div>
          ) : isAuthenticated ? (
            <>
              <Link
                href="/profile"
                className="flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50/70 px-3 py-2 text-emerald-800 transition-colors hover:bg-emerald-100/80 dark:border-slate-700 dark:bg-slate-900 dark:text-emerald-300 dark:hover:bg-slate-800"
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

      {/* Logout Confirmation Dialog */}
      <Dialog open={showLogoutConfirm} onOpenChange={setShowLogoutConfirm}>
        <DialogContent className="sm:max-w-sm rounded-2xl">
          <DialogTitle className="text-lg font-bold text-slate-900 dark:text-slate-100">
            Log Out
          </DialogTitle>
          <DialogDescription className="text-slate-500 dark:text-slate-400">
            Are you sure you want to log out?
          </DialogDescription>
          <DialogFooter className="flex gap-2 sm:flex-row">
            <Button
              variant="outline"
              onClick={() => setShowLogoutConfirm(false)}
              className="flex-1 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300"
            >
              Cancel
            </Button>
            <Button
              onClick={confirmLogout}
              className="flex-1 bg-slate-800 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 text-white"
            >
              Log Out
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </header>
  )
}
