"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Building2, 
  Mail, 
  Phone, 
  User2 
} from "lucide-react"
import { cn } from "@/lib/utils"

interface SchoolCardProps {
  school: {
    _id: string
    name: string
    schoolCode: string
    logo: string
    address: string
    contact: {
      contactPerson: string
      contactPhone: string
      contactEmail: string
    }
    isActive?: boolean
  }
}

export function SchoolCard({ school }: SchoolCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="flex flex-row items-center gap-3 p-4">
        <Avatar className="h-12 w-12 sm:h-14 sm:w-14">
          <AvatarImage src={school.logo} alt={school.name} />
          <AvatarFallback className="text-base sm:text-lg">{school.name[0]}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-base sm:text-base ">
              {school.name}
            </CardTitle>
            <Badge 
              variant={school.isActive ? "default" : "secondary"}
              className={cn(
                "ml-auto shrink-0 text-xs",
                school.isActive ? "bg-green-500" : "bg-gray-500"
              )}
            >
              {school.isActive ? "Active" : "Inactive"}
            </Badge>
          </div>
          <CardDescription className="text-xs sm:text-sm">
            Code: {school.schoolCode}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="grid gap-2">
          <div className="flex items-center gap-2">
            <Building2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground shrink-0" />
            <span className="text-xs sm:text-sm truncate">{school.address}</span>
          </div>
          <div className="flex items-center gap-2">
            <User2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground shrink-0" />
            <span className="text-xs sm:text-sm truncate">{school.contact.contactPerson}</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground shrink-0" />
            <span className="text-xs sm:text-sm truncate">{school.contact.contactPhone}</span>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground shrink-0" />
            <span className="text-xs sm:text-sm truncate">{school.contact.contactEmail}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}