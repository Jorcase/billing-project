// Captura el elemento select y la imagen de vista previa
const imageSelect = document.getElementById('imageSelect');
const profilePreview = document.getElementById('profilePreview');

// Verifica que ambos elementos existen en el DOM
if (imageSelect && profilePreview) {
    // Agrega el listener para actualizar la imagen
    imageSelect.addEventListener('change', function() {
        const selectedImage = imageSelect.value;
        profilePreview.src = `${staticURL}${selectedImage}`;
    });
}