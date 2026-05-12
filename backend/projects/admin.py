from django.contrib import admin
from .models import Project

@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ('name', 'asset', 'budget', 'start_date', 'end_date', 'status', 'responsible_person')
    search_fields = ('name', 'responsible_person', 'status')
    list_filter = ('status',)
