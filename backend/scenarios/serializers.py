from rest_framework import serializers
from .models import Scenario

class ScenarioSerializer(serializers.ModelSerializer):
    npv = serializers.SerializerMethodField()

    class Meta:
        model = Scenario
        fields = '__all__'

    def get_npv(self, obj):
        return obj.calculate_npv()