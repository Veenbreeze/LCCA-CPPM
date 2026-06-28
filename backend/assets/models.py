from django.db import models


LIFECYCLE_STAGE_CHOICES = [
    ("renewal", "Renewal"),
    ("replacement", "Replacement"),
    ("refurbishment", "Refurbishment"),
    ("expansion", "Expansion"),
]


class Asset(models.Model):
    name = models.CharField(max_length=255)
    asset_type = models.CharField(max_length=100)
    location = models.CharField(max_length=255)
    installation_date = models.DateField()
    condition_rating = models.DecimalField(max_digits=3, decimal_places=1)
    remaining_useful_life = models.IntegerField()
    status = models.CharField(max_length=50)
    lifecycle_stage = models.CharField(
        max_length=20,
        choices=LIFECYCLE_STAGE_CHOICES,
        default="renewal",
    )
    criticality = models.DecimalField(
        max_digits=3,
        decimal_places=1,
        default=1.0,
        help_text="Asset criticality on a 1-5 scale (business/operational importance).",
    )

    def __str__(self):
        return self.name
