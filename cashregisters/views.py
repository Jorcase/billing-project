from django.shortcuts import render, redirect, get_object_or_404
from django.contrib import messages
from django.http import JsonResponse
from django.urls import reverse
# Modelos
from .models import *
from .models import CashRegister
# Formularios
from .forms import CashRegisterForm, MovementForm
# Importando OPERACIONES logicas sobre BD
from django.db.models import Q, F
# Manejo de FECHAS Y HORAS EN DJANGO
from django.utils.timezone import now
from django.utils import timezone
# MANEJO DE PETICIONES AJAX
from core.utils import is_ajax
from django.views.decorators.csrf import csrf_exempt


#############################################################
####################### Movimientos #########################
#############################################################

def movements_list(request):
    """
    Método que redirecciona al datatable de movimientos.
    """
    urls = [
        {'id': 'movements_create', 'name': 'cash_app:movements_create'},
        {'id': 'movements_update', 'name': 'cash_app:movements_update'},
        {'id': 'movements_detail', 'name': 'cash_app:movements_detail'},
        {'id': 'movements_delete', 'name': 'cash_app:movements_delete'}
    ]

    exclude_fields = ['user_made', 'deleted_at', 'created_at', 'updated_at', 'comments']

    context = {
        'url_datatable': reverse('cash_app:movements-datatable'),
        'movements_form': MovementForm(),
        'urls': urls,
        'segment': 'movements_page',
    }
    return render(request, "cash_registers/movements_page.html", context)    


def MovementsAjaxList(request):
    draw = request.GET.get('draw')
    start = int(request.GET.get('start', 0))
    length = int(request.GET.get('length', 10))

    order_column_index = int(request.GET.get('order[0][column]', 0))
    order_direction = request.GET.get('order[0][dir]', 'asc')
    search_value = request.GET.get('search[value]', None)

    column_mapping = {
        0: 'id',
        1: 'cash',
        2: 'amount',
        3: 'payment_type',
        4: 'transaction_type'
    }

    order_column = column_mapping.get(order_column_index, 'id')

    if order_direction == 'asc':
        order_column = F(order_column).desc(nulls_last=True) # Cambiamos el orden en que mostramos, para mostrar los ultimos creados
    else:
        order_column = F(order_column).asc(nulls_last=True)

    conditions = Q()
    if search_value:
        fields = ['id', 'cash__amount', 'payment_type', 'amount', 'transaction_type', 'description']
        for term in search_value.split():
            term_conditions = Q()
            for field in fields:
                term_conditions |= Q(**{f"{field}__icontains": term})
            conditions &= term_conditions

    filtered_data = Movement.objects.filter(conditions).distinct().order_by(order_column)
    total_records = filtered_data.count()
    records_filtered_count = filtered_data.count()

    data = [item.to_json() for item in filtered_data[start: start + length]]

    return JsonResponse({
        'draw': draw,
        'recordsTotal': total_records,
        'recordsFiltered': records_filtered_count,
        'data': data,
    })


def create_movements(request):
    """
    Vista para crear un nuevo movimiento basado en la caja abierta
    """
    
    try:
        # Obtener la caja abierta (asegúrate de que tengas un campo para determinar si está abierta)
        cash_register = CashRegister.objects.filter(status='open').first()
        print("CAJA ABIERTA --> ", cash_register)

        if request.method == 'POST' and is_ajax(request):

            # Validar y crear el movimiento
            form = MovementForm(request.POST)
            if form.is_valid():
                # Obtener el tipo de movimiento y la cantidad
                movement_type = form.cleaned_data.get('transaction_type')
                amount = form.cleaned_data.get('amount')

                # Crear el objeto movement pero no lo guardamos aún
                movement = form.save(commit=False)
                movement.cash = cash_register  # Asociar el movimiento con la caja abierta

                # Validación para ajustar la cantidad en la caja
                if movement_type == 'egreso':  
                    # Si es egreso, restamos el valor
                    if cash_register.current_balance < amount:
                        form.add_error('amount', 'No hay suficiente dinero en la caja para este egreso.')
                        messages.error(request, "No hay fondos suficientes para realizar un EGRESO.")

                    # Restar el monto
                    cash_register.current_balance -= amount  

                elif movement_type == 'ingreso':  # Si es ingreso, sumamos el valor
                    cash_register.current_balance += amount  # Sumar el monto

                # Guardar el movimiento y la caja
                movement.save()  # Guardar el movimiento
                cash_register.save()  # Guardar los cambios en la caja

                data_cash = cash_register.to_json()

                # Retornar la respuesta en formato JSON
                return JsonResponse({'status': 'success', 'message': 'Movimiento creado exitosamente.', 'cash': data_cash}, status=200)
            else:
                # Si el formulario no es válido, retornar los errores
                print(f"Errores en el formulario -- {form.get_errors_as_dict()}")
                return JsonResponse({'status': 'error', 'message': form.errors}, status=400)
        
        # Si no es un POST o no es AJAX
        return JsonResponse({'status': 'error', 'message': 'La solicitud no es AJAX o no es un POST.'}, status=400)
    
    except Exception as e:
        print(f"Error back --> {str(e)}")
        # En caso de error, retornar un JSON con el estado de error
        return JsonResponse({'status': 'error', 'message': str(e)}, status=500)
    

def detail_movements(request, pk):
    """
    Vista que me permite ver el detalle de un usuario.
    """
    caja = get_object_or_404(CashRegister, pk=pk)
    context = {
        'caja': caja
    }

    return render(request, 'cash_registers/components/modal_detail.html', context)


def update_movements(request, pk):
    """
    Vista para actualizar un usuario existente.
    """
    Caja = get_object_or_404(Caja, pk=pk)

    if request.method == 'POST':

        form = CashRegisterForm(request.POST, instance=Caja)

        if form.is_valid():
            form.save()
            messages.success(request, "Usuario actualizado exitosamente.")
            return redirect('cash_app:cash_list')
        else:
            messages.error(request, "Por favor, corrige los errores.")
            print(f"Errores en UPDATE CASH: {form.errors}")
    else:
        form = CashRegisterForm(instance=Caja)  # Cargar el formulario con los datos actuales del usuario


    context = {
        'form': form,
        'caja': Caja,
    }

    return render(request, 'cashs_registers/cash_form.html', context)

def delete_movements(request, pk):
    """
    Vista que me permite eliminar un usuario.
    """
    Caja = get_object_or_404(Caja, pk=pk)

    if request.method == 'POST':
        Caja.delete()
        messages.success(request, "Usuario eliminado exitosamente.")
        return redirect('cash_app:cash_list')

    # Si no es POST, muestra una página de confirmación
    return render(request, 'cashs_registers/cash_confirm_delete.html', {'caja': Caja})

#############################################################
########################### Cajas ###########################
#############################################################
def cash_list(request):
    """
    Método que redirecciona al datatable de usuarios y permite abrir una caja del día.
    """
    # Obtener la fecha actual (sin la hora)
    today = timezone.localtime(now()).date()
    print("DIA --> ", today)
   # Verificar si existe una caja abierta del día actual
    existing_cash_register = CashRegister.objects.filter(
        Q(status='open') & 
        Q(created_at__date=today)  # created_at debe ser un DateTimeField
    ).first()

    print(f"CAJA RECUPERADA --> ", existing_cash_register)

    form = CashRegisterForm()
    # Pedimos el formulario para crear un movimeinto
    form_movements = MovementForm()

    urls = [
        {'id': 'cash_create', 'name': 'cash_app:cash_create'},
        {'id': 'cash_detail', 'name': 'cash_app:cash_detail'},
        {'id': 'cash_delete', 'name': 'cash_app:cash_delete'},
        {'id': 'cash_close', 'name': 'cash_app:cash-close'},
        {'id': 'movement_create', 'name': 'cash_app:movements_create'}
    ]

    context = {
        'url_datatable': reverse('cash_app:cash-datatable'),
        'cash_form': form,
        'urls': urls,
        'segment': 'cash_page',
        'existing_cash_register': existing_cash_register,  # Pasamos la caja abierta si existe
        'movements_form': form_movements
    }

    return render(request, "cash_registers/cash_page.html", context)


def CashAjaxList(request):
    draw = request.GET.get('draw')
    start = int(request.GET.get('start', 0))
    length = int(request.GET.get('length', 10))

    order_column_index = int(request.GET.get('order[0][column]', 0))
    order_direction = request.GET.get('order[0][dir]', 'asc')
    search_value = request.GET.get('search[value]', None)

    column_mapping = {
        0: 'id',
        1: 'initial_current',
        2: 'status',
        3: 'created_at',
        4: 'close_date'
    }

    order_column = column_mapping.get(order_column_index, 'id')

    if order_direction == 'asc':
        order_column = F(order_column).desc(nulls_last=True)
    else:
        order_column = F(order_column).asc(nulls_last=True)

    conditions = Q()
    if search_value:
        fields = ['id', 'initial_balance', 'current_balance', 'status', 'created_at', 'close_date']
        for term in search_value.split():
            term_conditions = Q()
            for field in fields:
                term_conditions |= Q(**{f"{field}__icontains": term})
            conditions &= term_conditions

    filtered_data = CashRegister.objects.filter(conditions).distinct().order_by(order_column)
    total_records = filtered_data.count()

    data = [item.to_json() for item in filtered_data[start: start + length]]

    return JsonResponse({
        'draw': draw,
        'recordsTotal': total_records,
        'recordsFiltered': total_records,
        'data': data,
    })

# View que nos permite cerrar CAJA
def close_cash_register(request):
    # Verificar si hay una caja abierta
    cash_register = CashRegister.objects.filter(status="open").first()
    if not cash_register:
        return JsonResponse({"success": False, "message": "No hay ninguna caja abierta para cerrar."})

    if request.method == 'POST':
        # Cerrar la caja
        cash_register.close()
        return JsonResponse({"success": True, "message": "Caja cerrada exitosamente."})

    # Si no es POST, devolver un error
    return JsonResponse({"success": False, "message": "Método no permitido."})


# View que nos permite ABRIR una CAJA
def create_cash(request):
    """
    Vista para crear un nuevo usuario
    """
    # Obtener la fecha actual (sin la hora)
    today = timezone.localtime(now()).date()
    print("DIA --> ", today)
   # Verificar si existe una caja abierta del día actual
    existing_cash_register = CashRegister.objects.filter(
        Q(status='open') & 
        Q(created_at__date=today)  # created_at debe ser un DateTimeField
    ).first()

    print(f"CAJA RECUPERADA CREATE --> ", existing_cash_register)

    if request.method == 'POST':
        print(request.POST)
        # Si el usuario intenta abrir una nueva caja
        form = CashRegisterForm(request.POST)
        if form.is_valid():
            if existing_cash_register:
                # No se puede abrir una nueva caja si ya hay una abierta
                messages.error(request, 'Ya existe una caja abierta. Cierre la caja antes de abrir una nueva.')
            else:
                # Crear y abrir una nueva caja
                initial_balance = form.cleaned_data.get('initial_balance')
                new_cash_register = CashRegister.objects.create(
                    initial_balance=initial_balance,
                    current_balance=initial_balance,
                    user_made=request.user
                )
                new_cash_register.open()  # Aquí se llama al método 'open()'
                messages.success(request, 'La caja del día se ha abierto correctamente.')
                return redirect('cash_app:cash_list')
        else:
            print(f"Error en el FORM --> {form.get_errors_as_dict()}")
            messages.error(request, 'Por favor, corrige los errores en el formulario.')
            return redirect('cash_app:cash_list')


# def detail_cash(request, pk):

#     print(f"PK recibido: {pk}")  # Verifica el valor de pk

#     """
#     Vista que me permite ver el detalle de un caja.
#     """
#     try:
#         cash = get_object_or_404(CashRegister, pk=pk)
#         if is_ajax(request):
#             data = cash.to_json()
#             object = {
#                 'status': 'success',
#                 'cash': data
#             }
#             return JsonResponse(object, status=200)
           
#         else:
#             print("NO ES UNA PETICIÓN AJAX")
#             print("Datos de la caja enviados:", data)


#         return JsonResponse({'status': 'error', 'message': 'La solicitud no es AJAX.'}, status=400)
#     except Exception as e:
#         print(f"Error back --> {str(e)}")
#         # En caso de error, retorna un JSON con el estado de error
#         return JsonResponse({'status': 'error', 'message': str(e)}, status=500)

def detail_cash(request, pk):
    """
    Vista para mostrar el detalle de una caja y los movimientos relacionados.
    """
    # Obtener la caja por su primary key (pk)
    cash = get_object_or_404(CashRegister, pk=pk)
    # Generar la URL con la pk de la caja
    url_datatable = reverse('cash_app:movements_for_cash', kwargs={'pk': pk})
    context = {
        'cash': cash,
        'url_datatable': url_datatable,
    }

    # Renderizar el template con los datos de la caja y los movimientos
    return render(request, 'cash_registers/cash_detail.html', context)

# VIEW PARA VER LOS MOVIMIENTOS DE UNA CAJA EN ESPECIFICO
def MovementsForCashAjaxList(request, pk):
    """
    Vista para retornar los movimientos relacionados a una caja específica en formato compatible con DataTables.
    """
    draw = request.GET.get('draw')
    start = int(request.GET.get('start', 0))
    length = int(request.GET.get('length', 10))

    order_column_index = int(request.GET.get('order[0][column]', 0))
    order_direction = request.GET.get('order[0][dir]', 'asc')
    search_value = request.GET.get('search[value]', None)

    column_mapping = {
        0: 'id',
        1: 'cash__id',  # Relación con la caja
        2: 'amount',
        3: 'payment_type',
        4: 'transaction_type'
    }

    order_column = column_mapping.get(order_column_index, 'id')

    # Determinar la dirección del orden
    if order_direction == 'asc':
        order_column = F(order_column).asc(nulls_last=True)
    else:
        order_column = F(order_column).desc(nulls_last=True)

    # Construir condiciones de búsqueda
    conditions = Q(cash__id=pk)  # Filtrar solo movimientos relacionados con la caja de esta pk
    if search_value:
        fields = ['id', 'amount', 'payment_type', 'transaction_type', 'description']
        for term in search_value.split():
            term_conditions = Q()
            for field in fields:
                term_conditions |= Q(**{f"{field}__icontains": term})
            conditions &= term_conditions

    # Obtener los datos filtrados y ordenados
    filtered_data = Movement.objects.filter(conditions).distinct().order_by(order_column)
    total_records = Movement.objects.filter(cash__id=pk).count()  # Total de registros de la caja específica
    records_filtered_count = filtered_data.count()  # Total de registros después de los filtros

    # Serializar los datos
    data = [item.to_json() for item in filtered_data[start: start + length]]

    return JsonResponse({
        'draw': draw,
        'recordsTotal': total_records,
        'recordsFiltered': records_filtered_count,
        'data': data,
    })


def delete_cash(request, pk):
    """
    Vista que me permite eliminar un usuario.
    """
    print("ESTOY ENTRANDO A LA VISTA DE ELIMNIAR")
    try:
        if request.method == 'POST':
            cash = get_object_or_404(CashRegister, pk=pk)
            cash.delete()
            if is_ajax(request):
                
                data = cash.to_json()
                context = {
                    'status': 'success',
                    'message': 'Usuario eliminado con exito',
                    'cash': data
                }
                # No agregamos messages.success porque al ser una eliminacion dinamica no suele pasar el mensaje a menos que se actualice
                return JsonResponse(context, status=200)
            else:
                return JsonResponse({'status': 'error', 'message': 'La solicitud no es AJAX.'}, status=400)
        

    except Exception as e:
        print(f"Error back --> {str(e)}")
        # En caso de error, retorna un JSON con el estado de error
        return JsonResponse({'status': 'error', 'message': str(e)}, status=500)


################################################################################################
#################################### MOVIMIENTOS DE UNA CAJA ####################################
################################################################################################

from decimal import Decimal

def movement_update_for_cash(request, cash_id, movement_id):
    """
    Vista que me permite actualizar un moviemiento de una CAJA en ESPECIFICO
    """
    try:
        # Obtenemos la caja relacionada
        cash = get_object_or_404(CashRegister, pk=cash_id)
        # Obtener el movimiento relacionado
        movement = get_object_or_404(Movement, pk=movement_id, cash=cash)
        if request.method == "POST":
            print(request.POST)  # Imprimir los datos para verificar

            # Obtener los valores del formulario
            payment_type = request.POST.get('payment_type')
            amount = Decimal(request.POST.get('amount'))  # Convertir el monto a decimal
            transaction_type = request.POST.get('transaction_type')
            description = request.POST.get('description')

            # Obtener el monto anterior antes de actualizar
            previous_amount = movement.amount

            # Actualizar los campos manualmente
            movement.payment_type = payment_type
            movement.amount = amount
            movement.transaction_type = transaction_type
            movement.description = description
            movement.user_made = request.user

            # Antes de modificar el current_balance, deshacemos el efecto del monto anterior
            if movement.transaction_type == 'egreso':
                cash.current_balance += previous_amount  # Añadimos el monto anterior al balance
            elif movement.transaction_type == 'ingreso':
                cash.current_balance -= previous_amount  # Restamos el monto anterior al balance

            # Luego aplicamos el nuevo monto
            if transaction_type == 'egreso':
                cash.current_balance -= amount  # Decrementar el balance de la caja
            elif transaction_type == 'ingreso':
                cash.current_balance += amount  # Incrementar el balance de la caja

            # Guardamos el objeto de CAJA
            cash.save()

            # Guardar el objeto actualizado
            movement.save()
            messages.success(request, "Movimiento actualizado exitosamente.")
            return redirect('cash_app:cash_detail', pk=cash_id)  # Redirige al detalle de la caja
        else:
            # Mostrar el formulario con datos iniciales
            form = MovementForm(instance=movement)

        # Definimos un CONTEXTO
        context = {
            'cash': cash,
            'movement': movement,
            'form': form,
            'cash_id': cash_id
        }

        return render(request, "cash_registers/components/movement_update.html", context)

    except Exception as e:
        print(f"ERROR AL ACTUALIZAR UN MOVIMIENTO DE UNA CAJA EN ESPECIFICO -- {str(e)}")
        messages.error(request, "Error al actualizar (Exception)")
        return render(request, "cash_registers/components/movement_update.html")

