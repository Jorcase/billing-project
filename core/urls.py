from django.urls import path
from .views import *

app_name = 'core_app'

urlpatterns = [
    path(
        '',
        root_redirect,
        name="root"
    ),
    path(
        'home/', 
        home, 
        name='home'
    ),  # Ruta para la vista home
    path(
        'core/settings/',
        settings_view,
        name="settings"
    ),
    path(
        'core/tables/',
        tables,
        name="tables"
    ),
    path(
        'core/icons/',
        icons,
        name="icons"
    ),
    path(
        'core/notifications/',
        notifications,
        name="notifications"
    ),
    path(
        'core/typography/',
        typography,
        name="typography"
    )
]