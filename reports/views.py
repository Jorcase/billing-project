from django.shortcuts import render
from django.http import JsonResponse
from django.views import View
from datetime import date
from cashregisters.models import Movement, CashRegister

# Create your views here.

class DailySummaryView(View):
    def get(self, request):
        # Obtener los datos de ventas diarias desde el manager
        daily_sales_data = CashRegister.objects.get_daily_sales()

        # Pasar los datos al contexto
        context = {
            'daily_sales_data': daily_sales_data
        }

        return render(request, 'cash_registers/cash_page.html', context)
