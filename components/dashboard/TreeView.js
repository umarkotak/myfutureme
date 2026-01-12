import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const statusColors = {
  todo: "bg-gray-500/20 text-gray-600 dark:text-gray-400",
  applied: "bg-blue-500/20 text-blue-600 dark:text-blue-400",
  "in-progress": "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400",
  rejected: "bg-red-500/20 text-red-600 dark:text-red-400",
  accepted: "bg-green-500/20 text-green-600 dark:text-green-400",
  dropped: "bg-muted text-muted-foreground",
};

const stateOptions = [
  { value: "", label: "All" },
  { value: "todo", label: "Todo" },
  { value: "applied", label: "Applied" },
  { value: "in-progress", label: "In Progress" },
  { value: "rejected", label: "Rejected" },
  { value: "accepted", label: "Accepted" },
  { value: "dropped", label: "Dropped" },
];

function TreeItem({ item, logs = [], isExpanded, onToggle, onSelect, selectedId, selectedType }) {
  const isSelected = selectedType === "application" && selectedId === item.id;

  return (
    <div className="select-none">
      <div
        className={cn(
          "flex items-center gap-1 px-2 py-1.5 cursor-pointer rounded-md transition-colors",
          "hover:bg-muted/80",
          isSelected && "bg-primary/10 text-primary"
        )}
        onClick={() => onSelect(item, "application")}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggle(item.id);
          }}
          className="w-4 h-4 flex items-center justify-center text-muted-foreground hover:text-foreground"
        >
          <svg
            className={cn("w-3 h-3 transition-transform", isExpanded && "rotate-90")}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        </button>
        <span className="flex-1 text-sm truncate font-medium">{item.company_name}</span>
        <span className="text-xs text-muted-foreground truncate max-w-[100px]">{item.job_title}</span>
        <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full font-medium", statusColors[item.state] || statusColors.todo)}>
          {item.state}
        </span>
      </div>
      {isExpanded && logs.length > 0 && (
        <div className="ml-5 border-l border-border pl-2">
          {logs.map((log) => {
            const isLogSelected = selectedType === "log" && selectedId === log.id;
            return (
              <div
                key={log.id}
                className={cn(
                  "flex items-center gap-2 px-2 py-1 cursor-pointer rounded-md transition-colors text-sm",
                  "hover:bg-muted/80",
                  isLogSelected && "bg-primary/10 text-primary"
                )}
                onClick={() => onSelect(log, "log", item)}
              >
                <svg className="w-3 h-3 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span className="truncate">{log.process_name}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function TreeView({
  applications = [],
  applicationLogs = {},
  selectedItem,
  selectedType,
  onSelect,
  onAddNew,
  searchQuery,
  onSearchChange,
  filterState,
  onFilterChange,
  onLoadLogs,
}) {
  const [expandedIds, setExpandedIds] = useState(new Set());

  const toggleExpand = async (id) => {
    const newExpanded = new Set(expandedIds);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
      // Load logs if not already loaded
      if (!applicationLogs[id]) {
        await onLoadLogs(id);
      }
    }
    setExpandedIds(newExpanded);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Job Applications
        </span>
        <Button
          size="sm"
          variant="ghost"
          className="h-6 w-6 p-0"
          onClick={onAddNew}
          title="Add New Application"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </Button>
      </div>

      {/* Search & Filter */}
      <div className="px-2 py-2 space-y-2 border-b border-border">
        <Input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="h-7 text-sm"
        />
        <select
          value={filterState}
          onChange={(e) => onFilterChange(e.target.value)}
          className="w-full h-7 text-sm rounded-md border border-input bg-background px-2"
        >
          {stateOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Tree Items */}
      <div className="flex-1 overflow-y-auto px-1 py-1">
        {applications.length === 0 ? (
          <div className="text-center text-muted-foreground text-sm py-8">
            No applications found
          </div>
        ) : (
          applications.map((app) => (
            <TreeItem
              key={app.id}
              item={app}
              logs={applicationLogs[app.id] || []}
              isExpanded={expandedIds.has(app.id)}
              onToggle={toggleExpand}
              onSelect={onSelect}
              selectedId={selectedItem?.id}
              selectedType={selectedType}
            />
          ))
        )}
      </div>
    </div>
  );
}
