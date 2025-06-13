import { Card, CardContent } from "@/components/ui/card"

interface Sport {
  id: string
  name: string
  icon: string
  description: string
  color: string
}

interface SportCardProps {
  sport: Sport
}

export function SportCard({ sport }: SportCardProps) {
  return (
    <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
      <CardContent className={`p-6 ${sport.color} rounded-t-lg`}>
        <div className="text-center py-4">
          <span className="text-5xl">{sport.icon}</span>
        </div>
      </CardContent>
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-1">{sport.name}</h3>
        <p className="text-sm text-muted-foreground">{sport.description}</p>
      </div>
    </Card>
  )
}
