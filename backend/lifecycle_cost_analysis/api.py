from django.http import HttpResponse
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.routers import DefaultRouter

from assets.views import AssetViewSet
from conditions.views import ConditionViewSet
from projects.views import ProjectViewSet
from risk.views import RiskViewSet
from scenarios.views import ScenarioViewSet

class ReportViewSet(viewsets.ViewSet):
    def list(self, request):
        reports = [
            {
                "id": 1,
                "title": "Asset Lifecycle Report",
                "description": "Full inventory with condition, RUL, and replacement timing.",
                "updated": "2025-04-22",
            },
            {
                "id": 2,
                "title": "CAPEX Analysis",
                "description": "Budget vs spend across all capital projects, ROI, variance.",
                "updated": "2025-04-20",
            },
            {
                "id": 3,
                "title": "Risk Prioritization",
                "description": "Ranked risk register with PoF/CoF scoring & mitigation status.",
                "updated": "2025-04-18",
            },
        ]
        return Response(reports)

    @action(detail=True, methods=["get"], url_path="export")
    def export(self, request, pk=None):
        fmt = request.query_params.get("format", "pdf").lower()
        if fmt == "csv":
            content = "id,title,description,updated\n1,Asset Lifecycle Report,Inventory report,2025-04-22\n"
            content_type = "text/csv"
        else:
            content = b"%PDF-1.4\n%Dummy Report PDF\n"
            content_type = "application/pdf"
        response = HttpResponse(content, content_type=content_type)
        response["Content-Disposition"] = f"attachment; filename=report-{pk}.{fmt}"
        return response

router = DefaultRouter()
router.register(r'assets', AssetViewSet)
router.register(r'conditions', ConditionViewSet)
router.register(r'risks', RiskViewSet)
router.register(r'projects', ProjectViewSet)
router.register(r'scenarios', ScenarioViewSet)
router.register(r'reports', ReportViewSet, basename='reports')

urlpatterns = router.urls
