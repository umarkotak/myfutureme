import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { useCookies } from "react-cookie";
import { toast } from "react-toastify";
import api from "@/lib/api";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import TreeView from "@/components/dashboard/TreeView";
import DetailPanel from "@/components/dashboard/DetailPanel";
import JobApplicationForm from "@/components/dashboard/JobApplicationForm";
import JobLogList from "@/components/dashboard/JobLogList";
import WorkLogPanel from "@/components/dashboard/WorkLogPanel";

export default function Dashboard() {
  const router = useRouter();
  const [cookies, , removeCookie] = useCookies(["auth_token"]);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("applications");

  // Job Applications state
  const [applications, setApplications] = useState([]);
  const [applicationLogs, setApplicationLogs] = useState({});
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  const [parentApplication, setParentApplication] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterState, setFilterState] = useState("");

  // Work Logs state
  const [workLogs, setWorkLogs] = useState([]);

  // Form state
  const [showForm, setShowForm] = useState(null); // 'application' | 'logs' | null
  const [editingItem, setEditingItem] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Auth check
  useEffect(() => {
    const checkAuth = async () => {
      if (!cookies.auth_token) {
        router.push("/login");
        return;
      }
      try {
        const userData = await api.getCurrentUser();
        setUser(userData);
      } catch (error) {
        console.error("Auth error:", error);
        removeCookie("auth_token", { path: "/" });
        router.push("/login");
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, [router]);

  // Load applications
  const loadApplications = useCallback(async () => {
    try {
      const result = await api.listJobApplications({
        search: searchQuery,
        state: filterState,
      });
      setApplications(result.data || []);
    } catch (error) {
      console.error("Failed to load applications:", error);
      toast.error("Failed to load applications");
    }
  }, [searchQuery, filterState]);

  // Load work logs
  const loadWorkLogs = useCallback(async () => {
    try {
      const result = await api.listWorkLogs();
      setWorkLogs(result.data || []);
    } catch (error) {
      console.error("Failed to load work logs:", error);
      toast.error("Failed to load work logs");
    }
  }, []);

  useEffect(() => {
    if (user) {
      loadApplications();
      loadWorkLogs();
    }
  }, [user, loadApplications, loadWorkLogs]);

  // Load logs for an application
  const loadLogsForApplication = async (applicationId) => {
    try {
      const result = await api.listJobApplicationLogs(applicationId);
      setApplicationLogs((prev) => ({
        ...prev,
        [applicationId]: result.data || [],
      }));
    } catch (error) {
      console.error("Failed to load logs:", error);
      toast.error("Failed to load logs");
    }
  };

  // Load work log by date
  const loadWorkLogByDate = async (date) => {
    try {
      return await api.getWorkLogByDate(date);
    } catch {
      return null;
    }
  };

  // Selection handlers
  const handleSelect = (item, type, parent = null) => {
    setSelectedItem(item);
    setSelectedType(type);
    setParentApplication(parent);
    setShowForm(null);
  };

  // Application CRUD
  const handleSaveApplication = async (data) => {
    setIsSaving(true);
    try {
      if (editingItem) {
        await api.updateJobApplication(editingItem.id, data);
        toast.success("Application updated");
      } else {
        await api.createJobApplication(data);
        toast.success("Application created");
      }
      await loadApplications();
      setShowForm(null);
      setEditingItem(null);
      setSelectedItem(null);
    } catch (error) {
      console.error("Failed to save application:", error);
      toast.error(error.message || "Failed to save application");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteApplication = async () => {
    if (!selectedItem || selectedType !== "application") return;
    if (!confirm("Delete this application and all its logs?")) return;
    try {
      await api.deleteJobApplication(selectedItem.id);
      await loadApplications();
      setSelectedItem(null);
      setSelectedType(null);
      toast.success("Application deleted");
    } catch (error) {
      console.error("Failed to delete:", error);
      toast.error(error.message || "Failed to delete application");
    }
  };

  // Log CRUD - for JobLogList component
  const handleAddLog = async (data) => {
    const appId = parentApplication?.id || selectedItem?.id;
    if (!appId) return;

    await api.createJobApplicationLog(appId, data);
    await loadLogsForApplication(appId);
  };

  const handleUpdateLog = async (logId, data) => {
    const appId = parentApplication?.id || selectedItem?.id;
    if (!appId) return;

    await api.updateJobApplicationLog(appId, logId, data);
    await loadLogsForApplication(appId);
  };

  const handleDeleteLog = async () => {
    if (!selectedItem || selectedType !== "log") return;
    if (!confirm("Delete this log?")) return;
    try {
      const appId = parentApplication?.id;
      await api.deleteJobApplicationLog(appId, selectedItem.id);
      await loadLogsForApplication(appId);
      setSelectedItem(null);
      setSelectedType(null);
      toast.success("Log deleted");
    } catch (error) {
      console.error("Failed to delete log:", error);
      toast.error(error.message || "Failed to delete log");
    }
  };

  // Work log save
  const handleSaveWorkLog = async (data) => {
    try {
      await api.upsertWorkLog(data);
      await loadWorkLogs();
      toast.success("Work log saved");
    } catch (error) {
      console.error("Failed to save work log:", error);
      toast.error(error.message || "Failed to save work log");
    }
  };

  // Logout
  const handleLogout = () => {
    removeCookie("auth_token", { path: "/" });
    router.push("/login");
  };

  // View logs for an application
  const handleViewLogs = (application) => {
    setParentApplication(application);
    loadLogsForApplication(application.id);
    setShowForm("logs");
  };

  // Get current application's logs
  const currentAppLogs = parentApplication
    ? applicationLogs[parentApplication.id] || []
    : [];

  return (
    <DashboardLayout
      user={user}
      onLogout={handleLogout}
      activeSection={activeSection}
      onSectionChange={setActiveSection}
      isLoading={isLoading}
    >
      {activeSection === "applications" && (
        <div className="flex-1 flex min-h-0">
          {/* Left: Tree or Form or Log List */}
          <div className="w-80 border-r border-border flex flex-col min-h-0">
            {showForm === "application" ? (
              <JobApplicationForm
                application={editingItem}
                onSave={handleSaveApplication}
                onCancel={() => {
                  setShowForm(null);
                  setEditingItem(null);
                }}
                isLoading={isSaving}
              />
            ) : showForm === "logs" ? (
              <div className="flex flex-col h-full">
                <div className="shrink-0 p-3 border-b border-border bg-muted/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-sm">
                        {parentApplication?.company_name}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {parentApplication?.job_title}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setShowForm(null);
                        setParentApplication(null);
                      }}
                      className="text-xs text-muted-foreground hover:text-foreground"
                    >
                      ← Back
                    </button>
                  </div>
                </div>
                <JobLogList
                  logs={currentAppLogs}
                  applicationId={parentApplication?.id}
                  onAddLog={handleAddLog}
                  onUpdateLog={handleUpdateLog}
                  isLoading={isSaving}
                />
              </div>
            ) : (
              <TreeView
                applications={applications}
                applicationLogs={applicationLogs}
                selectedItem={selectedItem}
                selectedType={selectedType}
                onSelect={handleSelect}
                onAddNew={() => {
                  setShowForm("application");
                  setEditingItem(null);
                }}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                filterState={filterState}
                onFilterChange={setFilterState}
                onLoadLogs={loadLogsForApplication}
                onViewLogs={handleViewLogs}
              />
            )}
          </div>

          {/* Right: Detail Panel */}
          <div className="flex-1 min-w-0">
            <DetailPanel
              selectedItem={selectedItem}
              selectedType={selectedType}
              parentApplication={parentApplication}
              onEdit={() => {
                setEditingItem(selectedItem);
                setShowForm("application");
              }}
              onDelete={selectedType === "application" ? handleDeleteApplication : handleDeleteLog}
              onViewLogs={handleViewLogs}
            />
          </div>
        </div>
      )}

      {activeSection === "worklogs" && (
        <WorkLogPanel
          workLogs={workLogs}
          onSave={handleSaveWorkLog}
          onLoadLog={loadWorkLogByDate}
          isLoading={isSaving}
        />
      )}
    </DashboardLayout>
  );
}
