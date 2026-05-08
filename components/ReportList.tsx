import type { ApiReport } from "@/lib/api";
import ReportCard from "./ReportCard";
import EmptyState from "./EmptyState";

interface ReportListProps {
  reports: ApiReport[];
  selectedId?: string | null;
  onSelect?: (report: ApiReport) => void;
}

export default function ReportList({ reports, selectedId, onSelect }: ReportListProps) {
  if (reports.length === 0) return <EmptyState />;

  return (
    <div className="flex flex-col gap-3 overflow-y-auto">
      {reports.map((report) => (
        <ReportCard
          key={report.id}
          report={report}
          selected={selectedId === report.id}
          onClick={() => onSelect?.(report)}
        />
      ))}
    </div>
  );
}
