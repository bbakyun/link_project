# Generated by Django 5.0.7 on 2024-11-23 20:31

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("links", "0007_alter_link_title"),
    ]

    operations = [
        migrations.AlterField(
            model_name="link",
            name="image_url",
            field=models.CharField(blank=True, max_length=2048, null=True),
        ),
    ]
