import Link from "next/link";
import { useRouter } from "next/router";
import { Geist } from "next/font/google";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const navItems = [
  {
    id: "applications",
    label: "Job Applications",
    href: "/applications",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    id: "worklogs",
    label: "Work Logs",
    href: "/worklogs",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
  },
];

export default function DashboardLayout({
  user,
  onLogout,
  activeSection,
  children,
  isLoading = false,
}) {
  const router = useRouter();

  const currentNav = navItems.find((item) => item.id === activeSection);

  if (isLoading) {
    return (
      <div className={`${geistSans.className} min-h-screen bg-background flex items-center justify-center`}>
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className={`${geistSans.className} h-screen bg-background flex flex-col`}>
      {/* Header */}
      <header className="h-12 border-b border-border bg-background/95 backdrop-blur flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-br from-primary to-orange-400 rounded-md flex items-center justify-center">
              <span className="text-white font-bold text-xs">W</span>
            </div>
            <span className="text-sm font-semibold bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent">
              WorkNote
            </span>
          </Link>
          <div className="h-4 w-px bg-border" />
          <span className="text-sm font-medium text-foreground">
            {currentNav?.label || activeSection}
          </span>
        </div>
        <div className="flex items-center gap-3">
          {user && (
            <span className="text-sm text-muted-foreground">
              {user.name || user.email}
            </span>
          )}
          <Button size="sm" variant="ghost" onClick={onLogout}>
            Logout
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex min-h-0">
        {/* Sidebar Navigation - Icon Only */}
        <nav className="w-14 border-r border-border bg-muted/30 p-2 shrink-0 flex flex-col items-center">
          <div className="space-y-2">
            {navItems.map((item) => {
              const isActive = item.id === activeSection;
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  title={item.label}
                  className={cn(
                    "flex items-center justify-center w-10 h-10 rounded-lg transition-all",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  {item.icon}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Main Panel */}
        <div className="flex-1 flex flex-col min-w-0">
          {children}
        </div>
      </div>
    </div>
  );
}
