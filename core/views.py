from django.shortcuts import render, redirect
from django.urls import reverse

# Para la solicitid de mensajes
from django.contrib import messages

from django.contrib.auth.decorators import login_required

# Create your views here.
@login_required
def home(request):
    messages.info(request, "Panel de graficos")
    context = {
        'segment': 'home', # Esto es para usar la clase active en el template
    }
    return render(request, 'home/index.html', context)

@login_required
def tables(request):
    context = {
        'segment': 'ui-tables',
    }
    return render(request, 'home/ui-tables.html', context)

@login_required
def typography(request):
    context = {
        'segment': 'ui-typography',
    }
    return render(request, 'home/ui-typography.html', context)

@login_required
def icons(request):
    context = {
        'segment': 'ui-icons',
    }
    return render(request, 'home/ui-icons.html', context)

@login_required
def notifications(request):
    context = {
        'segment': 'ui-notifications',
    }
    return render(request, 'home/ui-notifications.html', context)

# SETTINGS
@login_required
def settings_view(request):
    if request.method == 'POST':
        # Guardar las preferencias del usuario, como el esquema de colores
        color_scheme = request.POST.get('color_scheme')
        request.user.profile.color_scheme = color_scheme
        request.user.profile.save()
        return redirect('settings')
    
    return render(request, 'settings.html', {'user': request.user})

# No hace falta el login_required
def root_redirect(request):
    if request.user.is_authenticated:
        return redirect(reverse('core_app:home'))  # Redirige a la vista de inicio autenticado
    else:
        return redirect(reverse('users_app:login'))  # Redirige a la página de login si no está autenticado