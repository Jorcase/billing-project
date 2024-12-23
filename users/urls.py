from django.urls import path
from .views import *

app_name = 'users_app'

urlpatterns = [
    
    path(
        'login/', 
        login_view, 
        name='login'
    ),  # Ruta para el login
    path(
        'register/', 
        register_view, 
        name='register'
    ), # Ruta para el registro
    path(
        'logout/',
        logout_view,
        name="logout"
    ),
    # Ruta para editar el perfil
    path(
        'profile/',
        profile_edit_view,
        name="profile"
    ),
    
    path(
        'list/',
        user_list,
        name="list"
    ), # Ruta para la lista de usuarios
    path(
        'list-datatable/',
        UsersAjaxList,
        name="users-datatable"
    ),
    path(
        'create/',
        create_user,
        name="users_create"
    ),
    path(
        'update/<int:pk>/',
        update_user,
        name="users_update"
    ),
    path(
        'detail/<int:pk>/',
        detail_user,
        name="users_detail"
    ),
    path(
        'delete/<int:pk>/',
        delete_user,
        name="users_delete"
    ),
]

