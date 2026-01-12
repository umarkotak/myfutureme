import { cn } from "@/lib/utils";

const navItems = [
  {
    id: "applications",
    label: "Job Applications",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    id: "worklogs",
    label: "Work Logs",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
  },
];

export default function ActivityBar({ activeSection, onSectionChange }) {
  return (
    <div className="w-12 bg-muted/50 border-r border-border flex flex-col items-center py-2 gap-1">
      {navItems.map((item) => (
        <button
          key={item.id}
          onClick={() => onSectionChange(item.id)}
          className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200",
            "hover:bg-muted text-muted-foreground hover:text-foreground",
            activeSection === item.id && "bg-primary/10 text-primary border-l-2 border-primary"
          )}
          title={item.label}
        >
          {item.icon}
        </button>
      ))}
    </div>
  );
}
