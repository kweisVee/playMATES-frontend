"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button 
        variant="outline" 
        size="sm" 
        className="bg-background border-border transition-all duration-300 hover:scale-110 hover:shadow-lg hover:border-primary hover:bg-primary/10"
      >
        <Sun className="h-4 w-4 transition-transform duration-300 hover:rotate-180" />
      </Button>
    )
  }

  return (
    <Button
      variant="outline"
      size="sm"
      className="bg-background border-border text-foreground transition-all duration-300 hover:scale-110 hover:shadow-lg hover:border-primary hover:bg-primary/10 hover:text-primary group"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
    >
      {theme === "light" ? (
        <Moon className="h-4 w-4 transition-transform duration-300 group-hover:rotate-12" />
      ) : (
        <Sun className="h-4 w-4 transition-transform duration-300 group-hover:rotate-180" />
      )}
    </Button>
  )
}