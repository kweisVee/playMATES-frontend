"use client"

import { ProtectedRoute } from "@/components/protected-route"
import { useAuthContext } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Shield, Plus, CheckCircle2 } from "lucide-react"
import { useState } from "react"
import { SportService, CreateSportData } from "@/lib/services/sport"
import { useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"

export default function CommandPage() {
  const { user } = useAuthContext()
  const queryClient = useQueryClient()
  const router = useRouter()

  const [sportForm, setSportForm] = useState<CreateSportData>({
    name: "",
    category: "",
    definition: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // Redirect non-admins
  if (user && user.role !== "ADMIN") {
    router.replace("/dashboard")
    return null
  }

  const handleCreateSport = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!sportForm.name.trim()) {
      setError("Sport name is required.")
      return
    }
    try {
      setLoading(true)
      setError("")
      setSuccess("")
      await SportService.createSport(sportForm)
      await queryClient.invalidateQueries({ queryKey: ["sports"] })
      setSportForm({ name: "", category: "", definition: "" })
      setSuccess(`"${sportForm.name}" has been added to the sports list.`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create sport.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <ProtectedRoute>
      <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-emerald-50 via-white to-teal-50/60 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <div className="pointer-events-none absolute -left-24 top-16 h-80 w-80 rounded-full bg-emerald-300/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 top-40 h-72 w-72 rounded-full bg-cyan-300/20 blur-3xl" />

        {/* Header */}
        <section className="py-10 md:py-12">
          <div className="container mx-auto px-4">
            <div className="relative overflow-hidden rounded-[2rem] border border-emerald-200/60 bg-gradient-to-br from-emerald-700 via-emerald-800 to-teal-800 p-8 text-white shadow-[0_24px_64px_-24px_rgba(6,95,70,0.9)] md:p-10">
              <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
              <div className="pointer-events-none absolute -bottom-20 -left-10 h-48 w-48 rounded-full bg-teal-300/20 blur-3xl" />
              <div className="relative z-10 flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/20">
                  <Shield className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-black md:text-5xl">Command</h1>
                  <p className="mt-1 text-lg text-emerald-100/85">
                    Admin controls — only you can see this
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="container mx-auto max-w-2xl px-4 pb-12">

          {/* Add Sport */}
          <Card className="rounded-3xl border-emerald-100/80 dark:border-slate-700/50 bg-white/80 dark:bg-slate-900/80 p-6 shadow-[0_22px_70px_-38px_rgba(15,23,42,0.45)] backdrop-blur-sm md:p-8">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/40">
                <Plus className="h-5 w-5 text-emerald-700 dark:text-emerald-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Add a Sport</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  New sports appear in the meetup creator for all users.
                </p>
              </div>
            </div>

            <form onSubmit={handleCreateSport} className="space-y-5">
              <div>
                <Label htmlFor="sport-name" className="text-slate-700 dark:text-slate-300">
                  Sport Name *
                </Label>
                <Input
                  id="sport-name"
                  placeholder="e.g., Pickleball"
                  value={sportForm.name}
                  onChange={(e) => setSportForm({ ...sportForm, name: e.target.value })}
                  className="mt-2 h-11 border-emerald-200 dark:border-slate-700 focus-visible:ring-emerald-500"
                />
              </div>

              <div>
                <Label htmlFor="sport-category" className="text-slate-700 dark:text-slate-300">
                  Category
                </Label>
                <Input
                  id="sport-category"
                  placeholder="e.g., Racket Sports"
                  value={sportForm.category}
                  onChange={(e) => setSportForm({ ...sportForm, category: e.target.value })}
                  className="mt-2 h-11 border-emerald-200 dark:border-slate-700 focus-visible:ring-emerald-500"
                />
              </div>

              <div>
                <Label htmlFor="sport-definition" className="text-slate-700 dark:text-slate-300">
                  Description
                </Label>
                <textarea
                  id="sport-definition"
                  placeholder="Brief description of the sport..."
                  value={sportForm.definition}
                  onChange={(e) => setSportForm({ ...sportForm, definition: e.target.value })}
                  className="mt-2 min-h-[100px] w-full rounded-md border border-emerald-200 dark:border-slate-700 bg-background dark:bg-slate-800 p-3 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              {error && (
                <p className="rounded-lg bg-rose-50 dark:bg-rose-900/30 px-4 py-2 text-sm text-rose-600 dark:text-rose-300">
                  {error}
                </p>
              )}

              {success && (
                <div className="flex items-center gap-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 px-4 py-2 text-sm text-emerald-700 dark:text-emerald-300">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  {success}
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="h-11 w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-[0_16px_32px_-16px_rgba(13,148,136,0.85)] hover:from-emerald-700 hover:to-teal-700"
              >
                {loading ? "Adding..." : "Add Sport"}
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  )
}
