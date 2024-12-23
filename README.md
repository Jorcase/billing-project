# Django Box-Billing Project

Este es un proyecto base de Django diseñado para gestionar una caja registradora con funcionalidades de movimientos y arqueos. Proporciona una estructura escalable y está preparado para ser utilizado con una base de datos PostgreSQL.

## 🚀 Pasos de Instalación

### 1. Crear un Entorno Virtual

Utilizamos `venv` para manejar entornos virtuales. Para crear un nuevo entorno virtual llamado `box-env`, ejecuta:

```bash
python3.11 -m venv box-env
# o
python3 -m venv box-env
```

Activar el entorno virtual:

- **Linux o Mac**:

```bash
source box-env/bin/activate
```

- **Windows**:

```bash
box-env\Scripts\activate
```

### 2. Instalación de Dependencias

Una vez dentro del entorno virtual, navega hasta la raíz del proyecto y ejecuta:

```bash
pip install -r requirements.txt
```

### 3. Configuración de Credenciales

Dentro de la raíz del proyecto, crea un archivo llamado `secret.json` con la siguiente estructura:

```json
{
    "FILENAME": "secret.json",
    "SECRET_KEY": "clave_secreta_pedir_administrador_del_sistema",
    "DB_NAME": "box_db",
    "DB_USER": "postgres",
    "DB_PASSWORD": "your_password",
    "DB_HOST": "localhost",
    "DB_PORT": 5432,

    "EMAIL_HOST": "smtp.gmail.com",
    "EMAIL_HOST_USER": "box@gmail.com",
    "EMAIL_HOST_PASSWORD": "<<password>>"
}
```

Nota: Asegúrate de cambiar los valores de `SECRET_KEY`, `DB_NAME`, `DB_USER` y `DB_PASSWORD` a los apropiados para tu configuración.

### 4. Configuración de la Base de Datos

Dado que utilizamos PostgreSQL como base de datos, asegúrate de tenerlo instalado y en ejecución.

### 5. Crear y Aplicar Migraciones

Para crear las migraciones y aplicarlas, ejecuta:

```bash
python manage.py makemigrations
python manage.py migrate
```

### 6. Configuración de Variables de Entorno

Configura la variable de entorno necesaria antes de ejecutar la aplicación:

- **En sistemas Unix/Linux/Mac**:

```bash
export DEVELOPMENT_ENVIRONMENT=True
```

- **En Windows (CMD)**:

```cmd
set DEVELOPMENT_ENVIRONMENT=True
```

- **En Windows (PowerShell)**:

```powershell
$env:DEVELOPMENT_ENVIRONMENT = "True"
```

### 7. Ejecutar el Proyecto

Inicia el servidor de desarrollo:

```bash
python manage.py runserver
```

Accede a tu proyecto desde [http://localhost:8000/](http://localhost:8000/).

## ¡Listo!

Ahora puedes utilizar tu sistema de caja registradora para gestionar movimientos y arqueos.
