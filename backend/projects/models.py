from django.db import models
from assets.models import Asset

class Project(models.Model):
    name = models.CharField(max_length=255)
    asset = models.ForeignKey(Asset, on_delete=models.CASCADE)
    budget = models.DecimalField(max_digits=15, decimal_places=2)
    start_date = models.DateField()
    end_date = models.DateField()
    status = models.CharField(max_length=50)
    responsible_person = models.CharField(max_length=255)

    def __str__(self):
        return self.name
