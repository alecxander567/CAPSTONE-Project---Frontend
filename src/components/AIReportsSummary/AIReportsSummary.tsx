import { useEffect, useState } from "react";
import type { StudentAttendance } from "../../hooks/useAllStudentAttendance";
import type { ProgramAttendance } from "../../hooks/useAttendancePerProgram";
import type { AppEvent } from "../../hooks/useEvents";
import "./AIReportsSummary.css";

interface EventAttendance {
  event: string;
  students: number;
}

interface AIReportsSummaryProps {
  allStudents: StudentAttendance[];
  events: AppEvent[];
  eventAttendanceData: EventAttendance[];
  programAttendanceData: ProgramAttendance[];
}

type Severity = "good" | "warning" | "critical" | "neutral";

interface SummaryItem {
  id: string;
  label: string;
  value: string;
  detail: string;
  severity: Severity;
  icon: string;
  compact?: boolean;
}

export default function AIReportsSummary({
  allStudents,
  events,
  eventAttendanceData,
  programAttendanceData,
}: AIReportsSummaryProps) {
  const [items, setItems] = useState<SummaryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Recompute whenever any input changes
    const totalPresent = allStudents.reduce((s, x) => s + (x.present || 0), 0);
    const totalPossible = allStudents.reduce(
      (s, x) => s + (x.total_events || 0),
      0,
    );
    const overallRate =
      totalPossible > 0 ? Math.round((totalPresent / totalPossible) * 100) : 0;

    const atRisk = allStudents.filter((s) => (s.absences || 0) >= 3);
    const perfect = allStudents.filter(
      (s) => (s.absences || 0) === 0 && (s.total_events || 0) > 0,
    );

    const totalEvents = events.length;
    const avgPerEvent =
      totalEvents > 0 ?
        Math.round(
          eventAttendanceData.reduce((s, e) => s + (e.students || 0), 0) /
            totalEvents,
        )
      : 0;

    const list: SummaryItem[] = [
      {
        id: "overall",
        label: "Overall Attendance Rate",
        value: `${overallRate}%`,
        detail: `${totalPresent.toLocaleString()} of ${totalPossible.toLocaleString()} possible check-ins`,
        severity:
          overallRate >= 85 ? "good"
          : overallRate >= 70 ? "warning"
          : "critical",
        icon: "bi-bar-chart-line",
      },
      {
        id: "atrisk",
        label: "Students At Risk",
        value: atRisk.length.toLocaleString(),
        detail:
          atRisk.length === 0 ?
            "No students have reached the absence threshold"
          : `${atRisk.length} student${atRisk.length === 1 ? "" : "s"} with 3 or more absences`,
        severity:
          atRisk.length === 0 ? "good"
          : atRisk.length <= 5 ? "warning"
          : "critical",
        icon: "bi-exclamation-triangle",
      },
      {
        id: "perfect",
        label: "Perfect Attendance",
        value: perfect.length.toLocaleString(),
        detail:
          perfect.length === 0 ?
            "No students with a clean attendance record yet"
          : `${perfect.length} student${perfect.length === 1 ? "" : "s"} with zero absences`,
        severity: perfect.length > 0 ? "good" : "neutral",
        icon: "bi-patch-check",
      },
      {
        id: "events",
        label: "Average Event Turnout",
        value: avgPerEvent.toLocaleString(),
        detail:
          totalEvents === 0 ?
            "No events recorded for the selected period"
          : `Across ${totalEvents} event${totalEvents === 1 ? "" : "s"}`,
        severity: "neutral",
        icon: "bi-calendar-check",
      },
    ];

    const validPrograms = programAttendanceData.filter(
      (p) => !p.program?.toLowerCase().includes("osa"),
    );
    if (validPrograms.length > 0) {
      const sorted = [...validPrograms].sort(
        (a, b) => (b.percentage || 0) - (a.percentage || 0),
      );
      const top = sorted[0];
      const lowest = sorted[sorted.length - 1];

      list.push({
        id: "top-program",
        label: "Top Performing Program",
        value: top.program,
        detail: `${top.percentage ?? 0}% participation — ${top.present ?? 0} of ${top.total_students ?? 0} students`,
        severity: "good",
        icon: "bi-trophy",
        compact: true,
      });

      if (lowest.program !== top.program) {
        list.push({
          id: "low-program",
          label: "Needs Attention",
          value: lowest.program,
          detail: `${lowest.percentage ?? 0}% participation — ${lowest.present ?? 0} of ${lowest.total_students ?? 0} students`,
          severity: (lowest.percentage || 0) < 50 ? "critical" : "warning",
          icon: "bi-flag",
          compact: true,
        });
      }
    }

    setItems(list);
    setLoading(false);
  }, [allStudents, events, eventAttendanceData, programAttendanceData]);

  return (
    <div className="ai-reports-card lower-card fade-up delay-6">
      <div className="as-header">
        <div className="as-header-icon">
          <i className="bi bi-clipboard-data"></i>
        </div>
        <div className="as-header-text">
          <h4>Attendance Summary</h4>
          <p>Key metrics and observations</p>
        </div>
      </div>

      {loading ?
        <div className="as-loading">
          <div
            className="spinner-border spinner-border-sm text-primary"
            role="status"
          />
          <span>Loading summary…</span>
        </div>
      : <div className="as-list">
          {items.map((item) => (
            <div
              key={item.id}
              className={`as-item severity-${item.severity} ${
                item.compact ? "compact" : ""
              }`}>
              <div className="as-item-icon">
                <i className={`bi ${item.icon}`}></i>
              </div>
              <div className="as-item-body">
                <div className="as-item-label">{item.label}</div>
                <div className="as-item-value">{item.value}</div>
                <div className="as-item-detail">{item.detail}</div>
              </div>
            </div>
          ))}
        </div>
      }
    </div>
  );
}
