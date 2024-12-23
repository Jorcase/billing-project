from django.urls import path
from .views import *

app_name = 'cash_app'

urlpatterns = [
    # Ruta Relacionada con Movimientos
    path('movements/', movements_list, name='movements_list'),
    path('movimientos-datatable/', MovementsAjaxList, name='movements-datatable'),
    path('movement/create/', create_movements, name='movements_create'),
    path('update/movement/<int:pk>/', update_movements, name="movements_update"),
    path('detail/movement/<int:pk>/', detail_movements, name="movements_detail"),
    path('delete/movement/<int:pk>/', delete_movements, name="movements_delete"),
    # Ruta Relacionada con CAJAS
    path('', cash_list, name='cash_list'),
    path('cajas/ajax/', CashAjaxList, name='cash-datatable'),
    # Ruta para crear una caja
    path(
        'open/', 
        create_cash, 
        name='cash_create'
        ),
    # Ruta para cerrar la caja
    path(
        'close/',
        close_cash_register,
        name="close_cash"
    ),
    # Ruta para el datatable de MOVEMENTS FOR CASH
    path(
        'movements-datatable-cash/<int:pk>',
        MovementsForCashAjaxList,
        name="movements_for_cash"
    ),
    # Ruta para actualizar un movimiento de una caja
    path(
        'cash/<int:cash_id>/movement/<int:movement_id>/update/',
        movement_update_for_cash,
        name='movement_update_for_cash'
    ),
    # Ruta para el detalle de una caja
    path('detail/<int:pk>/', detail_cash, name="cash_detail"),
    # Ruta para el eliminar de una caja
    path('delete/<int:pk>/', delete_cash, name="cash_delete")
]