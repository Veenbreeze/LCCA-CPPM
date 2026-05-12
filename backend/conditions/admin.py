from django.contrib import admin
from .models import Condition

@admin.register(Condition)
class ConditionAdmin(admin.ModelAdmin):
    list_display = ('asset', 'inspection_date', 'condition_score')
    search_fields = ('asset__name', 'notes')
    list_filter = ('inspection_date',)
