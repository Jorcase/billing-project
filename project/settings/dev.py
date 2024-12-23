from .base import *

# Si verifica esta expreion, estamos en entornode desarrollo

with open("secret.json") as f:
    secret = json.loads(f.read())

# Printeamos para ver que que variables obtuvimos
#print("clave \n", secret)

DEBUG = True
ALLOWED_HOSTS = ['*']
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': secret.get('DB_NAME'),
        'USER': secret.get('DB_USER'),
        'PASSWORD': secret.get('DB_PASSWORD'),
        'HOST': secret.get('DB_HOST'),
        'PORT': secret.get('DB_PORT'),
    }
}

# Method for get secret_key
def get_secret(secret_name, secrets=secret):
    try:
        return secrets[secret_name]
    except KeyError:
        raise ImproperlyConfigured("Set the {} environment variable".format(secret_name))

SECRET_KEY = get_secret('SECRET_KEY')