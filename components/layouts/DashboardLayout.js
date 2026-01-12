import Link from "next/link";
import { Geist } from "next/font/google";
import ActivityBar from "@/components/dashboard/ActivityBar";
import { Button } from "@/components/ui/button";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export default function DashboardLayout({
  user,
  onLogout,
  activeSection,
  onSectionChange,
  children,
  isLoading = false,
}) {
  const sectionTitles = {
    applications: "Job Applications",
    worklogs: "Work Logs",
  };

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
            {sectionTitles[activeSection] || activeSection}
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
        {/* Activity Bar */}
        <ActivityBar
          activeSection={activeSection}
          onSectionChange={onSectionChange}
        />

        {/* Main Panel */}
        <div className="flex-1 flex flex-col min-w-0">
          {children}
        </div>
      </div>
    </div>
  );
}
