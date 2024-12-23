from django.contrib.auth.models import Group
from django.db.models.signals import post_migrate
from django.dispatch import receiver

@receiver(post_migrate)
def create_user_groups(sender, **kwargs):
    if sender.name == 'your_app_name':  # Cambia 'your_app_name' por el nombre de tu aplicación
        Group.objects.get_or_create(name='Administrativo')
        Group.objects.get_or_create(name='Empleados')