from django.contrib import admin
from .models import Risk

@admin.register(Risk)
class RiskAdmin(admin.ModelAdmin):
    list_display = ('asset', 'probability_of_failure', 'consequence_of_failure', 'computed_risk_score')
    search_fields = ('asset__name',)
