"use client"

import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { toast } from "sonner"
import { SchoolTable } from "@/components/school-table"

interface School {
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

export default function SchoolsPage() {
  const [schools, setSchools] = useState<School[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchSchools()
  }, [])

  const fetchSchools = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/schools/get")
      if (!response.ok) {
        throw new Error("Failed to fetch schools")
      }
      const data = await response.json()
      setSchools(data)
    } catch (error) {
      console.error("Error fetching schools:", error)
      toast.error("Failed to load schools", {
        description: "Please try again later.",
        duration: 5000,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const filteredSchools = schools.filter((school) =>
    school.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="container mx-auto p-4 sm:p-6">
      <div className="flex flex-col gap-4 sm:gap-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold">Schools</h1>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search schools..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <SchoolTable 
          schools={filteredSchools}
          isLoading={isLoading}
          searchTerm={searchTerm}
        />
      </div>
    </div>
  )
}