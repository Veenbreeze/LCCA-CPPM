from rest_framework import filters, viewsets
from rest_framework.permissions import AllowAny
from django_filters.rest_framework import DjangoFilterBackend

from .models import Asset
from .serializers import AssetSerializer

class AssetViewSet(viewsets.ModelViewSet):
    queryset = Asset.objects.all()
    serializer_class = AssetSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['asset_type', 'location', 'status']
    search_fields = ['name', 'asset_type', 'location', 'status']
    ordering_fields = ['installation_date', 'remaining_useful_life', 'condition_rating']
