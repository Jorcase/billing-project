from django.db import models
from core.models import BaseAbstractWithUser
from django.conf import settings  # Importar settings para usar AUTH_USER_MODEL
# Para el manejo del tiempo
from django.utils import timezone
from django.utils.timezone import now
# Importando MANANGERS
from .manangers import MovementManager, CashRegisterManager


# Create your models here.

STATUS_CHOICES = [
    ('open', 'Open'),
    ('closed', 'Closed')
]

TRANSACTION_TYPE_CHOICES = [
    ('ingreso', 'Ingreso'),
    ('egreso', 'Egreso'),
]
    
class CashRegister(BaseAbstractWithUser):
    """
    Modelo que sirve para interpretar LA CAJA REGISTRADORAS DE TODOS LOS DIAS
    """
    initial_balance = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        null=True,
        blank=True
    )
    current_balance = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        null=True,
        blank=True
    )
    status = models.CharField(
        max_length=10,
        choices=STATUS_CHOICES,
        default='closed',
        null=True,
        blank=True
    )
    close_date = models.DateTimeField(
        null=True,
        blank=True,
    )

    # Asociar el manager personalizado
    objects = CashRegisterManager()

    def open(self):
        """
        Metodo de la CLASE que me permite abrir la CAJA DEL DÍA
        """
        self.status = 'open'
        self.save()

    def close(self):
        """
        Metodo de la CLASE que me permite cerrar la CAJA DEL DÍA
        """
        self.status = 'closed'
        self.close_date = timezone.localtime(now()).date()
        self.save()

    def __str__(self):
        # Formateamos la fecha de created_at para mostrar solo la fecha (sin hora)
        created_at_date = self.created_at.date() if self.created_at else 'N/A'
        # Devolvemos el formato deseado: fecha y saldo inicial
        return f"Fecha: {created_at_date} - ${self.initial_balance}, ({self.get_status_display()})"
    
    def get_custom_status_display(self):
        """
        Método personalizado para mostrar el estado de la caja de forma legible.
        """
        if self.status == 'open':
            return "ABIERTA"
        elif self.status == 'closed':
            return "CERRADA"
        return "Estado desconocido"
    
    def to_json(self):
        item = {}
        item['id'] = self.id
        item['initial_balance'] = self.initial_balance
        item['current_balance'] = self.current_balance
        item['status'] = self.status
        item['close_date'] = self.close_date
        item['created_at'] = self.created_at
        item['updated_at'] = self.updated_at
        item['deleted_at'] = self.deleted_at

        return item

    
class Movement(BaseAbstractWithUser):
    """
    Modelo que nos permite manejar LOS DIFERENTES MOVIMIENTOS SOBRE UNA CAJA
    """
    cash = models.ForeignKey(
        CashRegister, 
        on_delete=models.CASCADE, 
        related_name='transactions',
        null=True,
        blank=True
    )
    amount = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        null=True,
        blank=True
    )
    description = models.CharField(
        max_length=255,
        null=True,
        blank=True
    )
    payment_type = models.CharField(
        max_length=100,
        null=True,
        blank=True
    )
    
    transaction_type = models.CharField(
        max_length=10, 
        choices=TRANSACTION_TYPE_CHOICES
    )

    objects = MovementManager()

    def __str__(self):
        return f"{self.created_at.date()} - {self.amount} ({self.transaction_type})"

    def to_json(self):
        item = {
            'id': self.pk,
            'cash_register': str(self.cash) if self.cash else None,  # Solo el ID de la caja
            'amount': str(self.amount),  # Convertir a string para asegurar formato decimal correcto
            'description': self.description,
            'payment_type': self.payment_type,
            'transaction_type': self.transaction_type,
            'created_at': self.created_at.strftime('%Y-%m-%d %H:%M:%S')  # Formato de fecha legible
        }
        return item

# Creacion del MODELO PARA LOS ARQUEOS RELACIONADOS A LA CAJA
class CashRegisterAudit(BaseAbstractWithUser):
    """
    Con es clase manejamos LOS MODELOS de ARQUEOS, para la CAJA REGISTRADORA 
    """
    # CAJA RELACIONADA
    cash_register = models.ForeignKey(
        CashRegister,
        on_delete=models.CASCADE,
        related_name='audits',
        verbose_name="Arqueos",
        null=True,
        blank=True
    )
    # Campo DEL BALANCE TEORICO
    theorical_balance = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True
    )
    # BALANCE FISÍCO
    physical_balance = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        null=True,
        blank=True
    )
    # DISCREPENCIA
    discrepancy = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True
    )
    # Fecha DEL AJUSTE, reutilizacion del campo CREATED_AT
    # Metodo de la CLASE
    def calculate_discrepancy(self):
        """
        Calcula la discrepancia entre el saldo teórico y el saldo físico.
        """
        self.discrepancy = self.physical_balance - self.theoretical_balance
        self.save()

    def __str__(self):
        return f"Arqueo - {self.audit_date.date()} - Discrepancia: {self.discrepancy}"

    def to_json(self):
        return {
            'id': self.pk,
            'cash_register': str(self.cash_register),
            'theoretical_balance': str(self.theoretical_balance),
            'physical_balance': str(self.physical_balance),
            'discrepancy': str(self.discrepancy),
            'audit_date': self.audit_date.strftime('%Y-%m-%d %H:%M:%S')
        }