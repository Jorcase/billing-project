from django.urls import path
from .views import DailySummaryView

app_name = "reports_app"

urlpatterns = [
    # Ruta Para Obtener todos los MOVIMIENTOS del DIA
    path(
        'api/daily-summary/', 
        DailySummaryView.as_view(), 
        name='daily_summary'
        ),
]