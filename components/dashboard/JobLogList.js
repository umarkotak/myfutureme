import { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function JobLogList({
  logs = [],
  applicationId,
  onAddLog,
  onUpdateLog,
  onLoadMore,
  hasMore = false,
  isLoading = false,
}) {
  const containerRef = useRef(null);
  const bottomRef = useRef(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [editingLogId, setEditingLogId] = useState(null);
  const [editContent, setEditContent] = useState({});
  const saveTimerRef = useRef({});

  // New log form state
  const [newLogText, setNewLogText] = useState("");
  const [newLogDatetime, setNewLogDatetime] = useState(
    new Date().toISOString().slice(0, 16)
  );

  // Auto-scroll to bottom on initial load
  useEffect(() => {
    if (isInitialLoad && logs.length > 0 && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "instant" });
      setIsInitialLoad(false);
    }
  }, [logs, isInitialLoad]);

  // Reset initial load flag when applicationId changes
  useEffect(() => {
    setIsInitialLoad(true);
  }, [applicationId]);

  // Infinite scroll - detect when user scrolls near top
  const handleScroll = useCallback(() => {
    if (!containerRef.current || isLoading || !hasMore) return;

    const { scrollTop } = containerRef.current;
    if (scrollTop < 100) {
      onLoadMore?.();
    }
  }, [isLoading, hasMore, onLoadMore]);

  // Debounced auto-save for editing
  const handleEditChange = useCallback((logId, field, value) => {
    setEditContent((prev) => ({
      ...prev,
      [logId]: {
        ...prev[logId],
        [field]: value,
      },
    }));

    // Clear existing timer for this log
    if (saveTimerRef.current[logId]) {
      clearTimeout(saveTimerRef.current[logId]);
    }

    // Set new timer for 1 second delay
    saveTimerRef.current[logId] = setTimeout(async () => {
      try {
        const log = logs.find((l) => l.id === logId);
        const updates = {
          process_name: editContent[logId]?.process_name ?? log.process_name,
          note: editContent[logId]?.note ?? log.note,
          audio_url: editContent[logId]?.audio_url ?? log.audio_url,
          [field]: value,
        };
        await onUpdateLog(logId, updates);
        toast.success("Log saved");
      } catch (error) {
        toast.error(error.message || "Failed to save log");
      }
    }, 1000);
  }, [logs, editContent, onUpdateLog]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      Object.values(saveTimerRef.current).forEach(clearTimeout);
    };
  }, []);

  // Handle add new log
  const handleAddLog = async (e) => {
    e.preventDefault();
    if (!newLogText.trim()) return;

    try {
      await onAddLog({
        process_name: newLogText,
        note: "",
        datetime: new Date(newLogDatetime).toISOString(),
      });
      setNewLogText("");
      setNewLogDatetime(new Date().toISOString().slice(0, 16));
      toast.success("Log added");

      // Scroll to bottom after adding
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (error) {
      toast.error(error.message || "Failed to add log");
    }
  };

  // Format datetime for display
  const formatDatetime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Sort logs: oldest first (top) to newest (bottom)
  const sortedLogs = [...logs].sort(
    (a, b) => new Date(a.created_at) - new Date(b.created_at)
  );

  return (
    <div className="flex flex-col h-full">
      {/* Log List Container */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
        onScroll={handleScroll}
      >
        {/* Loading indicator at top for infinite scroll */}
        {isLoading && hasMore && (
          <div className="text-center py-2 text-muted-foreground text-sm">
            Loading older logs...
          </div>
        )}

        {sortedLogs.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            No logs yet. Add your first log below.
          </div>
        ) : (
          sortedLogs.map((log) => (
            <div
              key={log.id}
              className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              {/* Log Header */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                  {formatDatetime(log.created_at)}
                </span>
                <input
                  type="text"
                  value={
                    editContent[log.id]?.process_name ?? log.process_name
                  }
                  onChange={(e) =>
                    handleEditChange(log.id, "process_name", e.target.value)
                  }
                  onFocus={() => setEditingLogId(log.id)}
                  className="text-sm font-medium bg-transparent border-none outline-none text-right max-w-[50%] focus:bg-muted/50 rounded px-2"
                  placeholder="Process name"
                />
              </div>

              {/* Log Content */}
              <textarea
                value={editContent[log.id]?.note ?? log.note}
                onChange={(e) =>
                  handleEditChange(log.id, "note", e.target.value)
                }
                onFocus={() => setEditingLogId(log.id)}
                rows={3}
                className="w-full bg-transparent border-none outline-none text-sm resize-none focus:bg-muted/30 rounded p-1"
                placeholder="Add notes..."
              />

              {/* Audio URL */}
              {(log.audio_url || editingLogId === log.id) && (
                <div className="mt-2 pt-2 border-t border-border">
                  <input
                    type="url"
                    value={editContent[log.id]?.audio_url ?? log.audio_url ?? ""}
                    onChange={(e) =>
                      handleEditChange(log.id, "audio_url", e.target.value)
                    }
                    onFocus={() => setEditingLogId(log.id)}
                    className="w-full text-xs bg-transparent border-none outline-none text-primary focus:bg-muted/30 rounded px-1"
                    placeholder="Audio recording URL"
                  />
                </div>
              )}
            </div>
          ))
        )}

        {/* Bottom scroll anchor */}
        <div ref={bottomRef} />
      </div>

      {/* Fixed Input Bar at Bottom */}
      <form
        onSubmit={handleAddLog}
        className="shrink-0 border-t border-border bg-background p-4 flex gap-3 items-center"
      >
        <input
          type="datetime-local"
          value={newLogDatetime}
          onChange={(e) => setNewLogDatetime(e.target.value)}
          className="shrink-0 rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
        <Input
          type="text"
          value={newLogText}
          onChange={(e) => setNewLogText(e.target.value)}
          placeholder="Enter process name (e.g., Phone Screen, Technical Interview)"
          className="flex-1"
        />
        <Button type="submit" disabled={!newLogText.trim() || isLoading}>
          Add Log
        </Button>
      </form>
    </div>
  );
}
