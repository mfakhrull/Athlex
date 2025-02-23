"use client"

import * as React from "react"
import { ChevronsUpDown, Plus, Trophy } from "lucide-react"
import { format } from "date-fns"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { AddSeasonForm } from "@/components/add-season-form"
import { useSeason } from "@/contexts/SeasonContext"
import { Season } from "@/interfaces/season"

export function SeasonSwitcher({ seasons }: { seasons: Season[] }) {
  const { isMobile } = useSidebar()
  const { currentSeason, setCurrentSeason } = useSeason()
  const [showAddDialog, setShowAddDialog] = React.useState(false)

  // Set first season as active if none selected
  React.useEffect(() => {
    if (!currentSeason && seasons.length > 0) {
      setCurrentSeason(seasons[0])
    }
  }, [seasons, currentSeason, setCurrentSeason])

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <Trophy className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">
                  {currentSeason?.name || "No Season Selected"}
                </span>
                <span className="truncate text-xs">
                  {currentSeason ? (
                    `${format(new Date(currentSeason.startDate), "MMM yyyy")} - ${format(
                      new Date(currentSeason.endDate),
                      "MMM yyyy"
                    )}`
                  ) : (
                    "Optional"
                  )}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Seasons
            </DropdownMenuLabel>
            {seasons.map((season, index) => (
              <DropdownMenuItem
                key={season._id}
                onClick={() => setCurrentSeason(season)}
                className="gap-2 p-2"
              >
                <div className="flex size-6 items-center justify-center rounded-sm border">
                  <Trophy className="size-4 shrink-0" />
                </div>
                {season.name}
                <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
              </DropdownMenuItem>
            ))}
            {seasons.length > 0 && <DropdownMenuSeparator />}
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <DropdownMenuItem
                  className="gap-2 p-2"
                  onSelect={(e) => {
                    e.preventDefault()
                  }}
                >
                  <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                    <Plus className="size-4" />
                  </div>
                  <div className="font-medium text-muted-foreground">
                    Add season
                  </div>
                </DropdownMenuItem>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Season</DialogTitle>
                  <DialogDescription>
                    Create a new season for managing sports activities.
                  </DialogDescription>
                </DialogHeader>
                <AddSeasonForm
                  onSuccess={(newSeason) => {
                    setShowAddDialog(false)
                    if (!currentSeason) {
                      setCurrentSeason(newSeason)
                    }
                  }}
                />
              </DialogContent>
            </Dialog>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}