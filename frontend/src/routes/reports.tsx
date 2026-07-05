import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { FileText, Download, FileSpreadsheet, Calendar, FileBarChart } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, Card, Badge, Alert, KpiStrip } from "@/components/ui-kit";
import { ReportService, type ReportSummary } from "@/services/reportService";

export const Route = createFileRoute("/reports")({ component: ReportsPage });

const REPORT_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  "Asset Lifecycle Report": FileBarChart,
  "CAPEX Analysis": FileBarChart,
  "Risk Register": FileText,
  "Intervention Prioritisation": FileBarChart,
};

const REPORT_TAGS: Record<string, string> = {
  "Asset Lifecycle Report": "Inventory",
  "CAPEX Analysis": "Capital",
  "Risk Register": "Risk",
  "Intervention Prioritisation": "Priority",
};

function ReportsPage() {
  const [reports, setReports] = useState<ReportSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadReports = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await ReportService.list();
        setReports(data);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };
    void loadReports();
  }, []);

  const download = async (report: ReportSummary, fmt: "pdf" | "csv") => {
    const key = `${report.id}-${fmt}`;
    setDownloadingId(key);
    try {
      const blob = await ReportService.exportReport(report.id, fmt);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${report.title.toLowerCase().replace(/\s+/g, "-")}.${fmt}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      toast.success(`Exported "${report.title}" as ${fmt.toUpperCase()}`);
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div>
      <PageHeader
        eyebrow="Documentation"
        title="Reports & Exports"
        subtitle="Generate board-ready PDF or CSV exports of portfolio data, ranked risk and CAPEX scenarios."
        meta={
          <KpiStrip
            items={[
              { label: "Reports", value: String(reports.length) },
              { label: "Formats", value: "PDF · CSV" },
              { label: "Last refresh", value: reports[0]?.updated ?? "—" },
            ]}
          />
        }
      />

      {error ? (
        <Alert variant="destructive" className="mb-4">
          <div className="font-medium">Unable to load reports</div>
          <div>{error}</div>
        </Alert>
      ) : null}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-2">
        {loading ? (
          [0, 1, 2, 3].map((idx) => (
            <Card key={idx} className="h-44 animate-pulse">
              <div className="h-4 w-32 rounded bg-muted" />
              <div className="mt-3 h-3 w-full rounded bg-muted/60" />
              <div className="mt-2 h-3 w-2/3 rounded bg-muted/60" />
            </Card>
          ))
        ) : reports.length ? (
          reports.map((report) => {
            const Icon = REPORT_ICONS[report.title] ?? FileText;
            const tag = REPORT_TAGS[report.title] ?? "Report";
            const pdfKey = `${report.id}-pdf`;
            const csvKey = `${report.id}-csv`;
            return (
              <Card key={report.id} interactive className="flex flex-col">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary/15 to-primary/0 text-primary ring-1 ring-primary/15">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-semibold tracking-tight">
                        {report.title}
                      </h3>
                      <Badge variant="info" dot size="sm">
                        {tag}
                      </Badge>
                    </div>
                    <p className="mt-1.5 text-sm text-muted-foreground">
                      {report.description}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    Updated {report.updated}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => download(report, "csv")}
                      disabled={downloadingId === csvKey}
                      className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-[11px] font-semibold text-foreground transition-colors hover:bg-muted disabled:opacity-60"
                    >
                      <FileSpreadsheet className="h-3.5 w-3.5" />
                      {downloadingId === csvKey ? "…" : "CSV"}
                    </button>
                    <button
                      onClick={() => download(report, "pdf")}
                      disabled={downloadingId === pdfKey}
                      className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-[11px] font-semibold text-primary-foreground shadow-soft transition-all hover:opacity-95 hover:shadow-elevated disabled:opacity-60"
                    >
                      <Download className="h-3.5 w-3.5" />
                      {downloadingId === pdfKey ? "Generating…" : "PDF"}
                    </button>
                  </div>
                </div>
              </Card>
            );
          })
        ) : (
          <Card className="col-span-2 p-8 text-center text-sm text-muted-foreground">
            No reports are available.
          </Card>
        )}
      </div>
    </div>
  );
}
