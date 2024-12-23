document.getElementById('confirmLogout').addEventListener('click', function() {
    // Obtener la URL de logout desde el atributo data-logout-url
    const logoutUrl = this.getAttribute('data-logout-url');
    
    fetch(logoutUrl, {
        method: 'POST',
        headers: {
            'X-CSRFToken': getCookie('csrftoken'),  // Asegúrate de enviar el token CSRF para seguridad
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            // Redirige a la página de inicio de sesión o cualquier otra página
            window.location.href = '/users/login/';
        } else {
            alert('Logout failed: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
});

// Función para obtener el token CSRF (lo necesitas para enviar peticiones POST en Django)
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Verifica si esta cookie comienza con el nombre que buscas
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}
