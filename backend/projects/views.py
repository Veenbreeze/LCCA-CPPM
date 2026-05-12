from rest_framework import filters, viewsets
from rest_framework.permissions import AllowAny
from django_filters.rest_framework import DjangoFilterBackend

from .models import Project
from .serializers import ProjectSerializer

class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['asset', 'status', 'start_date', 'end_date']
    search_fields = ['name', 'responsible_person', 'status']
    ordering_fields = ['start_date', 'end_date', 'budget']

