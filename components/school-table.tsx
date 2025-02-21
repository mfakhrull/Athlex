"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

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

interface SchoolTableProps {
  schools: School[]
  isLoading: boolean
  searchTerm: string
}

export function SchoolTable({ schools, isLoading, searchTerm }: SchoolTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>School Name</TableHead>
            <TableHead>School Code</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Contact Person</TableHead>
            <TableHead className="hidden md:table-cell">Phone</TableHead>
            <TableHead className="hidden md:table-cell">Email</TableHead>
            <TableHead className="hidden lg:table-cell">Address</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <LoadingRows />
          ) : schools.length > 0 ? (
            schools.map((school) => (
              <TableRow key={school._id}>
                <TableCell className="font-medium">{school.name}</TableCell>
                <TableCell>{school.schoolCode}</TableCell>
                <TableCell>
                  <Badge
                    variant={school.isActive ? "default" : "secondary"}
                    className={cn(
                      school.isActive ? "bg-green-500" : "bg-gray-500"
                    )}
                  >
                    {school.isActive ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell>{school.contact.contactPerson}</TableCell>
                <TableCell className="hidden md:table-cell">
                  {school.contact.contactPhone}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {school.contact.contactEmail}
                </TableCell>
                <TableCell className="hidden lg:table-cell max-w-xs truncate">
                  {school.address}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={7} className="text-center h-24 text-muted-foreground">
                {searchTerm ? (
                  <>No schools found matching "{searchTerm}"</>
                ) : (
                  "No schools found."
                )}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}

function LoadingRows() {
  return (
    <>
      {[...Array(5)].map((_, i) => (
        <TableRow key={i}>
          <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
          <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
          <TableCell><Skeleton className="h-4 w-[60px]" /></TableCell>
          <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
          <TableCell className="hidden md:table-cell">
            <Skeleton className="h-4 w-[100px]" />
          </TableCell>
          <TableCell className="hidden md:table-cell">
            <Skeleton className="h-4 w-[180px]" />
          </TableCell>
          <TableCell className="hidden lg:table-cell">
            <Skeleton className="h-4 w-[200px]" />
          </TableCell>
        </TableRow>
      ))}
    </>
  )
}