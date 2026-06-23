import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { FileText, Download, FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, Card, Badge, Alert } from "@/components/ui-kit";
import { ReportService, type ReportSummary } from "@/services/reportService";

export const Route = createFileRoute("/reports")({ component: ReportsPage });

function ReportsPage() {
  const [reports, setReports] = useState<ReportSummary[]>([]);
  const [loading, setLoading] = useState(true);
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

  const download = async (id: number, fmt: "pdf" | "csv") => {
    try {
      const blob = await ReportService.exportReport(id, fmt);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `report-${id}.${fmt}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      toast.success(`Downloading report ${id}`);
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  return (
    <div>
      <PageHeader title="Reports" subtitle="Generate and export portfolio insights" />

      {error ? <Alert variant="destructive">{error}</Alert> : null}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {loading ? (
          <Card className="col-span-3 p-6 text-center text-sm text-muted-foreground">
            Loading reports…
          </Card>
        ) : reports.length ? (
          reports.map((report) => (
            <Card key={report.id} className="flex flex-col">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <FileText className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold tracking-tight">{report.title}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">{report.description}</p>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <Badge variant="muted">Updated {report.updated}</Badge>
              </div>
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => download(report.id, "pdf")}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground hover:opacity-90"
                >
                  <Download className="h-3.5 w-3.5" /> PDF
                </button>
                <button
                  onClick={() => download(report.id, "csv")}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-border px-3 py-2 text-xs font-medium hover:bg-muted"
                >
                  <FileSpreadsheet className="h-3.5 w-3.5" /> CSV
                </button>
              </div>
            </Card>
          ))
        ) : (
          <Card className="col-span-3 p-6 text-center text-sm text-muted-foreground">
            No reports are available.
          </Card>
        )}
      </div>
    </div>
  );
}
