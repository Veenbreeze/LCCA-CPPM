from django.db import models
from assets.models import Asset

class Risk(models.Model):
    asset = models.OneToOneField(Asset, on_delete=models.CASCADE)
    probability_of_failure = models.DecimalField(max_digits=5, decimal_places=2)
    consequence_of_failure = models.DecimalField(max_digits=10, decimal_places=2)

    @property
    def computed_risk_score(self):
        return self.probability_of_failure * self.consequence_of_failure

    def __str__(self):
        return f"Risk for {self.asset.name}"
