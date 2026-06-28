from decimal import Decimal

from django.db import models

from assets.models import Asset


class Scenario(models.Model):
    asset = models.ForeignKey(Asset, on_delete=models.CASCADE, related_name="scenarios")
    repair_cost = models.DecimalField(max_digits=15, decimal_places=2)
    replacement_cost = models.DecimalField(max_digits=15, decimal_places=2)
    maintenance_cost = models.DecimalField(max_digits=15, decimal_places=2)
    discount_rate = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        help_text="Annual discount rate as a percentage (e.g. 5.0 for 5%).",
    )

    @property
    def horizon_years(self):
        return max(1, int(self.asset.remaining_useful_life or 1))

    def _annual_rate(self):
        rate = Decimal(self.discount_rate) / Decimal(100)
        if rate <= Decimal("-1"):
            rate = Decimal("0")
        return rate

    def _discounted_stream(self, year_zero, annual):
        rate = self._annual_rate()
        one_plus = Decimal(1) + rate
        total = Decimal(year_zero)
        for year in range(1, self.horizon_years + 1):
            total += Decimal(annual) / (one_plus ** year)
        return total

    @property
    def repair_npv(self):
        return self._discounted_stream(
            year_zero=Decimal(self.repair_cost),
            annual=Decimal(self.maintenance_cost),
        )

    @property
    def replacement_npv(self):
        return self._discounted_stream(
            year_zero=Decimal(self.replacement_cost),
            annual=Decimal(self.maintenance_cost) / Decimal(2),
        )

    @property
    def lifecycle_cost(self):
        return min(self.repair_npv, self.replacement_npv)

    @property
    def recommended_option(self):
        return "Replace" if self.replacement_npv < self.repair_npv else "Repair"

    def calculate_npv(self):
        """Lifecycle (lowest) NPV across repair vs replacement options, discounted over RUL."""
        return self.lifecycle_cost

    def __str__(self):
        return f"Scenario for {self.asset.name}"
