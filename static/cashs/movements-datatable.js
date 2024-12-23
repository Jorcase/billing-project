
let movementsID;
let table;
let urls;

$(document).ready(function () {
    // Obtener las URLs definidas en el template
    urls = JSON.parse(document.getElementById("urls-data").textContent);

    console.log("URLs disponibles:", urls);

    // Ejemplo: Usar las URLs en tu lógica
    const createUrl = urls.movements_create;
    // Inicializar la tabla de datos
    table = initializeDataTable();      
    
    styleDatatable()
    
    setColumnsWidth(table);

    // Funcion que me permite cerrar las notificaciones flash
    $('.btn-close').click(function() {
        $(this).closest('.alert').fadeOut();
    });

});

// Evento para el boton de crear
document.getElementById("create-Movimientos").addEventListener("click", function() {
    // Aquí activamos el modal de creación
    $('#movementCreateModal').modal('show');
});

function initializeDataTable() { 
    // Obtener la URL de los datos de la tabla
    let table = document.getElementById("tableMovements")
    let url = table.getAttribute("data-url")

    // Inicializar el DataTable
    var datatable = $('#tableMovements').DataTable({
        layout: {
            top2Start: function () {
                let toolbar = document.createElement('div');
                toolbar.innerHTML = `
                <div>
                    <a href="${urls.user_create}" class="btn btn-primary btn-simple btn-sm me-1 my-2" type="button">
                        <span class="fas fa-plus" data-fa-transform="shrink-3 down-2"></span>
                        <span class="d-none d-sm-inline-block ms-1">Nuevo Cliente</span>
                    </a>
                </div>`;
                return toolbar;
            },
            topStart: {
                pageLength: {
                    menu: [ 5, 10, 50, 100 ]
                }
            },
            topEnd: {
                search: {
                    placeholder: 'Buscar ...'
                }
            },
            bottomEnd: {
                paging: {
                    numbersCallback: function (context) {
                        let currentPage = context.iDraw / context._iDisplayLength + 1; // Página actual
                        let pagesToShow = [currentPage - 1, currentPage, currentPage + 1]; // Páginas para mostrar
        
                        // Filtra las páginas para asegurarte de que estén dentro del rango válido
                        pagesToShow = pagesToShow.filter(function(page) {
                            return page >= 1 && page <= context._iTotalPages;
                        });
        
                        let pagingHTML = '<ul class="pagination">';
        
                        // Agrega botones para cada página en pagesToShow
                        pagesToShow.forEach(function(page) {
                            let activeClass = page === currentPage ? 'active' : '';
                            pagingHTML += `<li class="page-item ${activeClass}"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`;
                        });
        
                        pagingHTML += '</ul>';
        
                        return pagingHTML;
                    }
                }
            }
        },
        // Configuración para el procesamiento de los datos
        processing: false,
        serverSide: true, // Activar el procesamiento del lado del servidor
        
        ajax: {
            url: url, // URL para obtener los datos
            dataSrc: 'data' // Nombre del atributo que contiene los datos en la respuesta
        },
        
        //Definir las columnas de la tabla
        columns: [
            { title: "ID", data: 'id', className: "text-center d-none d-md-table-cell", responsivePriority: 4, width: "10%"  },
            { title: "Caja", data: 'cash_register', className: 'text-center d-node d-md-table-cell', responsivePriority: 1, width: "15%"  },
            { title: "Monto", data: 'amount', className: 'text-center d-node d-md-table-cell', responsivePriority: 1, width: "15%"  },
            { title: "Tipo de Pago", data: 'payment_type', className: 'text-center d-node d-md-table-cell', responsivePriority: 1, width: "15%"  },
            {
                title: "Tipo",
                data: 'transaction_type',
                className: 'text-center d-node d-md-table-cell',
                responsivePriority: 3,
                width: "25%",
                render: function(data, type, row) {
                    
                    if (type === 'display') {
                        if (data === 'ingreso') {
                            return '<span class="badge bg-success">Ingreso</span>';
                        } else if (data === 'egreso') {
                            return '<span class="badge bg-danger">Egreso</span>';
                        }
                    }
                    return data; // Devuelve el valor sin formato para exportar u ordenar
                }
            },
            {   
                title: "Acciones",
                className: 'text-center',
                data: null,
                orderable: false,
                responsivePriority: 1,
                with: "25%",
                render: function (data) {
                    return `
                    <div class="d-flex p-0 m-0 justify-content-center">
                        <div class="d-flex gap-2 py-0">
                            <button style="display: flex; justify-content: center; align-items: center;" 
                                class="btn btn-sm btn-primary" 
                                rel="detail"
                                data-toggle="modal"
                                data-target="#userDetailModal"
                                data-id="${changeUrlId(urls.movements_detail, data.id)}">
                                <svg xmlns="http://www.w3.org/2000/svg" style="width: 20px; height: 20px; margin: 0;" viewBox="0 0 24 24"><path fill="currentColor" d="M16 11q-2.075 0-3.85-1t-2.8-2.8q-.1-.175-.137-.337T9.175 6.5t.038-.363t.137-.337q1-1.8 2.788-2.8T16 2t3.85 1t2.8 2.8q.1.175.138.338t.037.362t-.037.363t-.138.337q-1 1.8-2.787 2.8T16 11m0-2q1.05 0 1.775-.725T18.5 6.5t-.725-1.775T16 4t-1.775.725T13.5 6.5t.725 1.775T16 9m0-1q-.625 0-1.063-.437T14.5 6.5t.438-1.062T16 5t1.063.438T17.5 6.5t-.437 1.063T16 8M7.825 23q-.6 0-1.15-.225t-.975-.65L1.3 17.7q-.275-.275-.288-.687t.263-.713l.15-.15q.35-.35.85-.475t1 0l1.725.5V8q0-.425.288-.712T6 7t.713.288T7 8v7h1v-3q0-.425.288-.712T9 11t.713.288T10 12v3h1v-2q0-.425.288-.712T12 12t.713.288T13 13v2h1q0-.425.288-.712T15 14t.713.288T16 15v4q0 1.65-1.175 2.825T12 23z"/></svg>
                            </button>
                            <a style="display: flex; justify-content: center; align-items: center;" href="${changeUrlId(urls.movements_update, data.id)}" class="btn btn-sm btn-default"><svg xmlns="http://www.w3.org/2000/svg" style="width: 20px; height: 20px; margin: 0;" viewBox="0 0 24 24"><path fill="currentColor" d="M5 19h1.425L16.2 9.225L14.775 7.8L5 17.575zm-2 2v-4.25L16.2 3.575q.3-.275.663-.425t.762-.15t.775.15t.65.45L20.425 5q.3.275.438.65T21 6.4q0 .4-.137.763t-.438.662L7.25 21zM19 6.4L17.6 5zm-3.525 2.125l-.7-.725L16.2 9.225z"/></svg></span></a>
                            <button style="display: flex; justify-content: center; align-items: center;" rel="delete" class="btn btn-sm btn-danger" data-toggle="modal" data-target="#user_delete" data-id="${changeUrlId(urls.movements_delete, data.id)}">
                                <svg xmlns="http://www.w3.org/2000/svg" style="width: 20px; height: 20px; margin: 0;" viewBox="0 0 24 24"><path fill="currentColor" d="M7 21q-.825 0-1.412-.587T5 19V6q-.425 0-.712-.288T4 5t.288-.712T5 4h4q0-.425.288-.712T10 3h4q.425 0 .713.288T15 4h4q.425 0 .713.288T20 5t-.288.713T19 6v13q0 .825-.587 1.413T17 21zM17 6H7v13h10zm-7 11q.425 0 .713-.288T11 16V9q0-.425-.288-.712T10 8t-.712.288T9 9v7q0 .425.288.713T10 17m4 0q.425 0 .713-.288T15 16V9q0-.425-.288-.712T14 8t-.712.288T13 9v7q0 .425.288.713T14 17M7 6v13z"/></svg>
                            </button>
                        </div>
                    </div>`;
                }
            }
        ],
        
        //Configuración del idioma y mensajes
        language: {
            //TEXTO Display __MENU__
            lengthMenu: 'Mostrar _MENU_ Movimientos',
            decimal: "",
            emptyTable: "No hay Movimientos que mostrar",
            info: "Mostrando _START_ a _END_ de _TOTAL_ Clientes",
            infoEmpty: "Mostrando 0 de 0 de 0 Clientes",
            loadingRecords: "Cargando...",
            search: "",

        },
        responsive: true,
    }); 


    

    /**** *********** Eventos de la tabla *****************/
    // Evento para el botón 'borrar' de la tabla
    $("#tableMovements tbody").on("click", 'button[rel="delete"]', function () {
        const data = returnDataOfRow(datatable, this);
        idRowClicked = data.id;
        showDeleteModal(data);
    });
    


    return datatable;
}  
// Función para cambiar la ID de la URL
function changeUrlId(url, id) {
    console.log("URL original recibida:", url); // Verifica el valor inicial de 'url'
    console.log("ID recibido:", id); // Verifica el valor de 'id'

    if (!url) {
        console.error("El parámetro 'url' es indefinido o vacío."); // Detecta si 'url' no tiene un valor válido
        return undefined;
    }

    let num = url.match(/\d+/);
    console.log("Número encontrado en la URL:", num); // Verifica el resultado de 'match'

    let newUrl;
    if (num) {
        let numToChange = parseInt(num[0], 10);
        console.log("Número extraído para reemplazar:", numToChange); // Muestra el número extraído
        newUrl = url.replace(numToChange, id);
        console.log("Nueva URL generada:", newUrl); // Muestra la nueva URL generada
    } else {
        console.warn("No se encontró ningún número en la URL."); // Detecta si 'match' no encontró coincidencias
    }

    return newUrl;
}


function setColumnsWidth(datatable) {
    // Obtener el número de columnas
    var numColumns = datatable.columns().count();
    
    // Calcular el ancho de cada columna como porcentaje
    var columnWidth = (100 / numColumns) + '%';
    
    // Establecer el ancho para todas las columnas
    datatable.columns().every(function () {
        var column = this; // Obtener la columna actual
        
        // Aplicar el ancho calculado al encabezado de la columna
        $(column.header()).css("width", columnWidth);
    });
}


// funcion para agregar estilos extras al Datatable
function styleDatatable(){
    // Para el scrollbar
    $('.dt-scroll-body').addClass('scrollbar');
    $('.dt-layout-row.dt-layout-table > .dt-layout-cell').addClass(' scrollbar');
    
    //estilos row
    $('#tableMovements').addClass('stripe hover');
}



// Modal para eliminar un Cliente
function showDeleteModal(data) {
    
    $("#deleteMovements").modal("show");

    // Adjuntar un evento al botón de confirmación dentro del modal
    $("#confirmDelete").off("click").on("click", function(event) {
        deleteUser(data.id);
        event.preventDefault(); // Evitar que se recargue la página

        // Cierra el modal de confirmación
        $('#deleteMovements').modal('hide');
    });
}


// Realiza el control para retornar la data, ya sea de vista movil o vista pc
function returnDataOfRow(dataTable, element) {
    let data = dataTable.row($(element).parents("tr")).data();
    if (data == undefined) {
        data = dataTable.row($(element).parents("tr").prev("tr")).data();
    }
    return data;
}


// Evento para cerrar el modal desde el botón de la cabecera
$(".modal-header .close").click(function () {
    console.log("El botón de cerrar en el header fue clickeado.");
    $('#userDetailModal').modal('hide');
});

// Funcion para eliminar un Cliente
function deleteMovements(movementsID) {

    const url = changeUrlId($("#user_delete").data("url"), movementsID);

    console.log(url);
    
    let csrfToken = getCookie('csrftoken');

    $.ajax({
        url: url,
        type: 'POST',
        headers: {'X-CSRFToken': csrfToken},
        success: function(data) {
            // Elimina la fila de la tabla en el Cliente
            table.row($('#tableMovements').find('[data-id="' + movementsIDID + '"]').parents('tr')).remove().draw();
            // Muestra el mensaje de éxito
            showMessage('Cliente eliminado correctamente.', true);
            
        },
        error: function(xhr, status, error) {
            console.error('Error en la solicitud AJAX:', status, error);

            console.error('Error al realizar la solicitud AJAX para eliminar el Cliente.');
            // Muestra el mensaje de error
            showMessage('Error al eliminar el Cliente. Por favor, inténtalo de nuevo.', false);
        }
    });

}

// Función para obtener el token CSRF desde las cookies (Django)
function getCsrfToken() {
    const cookies = document.cookie.split(";");
    for (let cookie of cookies) {
        const [name, value] = cookie.trim().split("=");
        if (name === "csrftoken") {
            return value;
        }
    }
    return null;
}

// Evento para cerrar el modal desde el botón de la parte inferior
$(".modal-footer .btn-secondary").click(function () {
    console.log("El botón de cerrar en el footer fue clickeado.");
    $('#movementCreateModal').modal('hide');
});

// Capturar el evento de clic en el botón "Crear Movimiento"
$("#submitMovement").on("click", function (event) {
    event.preventDefault(); // Prevenir el comportamiento por defecto del formulario

    // Seleccionar el formulario
    const form = $("#movement-form")[0];

    // Crear un objeto FormData para enviar los datos del formulario
    const formData = new FormData(form);

    // Hacer la solicitud POST
    const createUrl = urls.movements_create; // Asegúrate de que esta URL esté definida y sea correcta
    $.ajax({
        url: createUrl,
        type: "POST",
        data: formData,
        processData: false, // Para evitar que jQuery procese automáticamente los datos
        contentType: false, // Para evitar que jQuery configure automáticamente el Content-Type
        headers: {
            "X-CSRFToken": getCsrfToken() // Incluye el token CSRF si estás usando Django
        },
        success: function (data) {
            // Manejar la respuesta del servidor
            console.log("Movimiento creado:", data);

            // Ocultar el modal
            $("#movementCreateModal").modal("hide");

            // Opcional: Actualizar la tabla
            table.ajax.reload();
        },
        error: function (xhr, status, error) {
            console.error("Error:", error);
            alert("Ocurrió un error al crear el movimiento. Por favor, inténtelo de nuevo.");
        }
    });
});
