from rest_framework import serializers
from .models import Scenario


class ScenarioSerializer(serializers.ModelSerializer):
    npv = serializers.SerializerMethodField()
    repair_npv = serializers.SerializerMethodField()
    replacement_npv = serializers.SerializerMethodField()
    lifecycle_cost = serializers.SerializerMethodField()
    recommended_option = serializers.ReadOnlyField()
    horizon_years = serializers.ReadOnlyField()

    class Meta:
        model = Scenario
        fields = '__all__'

    def get_npv(self, obj):
        return float(obj.calculate_npv())

    def get_repair_npv(self, obj):
        return float(obj.repair_npv)

    def get_replacement_npv(self, obj):
        return float(obj.replacement_npv)

    def get_lifecycle_cost(self, obj):
        return float(obj.lifecycle_cost)