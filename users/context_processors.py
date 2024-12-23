# user/context_processors.py
from django.urls import reverse

def logout_url(request):
    return {
        'logout_url': reverse('users_app:logout')
    }