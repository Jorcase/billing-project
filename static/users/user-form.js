// Evento para cargar el documento base
$(document).ready(function () {
    // Inicializamos Select2
    $('.js-user-multiple').select2({
        placeholder: "Seleccione uno o más grupos",  // Texto de ayuda
        width: '100%'  // Ajusta el ancho del componente
    });
});

// Evento para los OJOS DEL PASSWORD
document.querySelectorAll('.toggle-password').forEach(button => {
    button.addEventListener('click', function() {
        const target = document.getElementById(this.dataset.target);
        if (target.type === "password") {
            target.type = "text";
            this.querySelector('i').classList.remove('fa-eye');
            this.querySelector('i').classList.add('fa-eye-slash');
        } else {
            target.type = "password";
            this.querySelector('i').classList.remove('fa-eye-slash');
            this.querySelector('i').classList.add('fa-eye');
        }
    });
});