from celery import shared_task
# Manejo de HORARIOS
from django.utils.timezone import now
from django.utils import timezone
from .models import CashRegister

@shared_task
def auto_close_cash_register():
    """
    Tarea para cerrar automaticamente las cajas abiertas al final del DÍA
    """
    print(f"METODO AUTOMATICO EJECUTANDOSE...")
    # Recuperamos la CAJA ABIERTA EN EL DIA
    open_cash_registers = CashRegister.objects.filter(
        status='open',
        close_date__isnull=True
    )
    # un contador para saber cuantas cajas estan abiertas
    cash_count = open_cash_registers.count()
    if cash_count > 0:
        # Actualizamos el estado de las CAJAS ABIERTAS
        open_cash_registers.update(
            status='closed',
            close_date=timezone.localtime(now()).date()
        )
    print(f"{cash_count} cajas cerradas automáticamente.")
    return True