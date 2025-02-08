
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "./AppSidebar"
import { useLocation, Link, useNavigate } from "react-router-dom"
import { ChevronRight, ArrowLeft } from "lucide-react"
import { Button } from "./ui/button"
import { cn } from "@/lib/utils"

const routeNames: Record<string, string> = {
  "": "Dashboard",
  "inventory": "Inventory",
  "menu": "Menu",
  "waste": "Waste Analytics",
  "staff": "Staff Scheduling",
  "profile": "Profile",
  "roles": "Role Management"
}

export function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const navigate = useNavigate()
  const pathSegments = location.pathname.split('/').filter(Boolean)

  const canGoBack = location.pathname !== '/'

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <main className="flex-1 transition-all duration-200 ease-in-out">
          <nav className="border-b p-4 bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
            <div className="container flex items-center gap-4">
              <SidebarTrigger />
              
              {canGoBack && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate(-1)}
                  className="mr-2"
                  aria-label="Go back"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              )}

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Link 
                  to="/" 
                  className="text-foreground hover:text-primary transition-colors"
                >
                  Home
                </Link>
                {pathSegments.map((segment, index) => (
                  <div key={segment} className="flex items-center">
                    <ChevronRight className="h-4 w-4 mx-1" />
                    <Link
                      to={`/${pathSegments.slice(0, index + 1).join('/')}`}
                      className={cn(
                        "hover:text-primary transition-colors",
                        index === pathSegments.length - 1 ? "text-foreground font-medium" : ""
                      )}
                    >
                      {routeNames[segment] || segment}
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </nav>

          <div className="container py-6 animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}
