from rest_framework import serializers
from .models import Risk

class RiskSerializer(serializers.ModelSerializer):
    computed_risk_score = serializers.ReadOnlyField()

    class Meta:
        model = Risk
        fields = '__all__'