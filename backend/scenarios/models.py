from django.db import models
from assets.models import Asset

class Scenario(models.Model):
    asset = models.ForeignKey(Asset, on_delete=models.CASCADE)
    repair_cost = models.DecimalField(max_digits=15, decimal_places=2)
    replacement_cost = models.DecimalField(max_digits=15, decimal_places=2)
    maintenance_cost = models.DecimalField(max_digits=15, decimal_places=2)
    discount_rate = models.DecimalField(max_digits=5, decimal_places=2)

    def calculate_npv(self):
        # Simple NPV calculation, assuming annual costs
        # This is a placeholder, real calculation would be more complex
        total_cost = self.repair_cost + self.replacement_cost + self.maintenance_cost
        return total_cost / (1 + self.discount_rate)

    def __str__(self):
        return f"Scenario for {self.asset.name}"
