from rest_framework import filters, viewsets
from rest_framework.permissions import AllowAny
from django_filters.rest_framework import DjangoFilterBackend

from .models import Condition
from .serializers import ConditionSerializer

class ConditionViewSet(viewsets.ModelViewSet):
    queryset = Condition.objects.all()
    serializer_class = ConditionSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['asset', 'inspection_date']
    search_fields = ['asset__name', 'notes']
    ordering_fields = ['inspection_date', 'condition_score']

