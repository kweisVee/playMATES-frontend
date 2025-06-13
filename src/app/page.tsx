import Link from "next/link"
import { SportCard } from "@/components/sport-card"
import { Button } from "@/components/ui/button"
import { MapPin, Calendar, Users } from "lucide-react"

// Sample sports data with updated color scheme
const SPORTS = [
  {
    id: "tennis",
    name: "Tennis",
    icon: "🎾",
    description: "Find partners for singles or doubles matches",
    color: "bg-green-100",
  },
  {
    id: "basketball",
    name: "Basketball",
    icon: "🏀",
    description: "Join pickup games or organized team matches",
    color: "bg-orange-100",
  },
  {
    id: "soccer",
    name: "Soccer",
    icon: "⚽",
    description: "Casual kickabouts or competitive matches",
    color: "bg-blue-100",
  },
  {
    id: "volleyball",
    name: "Volleyball",
    icon: "🏐",
    description: "Beach or indoor volleyball games",
    color: "bg-yellow-100",
  },
  {
    id: "badminton",
    name: "Badminton",
    icon: "🏸",
    description: "Singles, doubles, or group practice sessions",
    color: "bg-purple-100",
  },
  {
    id: "running",
    name: "Running",
    icon: "🏃",
    description: "Group runs, training sessions, or marathons",
    color: "bg-red-100",
  },
  {
    id: "cycling",
    name: "Cycling",
    icon: "🚴",
    description: "Road cycling, mountain biking, or casual rides",
    color: "bg-cyan-100",
  },
  {
    id: "golf",
    name: "Golf",
    icon: "⛳",
    description: "Tee times, practice sessions, or tournaments",
    color: "bg-emerald-100",
  },
]

export default function Home() {
  return (
    <div>
      {/* Hero Section with vibrant gradient background */}
      <section className="bg-gradient-to-b from-primary/20 to-white py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Find Your Perfect <span className="text-primary">PlayMate</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Connect with other sports enthusiasts, create and join meetups, and play your favorite sports together.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="#sports">Browse Sports</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/create">Create Meetup</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose PlayMate?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-primary/15 rounded-full flex items-center justify-center mb-4">
                <MapPin className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Local Meetups</h3>
              <p className="text-muted-foreground">
                Find sports activities happening near you, organized by people in your community.
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-primary/15 rounded-full flex items-center justify-center mb-4">
                <Calendar className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Flexible Scheduling</h3>
              <p className="text-muted-foreground">
                Create or join meetups that fit your schedule, whether you're an early bird or night owl.
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-primary/15 rounded-full flex items-center justify-center mb-4">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Community Focused</h3>
              <p className="text-muted-foreground">
                Connect with like-minded sports enthusiasts and build lasting friendships through play.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Sports Section with updated subtle background */}
      <section id="sports" className="py-16 bg-gradient-to-b from-white to-primary/5">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">Choose Your Sport</h2>
          <p className="text-center text-muted-foreground max-w-2xl mx-auto mb-12">
            Browse through our selection of sports and find the perfect activity for you.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {SPORTS.map((sport) => (
              <Link key={sport.id} href={`/sports/${sport.id}`}>
                <SportCard sport={sport} />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">How PlayMate Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary text-primary-foreground w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                1
              </div>
              <h3 className="text-xl font-semibold mb-2">Choose a Sport</h3>
              <p className="text-muted-foreground">
                Browse through our selection of sports and find the one that interests you the most.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-primary text-primary-foreground w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold mb-2">Find a Meetup</h3>
              <p className="text-muted-foreground">
                Search for existing meetups in your area or create your own if you don't find what you're looking for.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-primary text-primary-foreground w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                3
              </div>
              <h3 className="text-xl font-semibold mb-2">Join & Play</h3>
              <p className="text-muted-foreground">
                Connect with other players, join the meetup, and enjoy playing your favorite sport together.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section with primary color background */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Find Your PlayMate?</h2>
          <p className="text-xl opacity-90 max-w-2xl mx-auto mb-8">
            Join thousands of sports enthusiasts already using PlayMate to connect and play together.
          </p>
          <Button size="lg" variant="secondary" asChild>
            <Link href="/create">Create Your First Meetup</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
