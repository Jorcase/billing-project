# Generated by Django 5.1.4 on 2024-12-28 23:26

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('cashregisters', '0006_cashregisteraudit'),
        ('payments', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='movement',
            name='payment_method',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='movements', to='payments.paymentmethod'),
        ),
    ]