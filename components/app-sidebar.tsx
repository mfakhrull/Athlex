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
  Award,
  Layers,
  Timer,
  Home,
  ClipboardList,
  School,
  UserCircle2,
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
        title: "Dashboard",
        url: `/${params.schoolCode}/dashboard`,
        icon: Home,
        items: [
          {
            title: "Overview",
            url: `/${params.schoolCode}/dashboard`,
          },
          {
            title: "Analytics",
            url: `/${params.schoolCode}/dashboard/analytics`,
          },
        ],
      },
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
        title: "Sports (Acara)",
        url: `/${params.schoolCode}/sports`,
        icon: Medal,
        items: [
          {
            title: "Events",
            url: `/${params.schoolCode}/events`,
          },
          {
            title: "List and Register",
            url: `/${params.schoolCode}/sports/register`,
          },
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
        title: "Teams (Rumah Sukan)",
        url: `/${params.schoolCode}/teams`,
        icon: Layers,
        items: [
          {
            title: "List and Rgister",
            url: `/${params.schoolCode}/teams/register`,
          },
        ],
      },
      // {
      //   title: "Competitions",
      //   url: `/${params.schoolCode}/competitions`,
      //   icon: Trophy,
      //   items: [
      //     {
      //       title: "Event List",
      //       url: `/${params.schoolCode}/events`,
      //     },
      //     {
      //       title: "Calendar",
      //       url: `/${params.schoolCode}/competitions/calendar`,
      //     },
      //     {
      //       title: "Results",
      //       url: `/${params.schoolCode}/competitions/results`,
      //     },
      //     {
      //       title: "Achievements",
      //       url: `/${params.schoolCode}/competitions/achievements`,
      //     },
      //   ],
      // },
      
      // {
      //   title: "Age Classes",
      //   url: `/${params.schoolCode}/age-classes`,
      //   icon: Timer,
      //   items: [
      //     {
      //       title: "List",
      //       url: `/${params.schoolCode}/age-classes`,
      //     },
      //     {
      //       title: "Management",
      //       url: `/${params.schoolCode}/age-classes/management`,
      //     },
      //   ],
      // },
      {
        title: "Records",
        url: `/${params.schoolCode}/records`,
        icon: ClipboardList,
        items: [
          {
            title: "School Records",
            url: `/${params.schoolCode}/records/school`,
          },
          {
            title: "Competition Records",
            url: `/${params.schoolCode}/records/competition`,
          },
          {
            title: "Achievement Records",
            url: `/${params.schoolCode}/records/achievements`,
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
          {
            title: "API Documentation",
            url: "/docs/api",
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
          {
            title: "Permissions",
            url: `/${params.schoolCode}/settings/permissions`,
          },
          {
            title: "Notifications",
            url: `/${params.schoolCode}/settings/notifications`,
          },
        ],
      },
    ],
    projects: [
      {
        name: "School Dashboard",
        url: `/${params.schoolCode}/dashboard`,
        icon: School,
      },
      {
        name: "My Profile",
        url: `/${params.schoolCode}/profile`,
        icon: UserCircle2,
      },
      {
        name: "Current Season",
        url: `/${params.schoolCode}/season`,
        icon: Calendar,
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