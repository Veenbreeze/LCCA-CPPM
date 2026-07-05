from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("assets", "0001_initial"),
        ("projects", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="project",
            name="scope_description",
            field=models.TextField(blank=True, default=""),
        ),
        migrations.AlterField(
            model_name="project",
            name="asset",
            field=models.ForeignKey(
                on_delete=models.deletion.CASCADE,
                related_name="projects",
                to="assets.asset",
            ),
        ),
    ]
