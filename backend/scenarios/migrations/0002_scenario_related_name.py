from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("assets", "0002_asset_lifecycle_stage_criticality"),
        ("scenarios", "0001_initial"),
    ]

    operations = [
        migrations.AlterField(
            model_name="scenario",
            name="asset",
            field=models.ForeignKey(
                on_delete=models.deletion.CASCADE,
                related_name="scenarios",
                to="assets.asset",
            ),
        ),
    ]
