import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { useCookies } from "react-cookie";
import { toast } from "react-toastify";
import api from "@/lib/api";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import WorkLogPanel from "@/components/dashboard/WorkLogPanel";

export default function WorkLogsPage() {
  const router = useRouter();
  const [cookies, , removeCookie] = useCookies(["auth_token"]);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Work Logs state
  const [workLogs, setWorkLogs] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  // Auth check
  useEffect(() => {
    const checkAuth = async () => {
      if (!cookies.auth_token) {
        router.push("/login");
        return;
      }
      const { data, error } = await api.getCurrentUser();
      if (error) {
        console.error("Auth error:", error);
        removeCookie("auth_token", { path: "/" });
        router.push("/login");
      } else {
        setUser(data);
      }
      setIsLoading(false);
    };
    checkAuth();
  }, [router]);

  // Load work logs
  const loadWorkLogs = useCallback(async () => {
    const { data, error } = await api.listWorkLogs();
    if (error) {
      console.error("Failed to load work logs:", error);
      toast.error("Failed to load work logs");
      return;
    }
    setWorkLogs(data.data || []);
  }, []);

  useEffect(() => {
    if (user) {
      loadWorkLogs();
    }
  }, [user, loadWorkLogs]);

  // Load work log by date
  const loadWorkLogByDate = async (date) => {
    const { data, error } = await api.getWorkLogByDate(date);
    if (error) {
      // 404 is expected when no log exists for that date
      return null;
    }
    return data;
  };

  // Work log save
  const handleSaveWorkLog = async (logData) => {
    const { error } = await api.upsertWorkLog(logData);
    if (error) {
      console.error("Failed to save work log:", error);
      toast.error(error.message || "Failed to save work log");
      return;
    }
    await loadWorkLogs();
  };

  // Work log delete
  const handleDeleteWorkLog = async (date) => {
    const { error } = await api.deleteWorkLog(date);
    if (error) {
      console.error("Failed to delete work log:", error);
      throw new Error(error.message || "Failed to delete work log");
    }
    await loadWorkLogs();
  };

  // Logout
  const handleLogout = () => {
    removeCookie("auth_token", { path: "/" });
    router.push("/login");
  };

  return (
    <DashboardLayout
      user={user}
      onLogout={handleLogout}
      activeSection="worklogs"
      isLoading={isLoading}
    >
      <WorkLogPanel
        workLogs={workLogs}
        onSave={handleSaveWorkLog}
        onDelete={handleDeleteWorkLog}
        onLoadLog={loadWorkLogByDate}
        isLoading={isSaving}
      />
    </DashboardLayout>
  );
}
