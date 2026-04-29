from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("accounts", "0001_initial"),
    ]

    operations = [
        migrations.CreateModel(
            name="Tasks",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("title", models.CharField(max_length=100)),
                ("description", models.TextField()),
                ("resource_url", models.URLField(max_length=200)),
                ("deadline", models.DateTimeField()),
                ("status", models.CharField(choices=[("active", "completed")], default="active", max_length=20)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
            ],
        ),
    ]
