from rest_framework import filters, viewsets
from rest_framework.permissions import AllowAny
from django_filters.rest_framework import DjangoFilterBackend

from .models import Scenario
from .serializers import ScenarioSerializer

class ScenarioViewSet(viewsets.ModelViewSet):
    queryset = Scenario.objects.all()
    serializer_class = ScenarioSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['asset', 'discount_rate']
    search_fields = ['asset__name']
    ordering_fields = ['repair_cost', 'replacement_cost', 'maintenance_cost']

