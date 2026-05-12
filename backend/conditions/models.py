from django.db import models
from assets.models import Asset

class Condition(models.Model):
    asset = models.ForeignKey(Asset, on_delete=models.CASCADE)
    inspection_date = models.DateField()
    condition_score = models.DecimalField(max_digits=3, decimal_places=1)
    notes = models.TextField(blank=True)

    def __str__(self):
        return f"Condition for {self.asset.name} on {self.inspection_date}"
