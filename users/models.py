from django.db import models
from django import forms
# Create your models here.
from django.contrib.auth.models import AbstractUser
from core.models import BaseAbstractWithUser

from .manangers import UserManager
from .utils import DEFAULT_PROFILE_IMAGE

class User(BaseAbstractWithUser, AbstractUser):

    profile_image = models.CharField(
        max_length=100,
        default=DEFAULT_PROFILE_IMAGE,
        verbose_name="Imagen de Perfil Predeterminada."
    )

    REQUIRED_FIELDS = ["first_name", "last_name", "email"]

    objects = UserManager()  
    class Meta:
        verbose_name = 'Usuario'
        verbose_name_plural = 'Usuarios'
        db_table = 'users'
    
    def __str__(self):
        return self.username
    
    def get_string_for_is_active(self):
        if self.is_active:
            return "Usuarío activo."
        else:
            return "Usuarío inactivo."

    def get_full_name(self):
        return f"{self.first_name}, {self.last_name}"
    
    def get_profile_image_url(self):
        # Genera la URL completa utilizando la ubicación de la imagen en `static`
        return f'/static/{self.profile_image}'

    def to_json(self):
        item = {}
        item['id'] = self.id
        item['last_login'] = self.last_login
        item['first_name'] = self.first_name
        item['last_name'] = self.last_name
        item['get_full_name'] = self.get_full_name()
        item['username'] = self.username
        item['email'] = self.email
        item['is_active'] = self.get_string_for_is_active()
        item['created_at'] = self.created_at
        item['last_login'] = self.last_login
        item['updated_at'] = self.updated_at
        item['deleted_at'] = self.deleted_at
        item['is_staff'] = self.is_staff

        return item
        
