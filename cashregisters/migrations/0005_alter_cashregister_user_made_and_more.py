# Generated by Django 4.2.17 on 2024-12-15 23:11

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('cashregisters', '0004_alter_cashregister_user_made_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='cashregister',
            name='user_made',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='%(class)s_user_made', to=settings.AUTH_USER_MODEL, verbose_name='Por'),
        ),
        migrations.AlterField(
            model_name='movement',
            name='user_made',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='%(class)s_user_made', to=settings.AUTH_USER_MODEL, verbose_name='Por'),
        ),
    ]