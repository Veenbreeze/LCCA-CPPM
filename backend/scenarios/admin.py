from django.contrib import admin
from .models import Scenario

@admin.register(Scenario)
class ScenarioAdmin(admin.ModelAdmin):
    list_display = ('asset', 'repair_cost', 'replacement_cost', 'maintenance_cost', 'discount_rate')
    search_fields = ('asset__name',)
