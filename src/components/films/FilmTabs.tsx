import type { FilmStatus } from "@/types";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, Clock, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface FilmTabsProps {
  selectedStatus: FilmStatus;
  onStatusChange: (status: FilmStatus) => void;
  totalCount: number;
}

interface StatusConfig {
  label: string;
  icon: React.ReactNode;
  className: string;
}

const statusConfigs: Record<FilmStatus, StatusConfig> = {
  "to-watch": {
    label: "Watch Later",
    icon: <Clock className="h-4 w-4" />,
    className: "text-blue-600",
  },
  watched: {
    label: "Watched",
    icon: <Eye className="h-4 w-4" />,
    className: "text-green-600",
  },
  rejected: {
    label: "Not for me",
    icon: <X className="h-4 w-4" />,
    className: "text-red-600",
  },
};

export function FilmTabs({ selectedStatus, onStatusChange, totalCount }: FilmTabsProps) {
  return (
    <div className="flex items-center gap-4">
      <Tabs value={selectedStatus} onValueChange={(value) => onStatusChange(value as FilmStatus)}>
        <TabsList>
          {(Object.entries(statusConfigs) as [FilmStatus, StatusConfig][]).map(([status, config]) => (
            <TabsTrigger
              key={status}
              value={status}
              className={cn("min-w-[120px] flex items-center gap-2", selectedStatus === status && config.className)}
            >
              {config.icon}
              {config.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      <span className="text-sm text-muted-foreground">Results: {totalCount}</span>
    </div>
  );
}
