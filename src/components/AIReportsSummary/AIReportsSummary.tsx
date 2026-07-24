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

interface AIInsight {
  type: "success" | "warning" | "danger" | "info";
  title: string;
  description: string;
  suggestion?: string;
}

export default function AIReportsSummary({
  allStudents,
  events,
  eventAttendanceData,
  programAttendanceData,
}: AIReportsSummaryProps) {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const generateInsights = async () => {
      if (
        !allStudents.length ||
        !events.length ||
        !programAttendanceData.length
      ) {
        setLoading(false);
        return;
      }

      try {
        const apiKey = import.meta.env.VITE_GOOGLE_AI_API_KEY;
        if (!apiKey) {
          setError("Google AI API key not configured");
          setLoading(false);
          return;
        }

        // Prepare data summary for AI analysis
        const totalStudents = allStudents.length;
        const totalEvents = events.length;
        const avgAttendance =
          allStudents.reduce(
            (sum, s) => sum + (s.present / s.total_events || 0),
            0,
          ) / totalStudents;
        const atRiskStudents = allStudents.filter(
          (s) => s.absences >= 3,
        ).length;
        const perfectAttendance = allStudents.filter(
          (s) => s.absences === 0,
        ).length;

        const programStats = programAttendanceData
          .map(
            (p) =>
              `${p.program}: ${p.percentage}% attendance (${p.present}/${p.total_students})`,
          )
          .join("\n");

        const eventStats = eventAttendanceData
          .slice(-5)
          .map((e) => `${e.event}: ${e.students} students`)
          .join("\n");

        const prompt = `You are an AI assistant for a biometric attendance system. Analyze the following attendance data and provide actionable insights to improve event management and student participation.

CURRENT DATA:
- Total Students: ${totalStudents}
- Total Events: ${totalEvents}
- Average Attendance Rate: ${(avgAttendance * 100).toFixed(1)}%
- At-Risk Students (3+ absences): ${atRiskStudents}
- Perfect Attendance Students: ${perfectAttendance}

PROGRAM ATTENDANCE:
${programStats}

RECENT EVENTS ATTENDANCE:
${eventStats}

Provide 4-5 specific, actionable insights in JSON format with this structure:
{
  "insights": [
    {
      "type": "success|warning|danger|info",
      "title": "Brief title",
      "description": "What the data shows",
      "suggestion": "Specific action to improve"
    }
  ]
}

Focus on:
1. Programs with low attendance and how to improve them
2. Event timing and scheduling suggestions
3. Student engagement strategies
4. At-risk student interventions
5. Overall system improvements

Return ONLY valid JSON, no markdown or extra text.`;

        // Use gemini-2.5-flash (latest stable model from available models list)
        const model = "gemini-2.5-flash";

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    {
                      text: prompt,
                    },
                  ],
                },
              ],
              generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 1024,
              },
            }),
          },
        );

        if (!response.ok) {
          const errorText = await response.text();
          console.error("AI API Error:", response.status, errorText);
          throw new Error(
            `AI API error (${response.status}): ${response.statusText}`,
          );
        }

        const result = await response.json();
        const aiText = result.candidates?.[0]?.content?.parts?.[0]?.text;

        if (aiText) {
          // Extract JSON from the response
          const jsonMatch = aiText.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            setInsights(parsed.insights || []);
          } else {
            throw new Error("Invalid AI response format");
          }
        } else {
          throw new Error("No response from AI");
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to generate insights",
        );
      } finally {
        setLoading(false);
      }
    };

    generateInsights();
  }, [allStudents, events, programAttendanceData, eventAttendanceData]);

  const getIcon = (type: string) => {
    switch (type) {
      case "success":
        return "bi-check-circle-fill";
      case "warning":
        return "bi-exclamation-triangle-fill";
      case "danger":
        return "bi-x-circle-fill";
      case "info":
        return "bi-info-circle-fill";
      default:
        return "bi-lightbulb-fill";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "success":
        return "#198754";
      case "warning":
        return "#ffc107";
      case "danger":
        return "#dc3545";
      case "info":
        return "#0dcaf0";
      default:
        return "#0d6efd";
    }
  };

  const getTypeBg = (type: string) => {
    switch (type) {
      case "success":
        return "#d1e7dd";
      case "warning":
        return "#fff3cd";
      case "danger":
        return "#f8d7da";
      case "info":
        return "#cff4fc";
      default:
        return "#cfe2ff";
    }
  };

  return (
    <div className="ai-reports-card lower-card fade-up delay-6">
      <h4 className="card-title">
        <i className="bi bi-robot text-primary me-2"></i>
        AI-Powered Insights & Recommendations
      </h4>

      {loading && (
        <div className="text-center py-5">
          <div
            className="spinner-border spinner-border-sm text-primary"
            role="status"
          />
          <p className="mt-3 text-muted small">
            <i className="bi bi-cpu me-2"></i>
            Analyzing attendance data with AI...
          </p>
        </div>
      )}

      {error && (
        <div className="alert alert-danger small" role="alert">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {error}
        </div>
      )}

      {!loading && !error && insights.length === 0 && (
        <div className="text-center py-5 text-muted">
          <i
            className="bi bi-inbox"
            style={{ fontSize: "2rem", opacity: 0.3 }}></i>
          <p className="mt-2 small">No insights available yet</p>
        </div>
      )}

      {!loading && !error && insights.length > 0 && (
        <div className="ai-insights-list">
          {insights.map((insight, idx) => (
            <div
              key={idx}
              className="ai-insight-item"
              style={{
                borderLeft: `4px solid ${getTypeColor(insight.type)}`,
                backgroundColor: getTypeBg(insight.type),
              }}>
              <div className="ai-insight-header">
                <i
                  className={`bi ${getIcon(insight.type)} me-2`}
                  style={{
                    color: getTypeColor(insight.type),
                    fontSize: "1.1rem",
                  }}
                />
                <h6
                  className="ai-insight-title"
                  style={{ color: getTypeColor(insight.type), margin: 0 }}>
                  {insight.title}
                </h6>
              </div>
              <p className="ai-insight-description small mb-2">
                {insight.description}
              </p>
              {insight.suggestion && (
                <div className="ai-insight-suggestion">
                  <strong>
                    <i className="bi bi-lightbulb me-1"></i>
                    Recommendation:
                  </strong>{" "}
                  {insight.suggestion}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="ai-footer mt-3">
        <small className="text-muted">
          <i className="bi bi-cpu me-1"></i>
          Powered by Google AI • Insights based on real-time attendance data
        </small>
      </div>
    </div>
  );
}
