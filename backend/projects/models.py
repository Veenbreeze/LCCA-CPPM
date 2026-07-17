from django.db import models
from assets.models import Asset

class Project(models.Model):
    name = models.CharField(max_length=255)
    asset = models.ForeignKey(Asset, on_delete=models.CASCADE, related_name="projects")
    scope_description = models.TextField(blank=True, default="")
    budget = models.DecimalField(max_digits=15, decimal_places=2)
    start_date = models.DateField()
    end_date = models.DateField()
    status = models.CharField(max_length=50)
    responsible_person = models.CharField(max_length=255)

    def __str__(self):
        return self.name


class Recommendation(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name="recommendations")
    engineer_name = models.CharField(max_length=255)
    work_done = models.TextField()
    recommendation = models.TextField()
    submitted_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-submitted_at"]

    def __str__(self):
        return f"Recommendation for {self.project.name} by {self.engineer_name}"
