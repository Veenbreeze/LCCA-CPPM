from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("assets", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="asset",
            name="lifecycle_stage",
            field=models.CharField(
                choices=[
                    ("renewal", "Renewal"),
                    ("replacement", "Replacement"),
                    ("refurbishment", "Refurbishment"),
                    ("expansion", "Expansion"),
                ],
                default="renewal",
                max_length=20,
            ),
        ),
        migrations.AddField(
            model_name="asset",
            name="criticality",
            field=models.DecimalField(
                decimal_places=1,
                default=1.0,
                help_text="Asset criticality on a 1-5 scale (business/operational importance).",
                max_digits=3,
            ),
        ),
    ]
