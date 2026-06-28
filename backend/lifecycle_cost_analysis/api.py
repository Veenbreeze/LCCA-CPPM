import csv
import io
from datetime import date
from decimal import Decimal

from django.http import HttpResponse
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.routers import DefaultRouter

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import (
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

from assets.models import Asset
from assets.views import AssetViewSet
from conditions.views import ConditionViewSet
from projects.models import Project
from projects.views import ProjectViewSet
from risk.models import Risk
from risk.views import RiskViewSet
from scenarios.views import ScenarioViewSet


def _band(score: Decimal) -> str:
    if score >= Decimal("100"):
        return "Critical"
    if score >= Decimal("50"):
        return "High"
    if score >= Decimal("20"):
        return "Medium"
    return "Low"


def _recommended_intervention(asset: Asset) -> str:
    condition = float(asset.condition_rating or 0)
    rul = int(asset.remaining_useful_life or 0)
    if condition <= 2 or rul <= 2:
        return "Replacement"
    if condition <= 3:
        return "Refurbishment"
    if rul <= 5:
        return "Renewal"
    return asset.get_lifecycle_stage_display() or "Renewal"


def _build_prioritisation_rows():
    rows = []
    for risk in Risk.objects.select_related("asset").all():
        asset = risk.asset
        rul = max(1, int(asset.remaining_useful_life or 1))
        combined = Decimal(risk.combined_score)
        urgency = combined / Decimal(rul)
        rows.append(
            {
                "risk_id": risk.id,
                "asset_id": asset.id,
                "asset_name": asset.name,
                "asset_type": asset.asset_type,
                "location": asset.location,
                "lifecycle_stage": asset.lifecycle_stage,
                "recommended_intervention": _recommended_intervention(asset),
                "remaining_useful_life": rul,
                "probability_of_failure": float(risk.probability_of_failure),
                "consequence_of_failure": float(risk.consequence_of_failure),
                "criticality": float(asset.criticality),
                "risk_score": float(risk.computed_risk_score),
                "combined_score": float(combined),
                "urgency_score": float(urgency),
                "band": _band(combined),
            }
        )
    rows.sort(key=lambda row: row["urgency_score"], reverse=True)
    for index, row in enumerate(rows, start=1):
        row["rank"] = index
    return rows


def _asset_lifecycle_rows():
    rows = []
    for asset in Asset.objects.all().order_by("name"):
        rows.append(
            [
                str(asset.id),
                asset.name,
                asset.asset_type,
                asset.location,
                asset.get_lifecycle_stage_display(),
                f"{float(asset.condition_rating):.1f}",
                str(asset.remaining_useful_life),
                f"{float(asset.criticality):.1f}",
                asset.status,
            ]
        )
    return rows


def _capex_rows():
    rows = []
    total_budget = Decimal("0")
    by_status = {}
    for project in Project.objects.select_related("asset").all().order_by("start_date"):
        total_budget += Decimal(project.budget or 0)
        by_status[project.status] = by_status.get(project.status, Decimal("0")) + Decimal(
            project.budget or 0
        )
        rows.append(
            [
                project.name,
                project.asset.name,
                project.status,
                f"${float(project.budget):,.0f}",
                str(project.start_date),
                str(project.end_date),
                project.responsible_person,
            ]
        )
    return rows, total_budget, by_status


def _risk_register_rows():
    rows = []
    for risk in Risk.objects.select_related("asset").all():
        rows.append(
            {
                "asset": risk.asset.name,
                "location": risk.asset.location,
                "pof": float(risk.probability_of_failure),
                "cof": float(risk.consequence_of_failure),
                "criticality": float(risk.asset.criticality),
                "risk_score": float(risk.computed_risk_score),
                "combined": float(risk.combined_score),
                "band": _band(Decimal(risk.combined_score)),
            }
        )
    rows.sort(key=lambda row: row["combined"], reverse=True)
    return rows


def _build_pdf(title: str, subtitle: str, headers, rows, *, landscape_page=True, summary=None):
    buffer = io.BytesIO()
    pagesize = landscape(A4) if landscape_page else A4
    doc = SimpleDocTemplate(
        buffer,
        pagesize=pagesize,
        leftMargin=15 * mm,
        rightMargin=15 * mm,
        topMargin=15 * mm,
        bottomMargin=15 * mm,
    )
    styles = getSampleStyleSheet()
    story = [
        Paragraph(title, styles["Title"]),
        Paragraph(
            f"{subtitle} &nbsp;&nbsp; <font color='#666'>Generated {date.today().isoformat()}</font>",
            styles["Normal"],
        ),
        Spacer(1, 8),
    ]
    if summary:
        story.append(Paragraph(summary, styles["Normal"]))
        story.append(Spacer(1, 8))

    if not rows:
        story.append(Paragraph("<i>No records available.</i>", styles["Italic"]))
    else:
        data = [list(headers)] + [list(row) for row in rows]
        table = Table(data, repeatRows=1)
        table.setStyle(
            TableStyle(
                [
                    ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1f3a5f")),
                    ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                    ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                    ("FONTSIZE", (0, 0), (-1, -1), 8),
                    ("ALIGN", (0, 0), (-1, -1), "LEFT"),
                    ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.whitesmoke, colors.white]),
                    ("GRID", (0, 0), (-1, -1), 0.25, colors.HexColor("#cccccc")),
                    ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                    ("BOTTOMPADDING", (0, 0), (-1, 0), 6),
                    ("TOPPADDING", (0, 0), (-1, 0), 6),
                ]
            )
        )
        story.append(table)

    doc.build(story)
    return buffer.getvalue()


def _csv_response(filename, headers, rows):
    buffer = io.StringIO()
    writer = csv.writer(buffer)
    writer.writerow(headers)
    writer.writerows(rows)
    response = HttpResponse(buffer.getvalue(), content_type="text/csv")
    response["Content-Disposition"] = f"attachment; filename={filename}"
    return response


def _pdf_response(filename, pdf_bytes):
    response = HttpResponse(pdf_bytes, content_type="application/pdf")
    response["Content-Disposition"] = f"attachment; filename={filename}"
    return response


class ReportViewSet(viewsets.ViewSet):
    REPORTS = {
        1: {
            "title": "Asset Lifecycle Report",
            "description": "Full inventory with condition, RUL, lifecycle stage and criticality.",
        },
        2: {
            "title": "CAPEX Analysis",
            "description": "Budget vs spend across all capital projects.",
        },
        3: {
            "title": "Risk Register",
            "description": "Ranked risk register with PoF/CoF scoring and criticality.",
        },
        4: {
            "title": "Intervention Prioritisation",
            "description": "Ranked interventions by (risk × criticality) / RUL with recommended action.",
        },
    }

    def list(self, request):
        today = date.today().isoformat()
        reports = [
            {"id": report_id, "updated": today, **meta}
            for report_id, meta in self.REPORTS.items()
        ]
        return Response(reports)

    @action(detail=False, methods=["get"], url_path="prioritisation")
    def prioritisation(self, request):
        rows = _build_prioritisation_rows()
        summary = {
            "total": len(rows),
            "critical": sum(1 for row in rows if row["band"] == "Critical"),
            "high": sum(1 for row in rows if row["band"] == "High"),
            "medium": sum(1 for row in rows if row["band"] == "Medium"),
            "low": sum(1 for row in rows if row["band"] == "Low"),
        }
        return Response({"summary": summary, "results": rows})

    @action(detail=True, methods=["get"], url_path="export")
    def export(self, request, pk=None):
        fmt = (
            request.query_params.get("fmt")
            or request.query_params.get("format")
            or "pdf"
        ).lower()
        report_id = int(pk) if pk and pk.isdigit() else 0
        meta = self.REPORTS.get(report_id)
        if not meta:
            return HttpResponse("Unknown report", status=404)

        filename_base = meta["title"].lower().replace(" ", "-")

        if report_id == 1:
            headers = [
                "ID", "Name", "Type", "Location", "Stage",
                "Condition", "RUL", "Criticality", "Status",
            ]
            rows = _asset_lifecycle_rows()
            if fmt == "csv":
                return _csv_response(f"{filename_base}.csv", headers, rows)
            pdf = _build_pdf(
                meta["title"],
                meta["description"],
                headers,
                rows,
                summary=f"<b>{len(rows)}</b> assets in portfolio.",
            )
            return _pdf_response(f"{filename_base}.pdf", pdf)

        if report_id == 2:
            headers = [
                "Project", "Asset", "Status", "Budget", "Start", "End", "Owner",
            ]
            rows, total, by_status = _capex_rows()
            status_summary = "; ".join(
                f"{name}: ${float(amount):,.0f}" for name, amount in by_status.items()
            )
            summary_text = (
                f"<b>Total budget:</b> ${float(total):,.0f} &nbsp;&nbsp; "
                f"<b>{len(rows)}</b> projects. {status_summary}"
            )
            if fmt == "csv":
                csv_rows = list(rows) + [
                    [],
                    ["TOTAL", "", "", f"${float(total):,.0f}", "", "", ""],
                ]
                return _csv_response(f"{filename_base}.csv", headers, csv_rows)
            pdf = _build_pdf(
                meta["title"],
                meta["description"],
                headers,
                rows,
                summary=summary_text,
            )
            return _pdf_response(f"{filename_base}.pdf", pdf)

        if report_id == 3:
            headers = ["Asset", "Location", "PoF", "CoF", "Criticality", "Risk", "Combined", "Band"]
            register = _risk_register_rows()
            rows = [
                [
                    row["asset"],
                    row["location"],
                    f"{row['pof']:.1f}",
                    f"{row['cof']:.1f}",
                    f"{row['criticality']:.1f}",
                    f"{row['risk_score']:.1f}",
                    f"{row['combined']:.1f}",
                    row["band"],
                ]
                for row in register
            ]
            summary_text = (
                f"<b>{len(rows)}</b> risks ranked by combined score (PoF × CoF × criticality)."
            )
            if fmt == "csv":
                return _csv_response(f"{filename_base}.csv", headers, rows)
            pdf = _build_pdf(
                meta["title"],
                meta["description"],
                headers,
                rows,
                summary=summary_text,
            )
            return _pdf_response(f"{filename_base}.pdf", pdf)

        if report_id == 4:
            rows_data = _build_prioritisation_rows()
            headers = [
                "Rank", "Asset", "Location", "Stage", "Recommendation",
                "RUL", "PoF", "CoF", "Crit", "Risk", "Combined", "Urgency", "Band",
            ]
            rows = [
                [
                    str(row["rank"]),
                    row["asset_name"],
                    row["location"],
                    row["lifecycle_stage"],
                    row["recommended_intervention"],
                    str(row["remaining_useful_life"]),
                    f"{row['probability_of_failure']:.1f}",
                    f"{row['consequence_of_failure']:.1f}",
                    f"{row['criticality']:.1f}",
                    f"{row['risk_score']:.1f}",
                    f"{row['combined_score']:.1f}",
                    f"{row['urgency_score']:.1f}",
                    row["band"],
                ]
                for row in rows_data
            ]
            critical_count = sum(1 for r in rows_data if r["band"] == "Critical")
            high_count = sum(1 for r in rows_data if r["band"] == "High")
            summary_text = (
                f"<b>{len(rows)}</b> ranked interventions &nbsp;|&nbsp; "
                f"Critical: <b>{critical_count}</b> &nbsp;|&nbsp; "
                f"High: <b>{high_count}</b>"
            )
            if fmt == "csv":
                return _csv_response(f"{filename_base}.csv", headers, rows)
            pdf = _build_pdf(
                meta["title"],
                meta["description"],
                headers,
                rows,
                summary=summary_text,
            )
            return _pdf_response(f"{filename_base}.pdf", pdf)

        return HttpResponse("Unknown report", status=404)


router = DefaultRouter()
router.register(r'assets', AssetViewSet)
router.register(r'conditions', ConditionViewSet)
router.register(r'risks', RiskViewSet)
router.register(r'projects', ProjectViewSet)
router.register(r'scenarios', ScenarioViewSet)
router.register(r'reports', ReportViewSet, basename='reports')

urlpatterns = router.urls
