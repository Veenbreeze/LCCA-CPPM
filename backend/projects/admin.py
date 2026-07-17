from django.contrib import admin
from .models import Project, Recommendation

@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ('name', 'asset', 'budget', 'start_date', 'end_date', 'status', 'responsible_person')
    search_fields = ('name', 'responsible_person', 'status')
    list_filter = ('status',)

@admin.register(Recommendation)
class RecommendationAdmin(admin.ModelAdmin):
    list_display = ('project', 'engineer_name', 'submitted_at')
    search_fields = ('engineer_name', 'work_done', 'recommendation', 'project__name')
    list_filter = ('submitted_at',)
    readonly_fields = ('submitted_at',)
