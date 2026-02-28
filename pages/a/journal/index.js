import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useCookies } from "react-cookie";
import { toast } from "react-toastify";
import { Inter, Space_Grotesk } from "next/font/google";
import { BookOpen, Briefcase, ChevronDown, ExternalLink, FileText, Home, LayoutDashboard, LoaderCircle, LogOut, Menu, Plus, Trash2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import api from "@/lib/api";

const headingFont = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-heading",
});

const bodyFont = Inter({
  subsets: ["latin"],
  variable: "--font-body",
});

const navMenus = [
  { title: "Home", description: "Landing and product story", href: "/", icon: Home },
  { title: "Dashboard", description: "Quick start and overview", href: "/a/dashboard", icon: LayoutDashboard },
  { title: "Daily Log", description: "Track daily actions", href: "/a/worklogs", icon: FileText },
  { title: "Job Hunting Tracker", description: "Manage applications and logs", href: "/a/applications", icon: Briefcase },
  { title: "My Journal", description: "Video journals and notes", href: "/a/journal", icon: BookOpen },
];

const PAGE_LIMIT = 10;

function formatDate(iso) {
  if (!iso) return "-";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function JournalIndexPage() {
  const router = useRouter();
  const [cookies, , removeCookie] = useCookies(["auth_token"]);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const centerMenuRef = useRef(null);
  const userMenuRef = useRef(null);
  const modalRef = useRef(null);

  const [journals, setJournals] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    video_url: "",
    content: "",
  });
  const [isCreating, setIsCreating] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const hasMore = journals.length < total;
  const sentinelRef = useRef(null);

  const fetchJournals = useCallback(async (nextPage, reset = false) => {
    if (reset) {
      setIsLoadingList(true);
    } else {
      setIsLoadingMore(true);
    }

    const { data, error } = await api.listJournals({ page: nextPage, limit: PAGE_LIMIT });

    if (error) {
      toast.error(error.message || "Failed to load journals");
      setIsLoadingList(false);
      setIsLoadingMore(false);
      return;
    }

    const incoming = data?.data || [];
    setTotal(data?.total || 0);
    setPage(nextPage);

    setJournals((prev) => {
      if (reset) return incoming;
      return [...prev, ...incoming];
    });

    setIsLoadingList(false);
    setIsLoadingMore(false);
  }, []);

  useEffect(() => {
    const onOutside = (event) => {
      if (centerMenuRef.current && !centerMenuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
      if (isCreateOpen && modalRef.current && !modalRef.current.contains(event.target)) {
        setIsCreateOpen(false);
      }
    };

    document.addEventListener("pointerdown", onOutside);
    return () => document.removeEventListener("pointerdown", onOutside);
  }, [isCreateOpen]);

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
  }, [cookies.auth_token, removeCookie, router]);

  useEffect(() => {
    if (!user) return;
    fetchJournals(1, true);
  }, [user, fetchJournals]);

  useEffect(() => {
    if (!sentinelRef.current || !user) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting && hasMore && !isLoadingMore && !isLoadingList) {
          fetchJournals(page + 1, false);
        }
      },
      { rootMargin: "120px" }
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [fetchJournals, hasMore, isLoadingList, isLoadingMore, page, user]);

  const handleLogout = () => {
    removeCookie("auth_token", { path: "/" });
    router.push("/login");
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCreateJournal = async (event) => {
    event.preventDefault();
    if (isCreating) return;

    setIsCreating(true);
    const payload = {
      title: formData.title.trim(),
      video_url: formData.video_url.trim(),
      content: formData.content.trim(),
    };

    const { error } = await api.createJournal(payload);
    setIsCreating(false);

    if (error) {
      toast.error(error.message || "Failed to create journal");
      return;
    }

    setIsCreateOpen(false);
    setFormData({ title: "", video_url: "", content: "" });
    await fetchJournals(1, true);
  };

  const handleDeleteJournal = async (journalId) => {
    if (deletingId) return;
    if (!confirm("Delete this journal?")) return;

    setDeletingId(journalId);
    const { error } = await api.deleteJournal(journalId);
    setDeletingId(null);

    if (error) {
      toast.error(error.message || "Failed to delete journal");
      return;
    }

    await fetchJournals(1, true);
    toast.success("Journal deleted");
  };

  const userInitial = (user?.name || user?.email || "U").trim().charAt(0).toUpperCase();

  if (isLoading) {
    return (
      <div className={`${bodyFont.className} min-h-screen bg-[#1e1e1e] text-[#d4d4d4] flex items-center justify-center`}>
        <div className="text-sm text-[#9da1a6]">Loading journals...</div>
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
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-[#3c3c3c] bg-[#252526] text-xs font-semibold text-[#9cdcfe]">mf</span>
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
                <div className="border-b border-[#3c3c3c] px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#9da1a6]">Navigation</div>
                <div className="max-h-[60vh] overflow-y-auto py-1">
                  {navMenus.map((item) => {
                    const isActive = router.pathname === item.href;
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.title}
                        href={item.href}
                        className={`block border-b border-[#303030] px-4 py-3 transition-colors last:border-b-0 ${isActive ? "bg-[#2d2d30]" : "hover:bg-[#2d2d30]"}`}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <div className="flex items-start gap-3">
                          <span className="mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-md border border-[#3c3c3c] bg-[#1f1f1f] text-[#9cdcfe]"><Icon className="h-4 w-4" /></span>
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
        <section className="flex min-h-0 w-full flex-col overflow-hidden rounded-lg border border-[#3c3c3c] bg-[#252526]">
          <div className="flex items-center justify-between border-b border-[#3c3c3c] px-4 py-3">
            <div>
              <h1 className="font-[var(--font-heading)] text-2xl text-[#f3f3f3]">My Journal</h1>
              <p className="text-sm text-[#9da1a6]">Video notes and reflections</p>
            </div>
            <Button
              type="button"
              onClick={() => setIsCreateOpen(true)}
              className="h-9 rounded-md bg-[#007acc] px-4 text-sm font-semibold text-white hover:bg-[#0e639c]"
            >
              <Plus className="mr-1.5 h-4 w-4" />
              Create Journal
            </Button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-3">
            {isLoadingList ? (
              <div className="flex h-full items-center justify-center text-sm text-[#9da1a6]">Loading journals...</div>
            ) : journals.length === 0 ? (
              <div className="flex h-full items-center justify-center rounded-md border border-dashed border-[#3c3c3c] bg-[#1f1f1f] text-sm text-[#9da1a6]">
                No journals yet. Create your first entry.
              </div>
            ) : (
              <div className="overflow-hidden rounded-md border border-[#3c3c3c] bg-[#1f1f1f]">
                <table className="w-full table-fixed border-collapse">
                  <thead className="sticky top-0 z-10 bg-[#252526]">
                    <tr className="border-b border-[#3c3c3c]">
                      <th className="w-28 px-3 py-2 text-left text-xs font-semibold uppercase tracking-[0.12em] text-[#9da1a6]">Thumbnail</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-[0.12em] text-[#9da1a6]">Title</th>
                      <th className="w-44 px-3 py-2 text-left text-xs font-semibold uppercase tracking-[0.12em] text-[#9da1a6]">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {journals.map((journal) => (
                      <tr key={journal.id} className="border-b border-[#303030] align-middle last:border-b-0 hover:bg-[#262629]">
                        <td className="px-3 py-2">
                          <div className="h-14 w-24 overflow-hidden rounded border border-[#3c3c3c] bg-[#252526]">
                            {journal.thumbnail_url ? (
                              <img src={journal.thumbnail_url} alt={journal.title} className="h-full w-full object-cover" />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-[11px] text-[#8f9397]">No image</div>
                            )}
                          </div>
                        </td>
                        <td className="px-3 py-2">
                          <p className="truncate text-sm font-semibold text-[#e8e8e8]">{journal.title}</p>
                          <p className="mt-0.5 truncate text-xs text-[#8f9397]">{formatDate(journal.created_at)}</p>
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/a/journal/${journal.id}`}
                              className="inline-flex h-8 items-center gap-1.5 rounded-md border border-[#3c3c3c] bg-[#252526] px-2.5 text-xs font-semibold text-[#9cdcfe] hover:bg-[#2d2d30]"
                            >
                              Open
                              <ExternalLink className="h-3.5 w-3.5" />
                            </Link>
                            <button
                              type="button"
                              onClick={() => handleDeleteJournal(journal.id)}
                              disabled={deletingId === journal.id}
                              className="inline-flex h-8 items-center gap-1 rounded-md border border-[#5a1d1d] bg-[#3a1717] px-2.5 text-xs font-semibold text-[#f48771] hover:bg-[#4a1d1d] disabled:cursor-not-allowed disabled:opacity-70"
                            >
                              {deletingId === journal.id ? (
                                <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <Trash2 className="h-3.5 w-3.5" />
                              )}
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div ref={sentinelRef} className="h-2" />
                {isLoadingMore && (
                  <div className="flex items-center justify-center py-2 text-xs text-[#9da1a6]">
                    <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                    Loading more...
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      </main>

      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 px-3">
          <div ref={modalRef} className="w-full max-w-lg rounded-xl border border-[#3c3c3c] bg-[#252526] shadow-2xl shadow-black/40">
            <div className="flex items-center justify-between border-b border-[#3c3c3c] px-4 py-3">
              <h3 className="font-[var(--font-heading)] text-xl text-[#f3f3f3]">Create Journal</h3>
              <button
                type="button"
                onClick={() => !isCreating && setIsCreateOpen(false)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-[#3c3c3c] bg-[#1f1f1f] text-[#9da1a6] hover:bg-[#2d2d30]"
                aria-label="Close create journal modal"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateJournal} className="space-y-4 px-4 py-4">
              <div>
                <label htmlFor="title" className="mb-1.5 block text-sm font-medium text-[#d4d4d4]">Title</label>
                <input
                  id="title"
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                  disabled={isCreating}
                  className="h-10 w-full rounded-md border border-[#3c3c3c] bg-[#1f1f1f] px-3 text-sm text-[#d4d4d4] outline-none focus:ring-2 focus:ring-[#007acc]/60"
                  placeholder="My YouTube Notes"
                />
              </div>

              <div>
                <label htmlFor="video_url" className="mb-1.5 block text-sm font-medium text-[#d4d4d4]">Video URL</label>
                <input
                  id="video_url"
                  type="url"
                  required
                  value={formData.video_url}
                  onChange={(e) => handleChange("video_url", e.target.value)}
                  disabled={isCreating}
                  className="h-10 w-full rounded-md border border-[#3c3c3c] bg-[#1f1f1f] px-3 text-sm text-[#d4d4d4] outline-none focus:ring-2 focus:ring-[#007acc]/60"
                  placeholder="https://www.youtube.com/watch?v=..."
                />
              </div>

              <div>
                <label htmlFor="content" className="mb-1.5 block text-sm font-medium text-[#d4d4d4]">Initial Notes (optional)</label>
                <textarea
                  id="content"
                  rows={4}
                  value={formData.content}
                  onChange={(e) => handleChange("content", e.target.value)}
                  disabled={isCreating}
                  className="w-full rounded-md border border-[#3c3c3c] bg-[#1f1f1f] px-3 py-2 text-sm text-[#d4d4d4] outline-none focus:ring-2 focus:ring-[#007acc]/60"
                  placeholder="Key points from this video..."
                />
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  disabled={isCreating}
                  onClick={() => setIsCreateOpen(false)}
                  className="border-[#3c3c3c] bg-[#1f1f1f] text-[#d4d4d4] hover:bg-[#2d2d30]"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isCreating}
                  className="bg-[#007acc] text-white hover:bg-[#0e639c] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isCreating ? (
                    <>
                      <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
