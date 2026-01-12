import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const statusColors = {
  todo: "bg-gray-500/20 text-gray-600 dark:text-gray-400",
  applied: "bg-blue-500/20 text-blue-600 dark:text-blue-400",
  "in-progress": "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400",
  rejected: "bg-red-500/20 text-red-600 dark:text-red-400",
  accepted: "bg-green-500/20 text-green-600 dark:text-green-400",
  dropped: "bg-muted text-muted-foreground",
};

function formatDate(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function ApplicationDetail({ item, onEdit, onDelete, onViewLogs }) {
  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold">{item.company_name}</h3>
          <p className="text-sm text-muted-foreground">{item.job_title}</p>
        </div>
        <span className={cn("text-xs px-2 py-1 rounded-full font-medium", statusColors[item.state] || statusColors.todo)}>
          {item.state}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        {item.job_url && (
          <div>
            <span className="text-muted-foreground">URL:</span>{" "}
            <a href={item.job_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate block">
              {item.job_url}
            </a>
          </div>
        )}
        {item.salary_range && (
          <div>
            <span className="text-muted-foreground">Salary:</span> {item.salary_range}
          </div>
        )}
        {item.email && (
          <div>
            <span className="text-muted-foreground">Email:</span>{" "}
            <a href={`mailto:${item.email}`} className="text-primary hover:underline">
              {item.email}
            </a>
          </div>
        )}
        <div>
          <span className="text-muted-foreground">Created:</span> {formatDate(item.created_at)}
        </div>
      </div>

      {item.notes && (
        <div>
          <span className="text-sm text-muted-foreground">Notes:</span>
          <p className="text-sm mt-1 whitespace-pre-wrap bg-muted/50 rounded-md p-2">{item.notes}</p>
        </div>
      )}

      <div className="flex gap-2 pt-2 border-t border-border">
        <Button size="sm" variant="outline" onClick={onEdit}>
          Edit
        </Button>
        <Button size="sm" variant="outline" onClick={() => onViewLogs(item)}>
          View Logs
        </Button>
        <Button size="sm" variant="destructive" onClick={onDelete}>
          Delete
        </Button>
      </div>
    </div>
  );
}

function LogDetail({ item, parentApplication, onEdit, onDelete }) {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs text-muted-foreground mb-1">Log for: {parentApplication?.company_name}</p>
        <h3 className="text-lg font-semibold">{item.process_name}</h3>
        <p className="text-xs text-muted-foreground">{formatDate(item.created_at)}</p>
      </div>

      {item.note && (
        <div>
          <span className="text-sm text-muted-foreground">Note:</span>
          <p className="text-sm mt-1 whitespace-pre-wrap bg-muted/50 rounded-md p-2">{item.note}</p>
        </div>
      )}

      {item.audio_url && (
        <div>
          <span className="text-sm text-muted-foreground">Audio Recording:</span>
          <audio controls className="w-full mt-1">
            <source src={item.audio_url} />
          </audio>
        </div>
      )}

      <div className="flex gap-2 pt-2 border-t border-border">
        <Button size="sm" variant="outline" onClick={onEdit}>
          Edit
        </Button>
        <Button size="sm" variant="destructive" onClick={onDelete}>
          Delete
        </Button>
      </div>
    </div>
  );
}

export default function DetailPanel({
  selectedItem,
  selectedType,
  parentApplication,
  onEdit,
  onDelete,
  onViewLogs,
}) {
  if (!selectedItem) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
        Select an item to view details
      </div>
    );
  }

  return (
    <div className="p-4 h-full overflow-y-auto">
      {selectedType === "application" ? (
        <ApplicationDetail
          item={selectedItem}
          onEdit={onEdit}
          onDelete={onDelete}
          onViewLogs={onViewLogs}
        />
      ) : (
        <LogDetail
          item={selectedItem}
          parentApplication={parentApplication}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      )}
    </div>
  );
}
