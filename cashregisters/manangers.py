# Plantilla de Manangers para manejar consultas a base de datos
from django.db import models
from django.db.models import Sum, F
from django.db.models.functions import TruncDate
from django.utils import timezone


class CashRegisterManager(models.Manager):
    def get_daily_sales(self):
        # Obtener la fecha actual
        today = timezone.now().date()
        # Filtrar las cajas cerradas y agruparlas por fecha de cierre (close_date)
        sales = self.filter(status='closed', close_date__isnull=False)
        # Agrupar las ventas por día y sumar los balances de cada caja
        sales_by_day = (
            sales
            .values('close_date__date')  # Agrupar por fecha sin hora
            .annotate(total_sales=Sum('current_balance'))
            .order_by('close_date__date')
        )
        
        # Convertir los datos a un formato para ser consumido por el gráfico
        sales_data = {
            'labels': [],
            'series': []
        }
        
        for sale in sales_by_day:
            sales_data['labels'].append(sale['close_date__date'].strftime('%A'))  # Obtener el nombre del día (lunes, martes, etc.)
            sales_data['series'].append(sale['total_sales'])
        
        # Asegurar que siempre tenga 7 días (si no hay datos de algún día, asignar 0)
        all_days = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
        sales_data['labels'] = all_days
        sales_data['series'] = sales_data['series'][:7]  # Limitar a los últimos 7 días
        
        return sales_data

class MovementManager(models.Manager):
    def daily_summary(self, start_date=None, end_date=None, cash_status=None):
        """
        Retorna un resumen diario de ingresos y egresos.

        :param start_date: Fecha de inicio para filtrar (opcional)
        :param end_date: Fecha de fin para filtrar (opcional)
        :param cash_status: Estado de la caja relacionado ('open' o 'closed', opcional)
        """
        queryset = self.get_queryset()

        if cash_status:
            queryset = queryset.filter(cash__status=cash_status)
        if start_date:
            queryset = queryset.filter(created_at__gte=start_date)
        if end_date:
            queryset = queryset.filter(created_at__lte=end_date)

        return queryset.annotate(
            day=TruncDate('created_at')
        ).values('day').annotate(
            ingresos=Sum(F('amount'), filter=F('transaction_type') == 'income'),
            egresos=Sum(F('amount'), filter=F('transaction_type') == 'expense')
        ).order_by('day')

    def total_income(self, start_date=None, end_date=None):
        """
        Retorna el total de ingresos para el rango de fechas dado.
        """
        queryset = self.get_queryset()

        if start_date:
            queryset = queryset.filter(created_at__gte=start_date)
        if end_date:
            queryset = queryset.filter(created_at__lte=end_date)

        return queryset.filter(transaction_type='income').aggregate(total=Sum('amount'))['total'] or 0

    def total_expense(self, start_date=None, end_date=None):
        """
        Retorna el total de egresos para el rango de fechas dado.
        """
        queryset = self.get_queryset()

        if start_date:
            queryset = queryset.filter(created_at__gte=start_date)
        if end_date:
            queryset = queryset.filter(created_at__lte=end_date)

        return queryset.filter(transaction_type='expense').aggregate(total=Sum('amount'))['total'] or 0
