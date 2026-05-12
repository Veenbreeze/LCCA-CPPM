from django.db import models

class Asset(models.Model):
    name = models.CharField(max_length=255)
    asset_type = models.CharField(max_length=100)
    location = models.CharField(max_length=255)
    installation_date = models.DateField()
    condition_rating = models.DecimalField(max_digits=3, decimal_places=1)
    remaining_useful_life = models.IntegerField()
    status = models.CharField(max_length=50)

    def __str__(self):
        return self.name
