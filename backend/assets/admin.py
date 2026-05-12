from django.contrib import admin
from .models import Asset

@admin.register(Asset)
class AssetAdmin(admin.ModelAdmin):
    list_display = ('name', 'asset_type', 'location', 'installation_date', 'condition_rating', 'remaining_useful_life', 'status')
    search_fields = ('name', 'asset_type', 'location', 'status')
    list_filter = ('asset_type', 'location', 'status')
