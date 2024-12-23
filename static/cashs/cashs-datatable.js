let cashID;
let table;
let urls;

$(document).ready(function () {
    // Obtener las URLs definidas en el template
    urls = JSON.parse(document.getElementById("urls-data").textContent);

    console.log("URLs disponibles:", urls);
    // Inicializar la tabla de datos
    table = initializeDataTable();      
    
    styleDatatable()
    
    setColumnsWidth(table);

    // Funcion que me permite cerrar las notificaciones flash
    $('.btn-close').click(function() {
        $(this).closest('.alert').fadeOut();
    });

    // Llamar a hideCreateButton() donde necesites ocultarlo
    hideCreateButton();
});


function initializeDataTable() { 
    // Obtener la URL de los datos de la tabla
    let table = document.getElementById("tableCash")
    let url = table.getAttribute("data-url")

    // Inicializar el DataTable
    var datatable = $('#tableCash').DataTable({
        layout: {
            top2Start: function () {
                let toolbar = document.createElement('div');
                toolbar.innerHTML = `
                <div>
                    <a href="${urls.cash_create}" class="btn btn-primary btn-simple btn-sm me-1 my-2" type="button">
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
            { title: "ID", data: 'id', className: "text-center d-none d-md-table-cell", responsivePriority: 4, width: "10%" }, 
            { title: "Monto Inicial", data: 'initial_balance', className: 'text-center d-node d-md-table-cell', responsivePriority: 1, width: "25%" }, 
            { title: "Monto Final", data: 'current_balance', className: 'text-center d-node d-md-table-cell', responsivePriority: 3, width: "25%" }, 
            {
                title: "Estado", 
                data: 'status', 
                className: 'text-center d-node d-md-table-cell', 
                responsivePriority: 5, 
                width: "15%",
                render: function(data, type, row) {
                    if (type === 'display') {
                        if (data === 'open') {
                            return '<span class="badge bg-success">Abierta</span>';
                        } else if (data === 'closed') {
                            return '<span class="badge bg-danger">Cerrada</span>';
                        }
                    }
                    return data; // Devuelve el valor sin formato para exportar u ordenar
                }
            },
            {
                title: "Abierta", 
                data: 'created_at',
                className: 'text-center d-node d-md-table-cell', 
                responsivePriority: 2, 
                width: "15%",
                render: function(data, type, row) {
                    if (type === 'display' && data) {
                        return formatDateTime(data);  // Aplica la función de formateo de fecha
                    }
                    return data; // Devuelve el valor sin formato para exportar u ordenar
                }
            },
            { title: "Fecha de cierre", data: 'close_date', className: 'text-center d-node d-md-table-cell', responsivePriority: 3, width: "25%" }, 
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
                            <a style="display: flex; justify-content: center; align-items: center;" href="${changeUrlId(urls.cash_detail, data.id)}" class="btn btn-sm btn-primary"><svg xmlns="http://www.w3.org/2000/svg" style="width: 20px; height: 20px; margin: 0;" viewBox="0 0 24 24"><path fill="currentColor" d="M16 11q-2.075 0-3.85-1t-2.8-2.8q-.1-.175-.137-.337T9.175 6.5t.038-.363t.137-.337q1-1.8 2.788-2.8T16 2t3.85 1t2.8 2.8q.1.175.138.338t.037.362t-.037.363t-.138.337q-1 1.8-2.787 2.8T16 11m0-2q1.05 0 1.775-.725T18.5 6.5t-.725-1.775T16 4t-1.775.725T13.5 6.5t.725 1.775T16 9m0-1q-.625 0-1.063-.437T14.5 6.5t.438-1.062T16 5t1.063.438T17.5 6.5t-.437 1.063T16 8M7.825 23q-.6 0-1.15-.225t-.975-.65L1.3 17.7q-.275-.275-.288-.687t.263-.713l.15-.15q.35-.35.85-.475t1 0l1.725.5V8q0-.425.288-.712T6 7t.713.288T7 8v7h1v-3q0-.425.288-.712T9 11t.713.288T10 12v3h1v-2q0-.425.288-.712T12 12t.713.288T13 13v2h1q0-.425.288-.712T15 14t.713.288T16 15v4q0 1.65-1.175 2.825T12 23z"/></svg></span></a>
                            <button style="display: flex; justify-content: center; align-items: center;" rel="delete" class="btn btn-sm btn-danger" data-toggle="modal" data-target="#cash_delete" data-id="${changeUrlId(urls.cash_delete, data.id)}">
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
            lengthMenu: 'Mostrar _MENU_ Clientes',
            decimal: "",
            emptyTable: "No hay Clientes que mostrar",
            info: "Mostrando _START_ a _END_ de _TOTAL_ Clientes",
            infoEmpty: "Mostrando 0 de 0 de 0 Clientes",
            loadingRecords: "Cargando...",
            search: "",

        },
        responsive: true,
    }); 


    /**** *********** Eventos de la tabla *****************/
    // Evento para el botón 'borrar' de la tabla
    $("#tableCash tbody").on("click", 'button[rel="delete"]', function () {
        const data = returnDataOfRow(datatable, this);
        idRowClicked = data.id;
        showDeleteModal(data);
    });
    
    $("#tableCash tbody").on("click", 'button[rel="detail"]', function () {
        const data = returnDataOfRow(datatable, this);
        idRowClicked = data.id;
        showDetailModal(idRowClicked); // Llama a la función para mostrar el modal
    });


    return datatable;
}  
// Función para cambiar la ID de la URL
function changeUrlId(url, id) {
    if (!url) {
        console.error("El parámetro 'url' es indefinido o vacío."); // Detecta si 'url' no tiene un valor válido
        return undefined;
    }

    let num = url.match(/\d+/);

    let newUrl;
    if (num) {
        let numToChange = parseInt(num[0], 10);
        newUrl = url.replace(numToChange, id);
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
    $('#tableCash').addClass('stripe hover');
}

// Modal para eliminar una caja
function showDeleteModal(data) {
    // Mostrar el modal
    $("#deleteModal").modal("show");

    // Captura el evento submit del formulario
    $("#deleteModal form").off("submit").on("submit", function(event) {
        event.preventDefault();
        console.log("ESTOY PASANDO LA FUNCION DEL EVENTO") // Prevenir que se recargue la página

        // Llama a la función de eliminación (puedes hacer una petición AJAX aquí)
        deleteCash(data.id);

        // Cierra el modal de confirmación
        $('#deleteModal').modal('hide');
    });
};

// Funcion para eliminar un Usuario
function deleteCash(cashID) {
    // Obtén la URL de eliminación y reemplaza el ID de usuario
    const url = urls.cash_delete.replace('0', cashID);
    console.log(url);  // Verifica que la URL sea correcta

    // Obtén el token CSRF
    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;


    $.ajax({
        url: url,
        type: 'POST',
        data: {
            'csrfmiddlewaretoken': csrfToken  // Asegúrate de incluir el token CSRF
        },
        success: function(data) {
            console.log("ESTOY ELIMINANDO CORRECTAMENTE")
            // Aquí puedes recargar los datos desde el servidor, si es necesario
            table.ajax.reload();  // Recarga los datos de la tabla desde el servidor

            // También puedes optar por solo reiniciar la tabla sin eliminar una fila manualmente
            // table.clear().draw();  
            // Elimina todas las filas y vuelve a dibujar la tabla
            
    
        },
        error: function(xhr, status, error) {
            console.error('Error en la solicitud AJAX:', status, error);
        }
    });
};





function getCsrfToken() {
    return document.querySelector('[name=csrfmiddlewaretoken]').value;
}

function showDetailModal(cashID) {
    console.log(`Obteniendo detalles para la caja con ID: ${cashID}`);
    $.ajax({
        url: `/cash/detail/${cashID}/`,
        method: 'GET',
        data: {
            csrfmiddlewaretoken: getCsrfToken()
        },
        success: function (response) {
            if (response.status === 'success') {
                const cash = response.cash;

                $("#cashInitialBalance").text(cash.initial_balance || 'N/A');
                $("#cashCurrentBalance").text(cash.current_balance || 'N/A');
                $("#cashStatus").html(
                    cash.status === 'open'
                        ? '<span class="badge bg-success">Abierta</span>'
                        : '<span class="badge bg-danger">Cerrada</span>'
                );
                $("#cashCloseDate").text(formatDateTime(cash.close_date) || 'N/A');
                $("#cashCreatedAt").text(formatDateTime(cash.created_at) || 'N/A');
                $("#cashUpdatedAt").text(formatDateTime(cash.updated_at) || 'N/A');

                $("#cashDetailModal").modal("show");
            } else {
                console.error('No se pudo obtener los detalles de la caja:', response.message);
                alert("Error al cargar los detalles de la caja.");
            }
        },
        error: function (xhr) {
            console.error('Error en la petición AJAX:', xhr.responseText);
            alert("Hubo un error al intentar obtener los detalles.");
        }
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

/****************************************************************************************************/
/******************************************** EVENTOS      ******************************************/
/****************************************************************************************************/


// Captura el evento del botón "Cerrar caja" para abrir el modal
$('#close-cash-btn').on('click', function () {
    $('#closeCashModal').modal('show'); // Muestra el modal
});


// Evento para el botón de cerrar caja
$("#confirmCloseButton").on("click", function (event) {
    event.preventDefault();
    
    // URL hardcoded
    const url = urls.cash_close // Asegúrate de que coincida con tu configuración de URL
    console.log("URL para cerrar la caja:", url);
    
    const csrfToken = $("[name=csrfmiddlewaretoken]").val(); // Obtener CSRF token

    $.ajax({
        url: url,
        method: "POST",
        headers: {
            "X-CSRFToken": csrfToken,
        },
        success: function (data) {
            if (data.success) {
                // Creo que con BOOTRATP NOTIFY SE PUEDE HACER ALGO
                // Generar notificación en caso de éxito o fallo según el response
                const message = data.message || "¡Operación realizada con éxito!";
                const tags = data.success ? "success" : "danger"; // Determinar tipo basado en el éxito

                showNotification(message, tags); // Usar función genérica
                // Recargar la página después de 2 segundos para permitir ver la notificación
                setTimeout(function () {
                    console.log("Se actualiza en 2 seg")
                }, 2500);
            } else {
                // Generar notificación en caso de error
                const message = "Ocurrió un error inesperado al cerrar la caja.";
                showNotification(message, "danger");
            }
        },
        error: function (xhr, status, error) {
            console.error("Error:", error);
            alert("Ocurrió un error al cerrar la caja.");
        },
    });
});

// Evento para el boton de crear
$(document).on("click", "#create-Movimientos", function() {
    // Aquí activamos el modal de creación
    $('#movementCreateModal').modal('show');
});

$("#submitMovement").on("click", (event) => {
    event.preventDefault(); // Prevenir el comportamiento por defecto del formulario

    const form = $("#movement-form")[0];
    const formData = new FormData(form);
    console.log(formData)

    const createUrl = urls.movement_create; // Asegúrate de que esta URL esté definida
    console.log("URL MOVIMIENTO EN CAJA --> ", createUrl);
    
    $.ajax({
        url: createUrl,
        type: "POST",
        data: formData,
        processData: false,  // No procesar los datos
        contentType: false,  // No establecer el tipo de contenido
        headers: {
            "X-CSRFToken": getCsrfToken() // Incluye el token CSRF si estás usando Django
        },
        success: (data) => {
            console.log("Movimiento creado:", data);
            $("#movementCreateModal").modal("hide");
            // Generar notificación en caso de éxito o fallo según el response
            const message = data.message || "¡Movimiento Creado con éxito!";
            const tags = "success"; // Siempre será success

            showNotification(message, tags); // Usar función genérica
            // Recargar la página después de 2 segundos para permitir ver la notificación
            setTimeout(function () {
                // Si es un egreso, se resta del saldo actual
                var updatedBalance = parseFloat(data.cash.current_balance); // Convertir a número

                // Actualizar el saldo mostrado en la interfaz
                $("#current_balance").text("$" + updatedBalance.toFixed(2)); // Actualiza el saldo
                console.log("Se actualiza en 2 seg")
            }, 2000);
        },
        error: (xhr, status, error) => {
            console.error("Error:", error);
            // Generar notificación en caso de éxito o fallo según el response
            const message = data.message || "¡Error al crear un Movimiento!";
            const tags = "danger"; // Siempre será success

            showNotification(message, tags); // Usar función genérica
            // Recargar la página después de 2 segundos para permitir ver la notificación
            setTimeout(function () {
                console.log("Error")
            }, 2000);
        }
    });
});

/****************************************************************************************************/
/****************************************************************************************************/
/****************************************************************************************************/

// Funcion que me permite formatear una fecha dada
function formatDateTime(dateString) {
    if (!dateString) return 'N/A'; // Si no hay fecha, devuelve 'N/A'
    const date = new Date(dateString);
    return date.toLocaleString('es-ES', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric',
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false // 24-hour format
    });
};

// Ocultar el botón de crear si es necesario (puedes agregar tu propia condición)
function hideCreateButton() {
    const createButton = document.getElementById("create-Cajas");
    if (createButton) {
        createButton.style.display = 'none';
    }
}

// Función genérica para mostrar notificaciones
function showNotification(message, tags) {
    $.notify(
        { message: message },
        {
            type: tags || "info", // Tipo de notificación (success, danger, etc.)
            placement: {
                from: "top",
                align: "center",
            },
            delay: 3000, // Tiempo visible (3 segundos)
            animate: {
                enter: "animated fadeInDown",
                exit: "animated fadeOutUp",
            },
            template: `
                <div data-notify="container" class="col-11 col-md-4 alert alert-{0}" role="alert">
                    <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                        <i class="material-icons">close</i>
                    </button>
                    <span data-notify="message">{2}</span>
                </div>
            `,
        }
    );
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

/***************************************** ************************************ ********************************** *************************************/
/***************************************** Para ERRORES ********************************** *************************************/
/***************************************** ************************************ ********************************** *************************************/
// Mostrar modal
$('#movementCreateModal').on('shown.bs.modal', function () {
    $(this).attr('aria-hidden', 'false');
});

// Ocultar modal
$('#movementCreateModal').on('hidden.bs.modal', function () {
    $(this).attr('aria-hidden', 'true');
});
