import { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "react-toastify";
import Markdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, MoreHorizontal, Trash2 } from "lucide-react";

function formatDateForInput(dateStr) {
  if (!dateStr) return "";
  return dateStr.split("T")[0];
}

function formatMonthYear(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

function formatBubbleDate(dateStr) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return "Today";
  } else if (date.toDateString() === yesterday.toDateString()) {
    return "Yesterday";
  }
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export default function WorkLogPanel({
  workLogs = [],
  onSave,
  onDelete,
  onLoadLog,
  isLoading,
}) {
  const containerRef = useRef(null);
  const bottomRef = useRef(null);
  const [content, setContent] = useState("");
  const [selectedDate, setSelectedDate] = useState(() => {
    return new Date().toISOString().split("T")[0];
  });
  const [editingLogId, setEditingLogId] = useState(null);
  const [editContent, setEditContent] = useState({});
  const [collapsedMonths, setCollapsedMonths] = useState({});
  const saveTimerRef = useRef({});

  // Sort logs by date (oldest first, newest at bottom like Slack)
  const sortedLogs = [...workLogs].sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );

  // Auto-scroll to bottom on initial load
  useEffect(() => {
    if (sortedLogs.length > 0 && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "instant" });
    }
  }, [workLogs.length]);

  // Debounced auto-save for editing
  const handleEditChange = useCallback((logId, value) => {
    setEditContent((prev) => ({
      ...prev,
      [logId]: value,
    }));

    // Clear existing timer
    if (saveTimerRef.current[logId]) {
      clearTimeout(saveTimerRef.current[logId]);
    }

    // Set new timer for 1 second delay
    const log = sortedLogs.find((l) => l.id === logId);
    saveTimerRef.current[logId] = setTimeout(async () => {
      try {
        await onSave({
          date: formatDateForInput(log.date),
          content: value,
        });
        toast.success("Work log saved");
      } catch (error) {
        toast.error(error.message || "Failed to save");
      }
    }, 1000);
  }, [sortedLogs, onSave]);

  // Cleanup timers
  useEffect(() => {
    return () => {
      Object.values(saveTimerRef.current).forEach(clearTimeout);
    };
  }, []);

  // Handle add new log
  const handleAddLog = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    try {
      await onSave({ date: selectedDate, content, append: true });
      setContent("");
      setSelectedDate(new Date().toISOString().split("T")[0]);
      toast.success("Work log added");

      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (error) {
      toast.error(error.message || "Failed to add work log");
    }
  };

  // Handle delete log
  const handleDeleteLog = async (e, log) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this work log?")) return;

    try {
      await onDelete(formatDateForInput(log.date));
      toast.success("Work log deleted");
    } catch (error) {
      toast.error(error.message || "Failed to delete work log");
    }
  };

  // Toggle month collapse
  const toggleMonthCollapse = (monthKey) => {
    setCollapsedMonths((prev) => ({
      ...prev,
      [monthKey]: !prev[monthKey],
    }));
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat-style Log List */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto"
      >
        {sortedLogs.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground p-4">
            <div className="text-center">
              <svg
                className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              <p>No work logs yet</p>
              <p className="text-sm mt-1">Add your first entry below</p>
            </div>
          </div>
        ) : (
          sortedLogs.map((log, index) => {
            const prevLog = index > 0 ? sortedLogs[index - 1] : null;
            const monthKey = formatMonthYear(log.date);
            const showMonthHeader = !prevLog ||
              formatMonthYear(log.date) !== formatMonthYear(prevLog.date);
            const isCollapsed = collapsedMonths[monthKey];

            // Skip rendering log content if month is collapsed
            if (!showMonthHeader && collapsedMonths[formatMonthYear(log.date)]) {
              return null;
            }

            return (
              <div key={log.id}>
                {/* Sticky Month Header */}
                {showMonthHeader && (
                  <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-2">
                    <div className="flex items-center justify-between">
                      <button
                        className="flex items-center gap-2 hover:bg-muted/50 rounded-md px-2 py-1 -ml-2 transition-colors"
                        onClick={() => toggleMonthCollapse(monthKey)}
                      >
                        {isCollapsed ? (
                          <ChevronRight className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                        <span className="font-semibold text-sm">
                          📅 {monthKey}
                        </span>
                      </button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* Chat Bubble - Only show if not collapsed */}
                {!isCollapsed && (
                  <div className="px-4 py-2 group">
                    <div
                      className="bg-card border border-border rounded-lg p-3 hover:shadow-md transition-shadow cursor-text"
                      onClick={() => setEditingLogId(log.id)}
                    >
                      {editingLogId === log.id ? (
                        <textarea
                          value={editContent[log.id] ?? log.content}
                          onChange={(e) => handleEditChange(log.id, e.target.value)}
                          onBlur={() => setEditingLogId(null)}
                          autoFocus
                          rows={Math.max(3, (editContent[log.id] ?? log.content).split('\n').length)}
                          className="w-full bg-transparent border-none outline-none text-sm resize-none"
                          placeholder="What did you work on?"
                        />
                      ) : (
                        <>
                          {/* Timestamp with delete button - at top */}
                          <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-border/50">
                            <span className="text-xs text-muted-foreground">
                              {formatBubbleDate(log.date)}
                            </span>
                            <button
                              onClick={(e) => handleDeleteLog(e, log)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive p-1 rounded"
                              title="Delete work log"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                          <div className="prose prose-sm max-w-none text-foreground prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-code:text-foreground prose-li:text-foreground prose-a:text-primary">
                            {log.content ? (
                              <Markdown>
                                {log.content}
                              </Markdown>
                            ) : (
                              <p className="text-muted-foreground italic">Click to add content...</p>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}

        {/* Bottom scroll anchor */}
        <div ref={bottomRef} />
      </div>

      {/* Fixed Input Bar at Bottom */}
      <form
        onSubmit={handleAddLog}
        className="shrink-0 border-t border-border bg-background p-4"
      >
        <div className="flex gap-3 items-start">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="shrink-0 rounded-md border border-input bg-background px-3 py-2 text-sm h-10"
          />
          <div className="flex-1 flex flex-col gap-2">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What did you work on today? Press Enter to add..."
              rows={2}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleAddLog(e);
                }
              }}
            />
          </div>
          <Button type="submit" disabled={!content.trim() || isLoading} className="h-10">
            Add
          </Button>
        </div>
      </form>
    </div>
  );
}
