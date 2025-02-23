import { LucideIcon } from "lucide-react"

export interface Season {
  _id: string
  name: string
  startDate: Date
  endDate: Date
  isActive: boolean
  logo?: LucideIcon
}
