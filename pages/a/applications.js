import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { useCookies } from "react-cookie";
import { toast } from "react-toastify";
import { Inter, Space_Grotesk } from "next/font/google";
import { Briefcase, BookOpen, ChevronDown, FileText, Home, LayoutDashboard, LogOut, Menu } from "lucide-react";

import api from "@/lib/api";
import TreeView from "@/components/dashboard/TreeView";
import DetailPanel from "@/components/dashboard/DetailPanel";
import JobApplicationForm from "@/components/dashboard/JobApplicationForm";
import { Button } from "@/components/ui/button";

const headingFont = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-heading",
});

const bodyFont = Inter({
  subsets: ["latin"],
  variable: "--font-body",
});

const navMenus = [
  {
    title: "Home",
    description: "Landing and product story",
    href: "/",
    icon: Home,
  },
  {
    title: "Dashboard",
    description: "Quick start and overview",
    href: "/a/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Daily Log",
    description: "Track daily actions",
    href: "/a/worklogs",
    icon: FileText,
  },
  {
    title: "Job Hunting Tracker",
    description: "Manage applications and logs",
    href: "/a/applications",
    icon: Briefcase,
  },
  {
    title: "My Journal",
    description: "Video journals and notes",
    href: "/a/journal",
    icon: BookOpen,
  },
];

export default function ApplicationsPage() {
  const router = useRouter();
  const [cookies, , removeCookie] = useCookies(["auth_token"]);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const centerMenuRef = useRef(null);
  const userMenuRef = useRef(null);

  const [applications, setApplications] = useState([]);
  const [applicationLogs, setApplicationLogs] = useState({});
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterState, setFilterState] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (centerMenuRef.current && !centerMenuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener("pointerdown", handleOutsideClick);
    return () => document.removeEventListener("pointerdown", handleOutsideClick);
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      if (!cookies.auth_token) {
        router.push("/login");
        return;
      }

      const { data, error } = await api.getCurrentUser();
      if (error) {
        removeCookie("auth_token", { path: "/" });
        router.push("/login");
      } else {
        setUser(data);
      }

      setIsLoading(false);
    };

    checkAuth();
  }, [router, cookies.auth_token, removeCookie]);

  const loadApplications = useCallback(async () => {
    const { data, error } = await api.listJobApplications({
      search: searchQuery,
      state: filterState,
    });

    if (error) {
      toast.error("Failed to load applications");
      return;
    }

    setApplications(data.data || []);
  }, [searchQuery, filterState]);

  useEffect(() => {
    if (user) {
      loadApplications();
    }
  }, [user, loadApplications]);

  const loadLogsForApplication = async (applicationId) => {
    const { data, error } = await api.listJobApplicationLogs(applicationId);

    if (error) {
      if (error.status === 404) {
        setApplicationLogs((prev) => ({
          ...prev,
          [applicationId]: [],
        }));
        return;
      }

      toast.error("Failed to load logs");
      return;
    }

    setApplicationLogs((prev) => ({
      ...prev,
      [applicationId]: data.data || [],
    }));
  };

  const handleSelectApplication = (application) => {
    setSelectedApplication(application);
    setShowForm(false);

    if (application && !applicationLogs[application.id]) {
      loadLogsForApplication(application.id);
    }
  };

  const handleSaveApplication = async (formData) => {
    setIsSaving(true);
    const isEditing = !!editingItem;

    if (isEditing) {
      const { error } = await api.updateJobApplication(editingItem.id, formData);
      if (error) {
        toast.error(error.message || "Failed to update application");
        setIsSaving(false);
        return;
      }
      toast.success("Application updated");
    } else {
      const { error } = await api.createJobApplication(formData);
      if (error) {
        toast.error(error.message || "Failed to create application");
        setIsSaving(false);
        return;
      }
      toast.success("Application created");
    }

    await loadApplications();
    setShowForm(false);
    setEditingItem(null);

    if (!isEditing) {
      setSelectedApplication(null);
    } else {
      const { data } = await api.getJobApplication(selectedApplication.id);
      if (data) {
        setSelectedApplication(data);
      }
    }

    setIsSaving(false);
  };

  const handleDeleteApplication = async () => {
    if (!selectedApplication) return;
    if (!confirm("Delete this application and all its logs?")) return;

    const { error } = await api.deleteJobApplication(selectedApplication.id);
    if (error) {
      toast.error(error.message || "Failed to delete application");
      return;
    }

    await loadApplications();
    setSelectedApplication(null);
    toast.success("Application deleted");
  };

  const handleAddLog = async (logData) => {
    if (!selectedApplication) return;

    const { error } = await api.createJobApplicationLog(selectedApplication.id, logData);
    if (error) {
      toast.error(error.message || "Failed to add log");
      return;
    }

    await loadLogsForApplication(selectedApplication.id);
  };

  const handleUpdateLog = async (logId, logData) => {
    if (!selectedApplication) return;

    const { error } = await api.updateJobApplicationLog(selectedApplication.id, logId, logData);
    if (error) {
      toast.error(error.message || "Failed to update log");
      return;
    }

    await loadLogsForApplication(selectedApplication.id);
  };

  const handleLogout = () => {
    removeCookie("auth_token", { path: "/" });
    router.push("/login");
  };

  const currentLogs = selectedApplication ? applicationLogs[selectedApplication.id] || [] : [];
  const userInitial = (user?.name || user?.email || "U").trim().charAt(0).toUpperCase();

  if (isLoading) {
    return (
      <div className={`${bodyFont.className} min-h-screen bg-[#1e1e1e] text-[#d4d4d4] flex items-center justify-center`}>
        <div className="text-sm text-[#9da1a6]">Loading applications...</div>
      </div>
    );
  }

  return (
    <div
      className={`${bodyFont.className} ${headingFont.variable} min-h-screen bg-background text-foreground`}
      style={{
        "--background": "#1e1e1e",
        "--foreground": "#d4d4d4",
        "--card": "#252526",
        "--card-foreground": "#d4d4d4",
        "--popover": "#252526",
        "--popover-foreground": "#d4d4d4",
        "--primary": "#007acc",
        "--primary-foreground": "#ffffff",
        "--secondary": "#2d2d30",
        "--secondary-foreground": "#d4d4d4",
        "--muted": "#2a2a2d",
        "--muted-foreground": "#9da1a6",
        "--accent": "#2d2d30",
        "--accent-foreground": "#d4d4d4",
        "--destructive": "#f48771",
        "--border": "#3c3c3c",
        "--input": "#3c3c3c",
        "--ring": "#007acc",
      }}
    >
      <header className="sticky top-0 z-40 border-b border-[#3c3c3c] bg-[#1e1e1e]/95 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-[1600px] items-center justify-between px-3 sm:px-4">
          <div className="flex w-[180px] items-center justify-start">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-[#3c3c3c] bg-[#252526] text-xs font-semibold text-[#9cdcfe]">
                mf
              </span>
              <span className="font-[var(--font-heading)] text-lg tracking-tight text-[#e8e8e8]">my future me</span>
            </Link>
          </div>

          <div ref={centerMenuRef} className="relative flex flex-1 justify-center">
            <button
              type="button"
              onClick={() => setIsMenuOpen((prev) => !prev)}
              className="inline-flex h-9 items-center gap-2 rounded-md border border-[#3c3c3c] bg-[#252526] px-4 text-sm font-medium text-[#d4d4d4] transition-colors hover:bg-[#2d2d30]"
              aria-expanded={isMenuOpen}
              aria-label="Open navigation menu"
            >
              <Menu className="h-4 w-4 text-[#9cdcfe]" />
              Menu
              <ChevronDown className="h-4 w-4" />
            </button>

            {isMenuOpen && (
              <div className="absolute top-12 w-[min(94vw,560px)] overflow-hidden rounded-xl border border-[#3c3c3c] bg-[#252526] shadow-2xl shadow-black/40">
                <div className="border-b border-[#3c3c3c] px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#9da1a6]">
                  Navigation
                </div>
                <div className="max-h-[60vh] overflow-y-auto py-1">
                  {navMenus.map((item) => {
                    const isActive = router.pathname === item.href;
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.title}
                        href={item.href}
                        className={`block border-b border-[#303030] px-4 py-3 transition-colors last:border-b-0 ${
                          isActive ? "bg-[#2d2d30]" : "hover:bg-[#2d2d30]"
                        }`}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <div className="flex items-start gap-3">
                          <span className="mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-md border border-[#3c3c3c] bg-[#1f1f1f] text-[#9cdcfe]">
                            <Icon className="h-4 w-4" />
                          </span>
                          <div>
                            <div className="text-sm font-medium text-[#e8e8e8]">{item.title}</div>
                            <div className="mt-0.5 text-xs text-[#9da1a6]">{item.description}</div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div ref={userMenuRef} className="relative flex w-[180px] justify-end">
            <button
              type="button"
              onClick={() => setIsUserMenuOpen((prev) => !prev)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#3c3c3c] bg-[#252526] text-sm font-semibold text-[#9cdcfe] transition-colors hover:bg-[#2d2d30]"
              aria-expanded={isUserMenuOpen}
              aria-label="Open user menu"
            >
              {userInitial}
            </button>

            {isUserMenuOpen && (
              <div className="absolute right-0 top-12 w-64 rounded-xl border border-[#3c3c3c] bg-[#252526] p-1 shadow-2xl shadow-black/40">
                <div className="border-b border-[#3c3c3c] px-3 py-2">
                  <p className="truncate text-sm font-medium text-[#e8e8e8]">{user?.name || "User"}</p>
                  <p className="truncate text-xs text-[#9da1a6]">{user?.email || ""}</p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  className="mt-1 h-9 w-full justify-start gap-2 rounded-md px-3 text-sm text-[#f48771] hover:bg-[#3a1717] hover:text-[#ffb4a5]"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto flex h-[calc(100vh-64px)] w-full max-w-[1600px] min-h-0 p-2 sm:p-2">
        <div className="flex min-h-0 w-full overflow-hidden rounded-lg border border-[#3c3c3c] bg-[#252526]">
          <div className="w-[360px] border-r border-[#3c3c3c] bg-[#1f1f1f] min-h-0">
            {showForm ? (
              <JobApplicationForm
                application={editingItem}
                onSave={handleSaveApplication}
                onCancel={() => {
                  setShowForm(false);
                  setEditingItem(null);
                }}
                isLoading={isSaving}
              />
            ) : (
              <TreeView
                applications={applications}
                selectedItem={selectedApplication}
                onSelect={handleSelectApplication}
                onAddNew={() => {
                  setShowForm(true);
                  setEditingItem(null);
                }}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                filterState={filterState}
                onFilterChange={setFilterState}
              />
            )}
          </div>

          <div className="min-w-0 flex-1 bg-[#252526]">
            <DetailPanel
              selectedApplication={selectedApplication}
              logs={currentLogs}
              onEdit={() => {
                setEditingItem(selectedApplication);
                setShowForm(true);
              }}
              onDelete={handleDeleteApplication}
              onAddLog={handleAddLog}
              onUpdateLog={handleUpdateLog}
              isLoading={isSaving}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
