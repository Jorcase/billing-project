from __future__ import absolute_import, unicode_literals
from celery import Celery
import os

# Configuracion del ENTORNO 
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'project.settings')
# Crear una INSTANCIA DE CELERY
app = Celery('project')
# Cargamos configuracion de DJANGO SETTINGS
app.config_from_object('django.conf:settings', namespace='CELERY')
app.conf.timezone = 'America/Buenos_Aires'
# DETECTAR Y REGISTRAR TAREAS AUTOMATICAS
app.autodiscover_tasks()

@app.task(bind=True)
def debug_task(self):
    print(f'RESPONSE --- {self.request!r}')