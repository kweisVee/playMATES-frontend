import { useQuery } from "@tanstack/react-query"
import { SportService, Sport } from "@/lib/services/sport"

export function useSports() {
  return useQuery<Sport[], Error>({
    queryKey: ["sports"],
    queryFn: SportService.getAllSports,
  })
}