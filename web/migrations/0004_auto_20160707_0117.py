# -*- coding: utf-8 -*-
# Generated by Django 1.9.7 on 2016-07-07 01:17
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('web', '0003_remove_purchase_purchased'),
    ]

    operations = [
        migrations.AlterField(
            model_name='purchase',
            name='predicted_replace_days',
            field=models.PositiveSmallIntegerField(blank=True, default=7),
        ),
    ]
