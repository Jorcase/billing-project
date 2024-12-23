from django import forms
from django.conf import settings
from core.mixins import BaseForm, ValidationFormMixin
from .models import *
import os

class CashRegisterForm(BaseForm):
    initial_balance = forms.DecimalField(
        label="Saldo Inicial",
        required=True,
        error_messages={'required': 'Este campo es obligatorio.'},
        widget=forms.NumberInput(attrs={'placeholder': 'Saldo inicial', 'class': 'form-control'})
    )
    current_balance = forms.DecimalField(
        label="Saldo Actual",
        required=False,
        widget=forms.NumberInput(attrs={'placeholder': 'Saldo actual', 'class': 'form-control', 'readonly': 'readonly'})
    )
    status = forms.ChoiceField(
        label="Estado",
        choices=STATUS_CHOICES,
        required=False,
        widget=forms.Select(attrs={'class': 'form-select'})
    )

    class Meta:
        model = CashRegister
        fields = ['initial_balance', 'current_balance']

    def clean_initial_balance(self):
        initial_balance = self.cleaned_data.get('initial_balance')
        if initial_balance is not None and initial_balance < 0:
            raise forms.ValidationError('El saldo inicial no puede ser negativo.')
        return initial_balance

    def clean_current_balance(self):
        current_balance = self.cleaned_data.get('current_balance')
        if current_balance is not None and current_balance < 0:
            raise forms.ValidationError('El saldo actual no puede ser negativo.')
        return current_balance

class MovementForm(ValidationFormMixin):
    cash = forms.ModelChoiceField(
        queryset=CashRegister.objects.all(),
        label="Cash Register",
        required=False,
        error_messages={'required': 'This field is required.'},
        widget=forms.Select(attrs={'class': 'form-control'})
    )
    payment_type = forms.CharField(
        label="Payment Type",
        required=True,
        error_messages={'required': 'This field is required.'},
        widget=forms.TextInput(
            attrs={
                'class': 'form-control',
                'placeholder': 'Tipo de pago'
                }
            )
        # Aquí puedes agregar las opciones, por ejemplo:
        # choices=Movement.PAYMENT_TYPE_CHOICES
    )
    amount = forms.DecimalField(
        label="Amount",
        required=True,
        error_messages={'required': 'This field is required.'},
        widget=forms.NumberInput(attrs={'placeholder': 'Ingrese un monto. Ej: 250', 'class': 'form-control'})
    )
    description = forms.CharField(
        label="Description",
        required=False,
        widget=forms.Textarea(attrs={
            'placeholder': 'Breve descripcion del movimiento',
            'class': 'form-control',
            'rows': 3
        })
    )
    transaction_type = forms.ChoiceField(
        label="Transaction Type",
        required=True,
        choices=TRANSACTION_TYPE_CHOICES,  # Ensure these choices are defined in the model
        error_messages={'required': 'This field is required.'},
        widget=forms.Select(attrs={'class': 'form-control'})
    )

    class Meta:
        model = Movement
        fields = ['cash', 'payment_type', 'amount', 'description', 'transaction_type']

    def clean_amount(self):
        amount = self.cleaned_data.get('amount')
        self.validate_positive_integer(amount)
        return amount
