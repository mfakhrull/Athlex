"use client"

import * as React from "react"
import {
  Calendar,
  Trophy,
  Users,
  Medal,
  BookOpen,
  Settings2,
  CircleUser,
  Loader2,
} from "lucide-react"
import { useParams } from "next/navigation"
import { toast } from "sonner"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import { SeasonSwitcher } from "@/components/season-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { Season } from "@/interfaces/season"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const params = useParams();
  const [seasons, setSeasons] = React.useState<Season[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchSeasons = async () => {
      try {
        const response = await fetch(`/api/seasons?schoolCode=${params.schoolCode}`);
        if (response.ok) {
          const data = await response.json();
          setSeasons(data);
        } else {
          console.error("Failed to fetch seasons");
        }
      } catch (error) {
        console.error("Error loading seasons");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSeasons();
  }, [params.schoolCode]);

  const navData = {
    user: {
      name: "mfakhrull",
      email: "mfakhrull@example.com",
      avatar: "/avatars/user.jpg",
    },
    navMain: [
      {
        title: "Athletes",
        url: `/${params.schoolCode}/athletes`,
        icon: Users,
        items: [
          {
            title: "List",
            url: `/${params.schoolCode}/athletes/list`,
          },
          {
            title: "Register",
            url: `/${params.schoolCode}/athletes/register`,
          },
        ],
      },
      {
        title: "Sports",
        url: `/${params.schoolCode}/sports`,
        icon: Medal,
        items: [
          {
            title: "All Sports",
            url: `/${params.schoolCode}/sports`,
          },
          {
            title: "Results",
            url: `/${params.schoolCode}/sports/results`,
          },
          {
            title: "Rankings",
            url: `/${params.schoolCode}/sports/rankings`,
          },
        ],
      },
      {
        title: "Documentation",
        url: "/docs",
        icon: BookOpen,
        items: [
          {
            title: "Getting Started",
            url: "/docs/getting-started",
          },
          {
            title: "User Guide",
            url: "/docs/guide",
          },
        ],
      },
      {
        title: "Settings",
        url: `/${params.schoolCode}/settings`,
        icon: Settings2,
        items: [
          {
            title: "General",
            url: `/${params.schoolCode}/settings/general`,
          },
          {
            title: "School Profile",
            url: `/${params.schoolCode}/settings/profile`,
          },
          {
            title: "Users",
            url: `/${params.schoolCode}/settings/users`,
          },
        ],
      },
    ],
    projects: [
      {
        name: "Dashboard",
        url: `/${params.schoolCode}/dashboard`,
        icon: Calendar,
      },
      {
        name: "My Profile",
        url: `/${params.schoolCode}/profile`,
        icon: CircleUser,
      },
    ],
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SeasonSwitcher seasons={seasons} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navData.navMain} />
        <NavProjects projects={navData.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={navData.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}