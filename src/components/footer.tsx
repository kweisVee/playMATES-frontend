import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t py-8 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-bold mb-4">
              Play<span className="text-primary">Mate</span>
            </h3>
            <p className="text-sm text-muted-foreground">
              Connect with other players and organize sports meetups in your area.
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-3">Sports</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/sports/tennis" className="text-muted-foreground hover:text-primary transition-colors">
                  Tennis
                </Link>
              </li>
              <li>
                <Link href="/sports/basketball" className="text-muted-foreground hover:text-primary transition-colors">
                  Basketball
                </Link>
              </li>
              <li>
                <Link href="/sports/soccer" className="text-muted-foreground hover:text-primary transition-colors">
                  Soccer
                </Link>
              </li>
              <li>
                <Link href="/sports/volleyball" className="text-muted-foreground hover:text-primary transition-colors">
                  Volleyball
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-3">Company</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  Careers
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  Blog
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-3">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} PlayMate. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
