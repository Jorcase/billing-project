let customerID;
let table;
let urls;

$(document).ready(function () {
    // Obtener las URLs definidas en el template
    urls = JSON.parse(document.getElementById("urls-data").textContent);

    console.log("URLs disponibles:", urls);

    // Ejemplo: Usar las URLs en tu lógica
    const createUrl = urls.user_create;
    // Inicializar la tabla de datos
    table = initializeDataTable();      
    
    styleDatatable()
    
    setColumnsWidth(table);

    // Funcion que me permite cerrar las notificaciones flash
    $('.btn-close').click(function() {
        $(this).closest('.alert').fadeOut();
    });

    // Evento para el boton de crear
    document.getElementById("create-Usuarios").addEventListener("click", function() {
        window.location.href = createUrl;
    });
});


function initializeDataTable() { 
    // Obtener la URL de los datos de la tabla
    let table = document.getElementById("tableUser")
    let url = table.getAttribute("data-url")

    // Inicializar el DataTable
    var datatable = $('#tableUser').DataTable({
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
            { title: "Usuario", data: 'username', className: 'text-center d-node d-md-table-cell', responsivePriority: 1, width: "15%"  },
            { title: "Correo", data: 'email', className: 'text-center d-node d-md-table-cell', responsivePriority: 3, width: "25%"  },
            { 
                title: "Estado", 
                data: 'is_active', 
                className: 'text-center d-node d-md-table-cell', 
                responsivePriority: 5, 
                width: "15%",
                render: function(data, type, row) {
                    if (type === 'display') {
                        return data 
                            ? '<span class="badge bg-success">Activo</span>' 
                            : '<span class="badge bg-danger">Inactivo</span>';
                    }
                    return data; // Devuelve el valor sin formato para exportar u ordenar
                }
            },
            { 
                title: "Última Sesión", // Corregida la ortografía
                data: 'last_login', 
                className: 'text-center d-node d-md-table-cell', 
                responsivePriority: 6, 
                width: "30%",
                render: function(data, type, row) {
                    if (type === 'display' && data) {
                        // Formatear la fecha a un formato más amigable
                        const date = new Date(data);
                        const options = { 
                            day: '2-digit', 
                            month: 'long', 
                            year: 'numeric', 
                            hour: '2-digit', 
                            minute: '2-digit', 
                            second: '2-digit' 
                        };
                        return date.toLocaleString('es-ES', options); // Formato amigable para español
                    }
                    return data ? data : "Nunca ha iniciado sesión"; // Mensaje por defecto si no hay datos
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
                                data-id="${changeUrlId(urls.user_detail, data.id)}">
                                <svg xmlns="http://www.w3.org/2000/svg" style="width: 20px; height: 20px; margin: 0;" viewBox="0 0 24 24"><path fill="currentColor" d="M16 11q-2.075 0-3.85-1t-2.8-2.8q-.1-.175-.137-.337T9.175 6.5t.038-.363t.137-.337q1-1.8 2.788-2.8T16 2t3.85 1t2.8 2.8q.1.175.138.338t.037.362t-.037.363t-.138.337q-1 1.8-2.787 2.8T16 11m0-2q1.05 0 1.775-.725T18.5 6.5t-.725-1.775T16 4t-1.775.725T13.5 6.5t.725 1.775T16 9m0-1q-.625 0-1.063-.437T14.5 6.5t.438-1.062T16 5t1.063.438T17.5 6.5t-.437 1.063T16 8M7.825 23q-.6 0-1.15-.225t-.975-.65L1.3 17.7q-.275-.275-.288-.687t.263-.713l.15-.15q.35-.35.85-.475t1 0l1.725.5V8q0-.425.288-.712T6 7t.713.288T7 8v7h1v-3q0-.425.288-.712T9 11t.713.288T10 12v3h1v-2q0-.425.288-.712T12 12t.713.288T13 13v2h1q0-.425.288-.712T15 14t.713.288T16 15v4q0 1.65-1.175 2.825T12 23z"/></svg>
                            </button>
                            <a style="display: flex; justify-content: center; align-items: center;" href="${changeUrlId(urls.user_edit, data.id)}" class="btn btn-sm btn-default"><svg xmlns="http://www.w3.org/2000/svg" style="width: 20px; height: 20px; margin: 0;" viewBox="0 0 24 24"><path fill="currentColor" d="M5 19h1.425L16.2 9.225L14.775 7.8L5 17.575zm-2 2v-4.25L16.2 3.575q.3-.275.663-.425t.762-.15t.775.15t.65.45L20.425 5q.3.275.438.65T21 6.4q0 .4-.137.763t-.438.662L7.25 21zM19 6.4L17.6 5zm-3.525 2.125l-.7-.725L16.2 9.225z"/></svg></span></a>
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
    $("#tableUser tbody").on("click", 'button[rel="delete"]', function () {
        const data = returnDataOfRow(datatable, this);
        idRowClicked = data.id;
        showDeleteModal(data);
    });
    
    // Evento para el botón 'detalle' de la tabla
    $("#tableUser tbody").on("click", 'button[rel="detail"]', function () {
        const data = returnDataOfRow(datatable, this);
        idRowClicked = data.id;
        showDetailModal(idRowClicked); // Llama a la función para mostrar el modal
    });


    return datatable;
}  
// Función para cambiar la ID de la URL
function changeUrlId(url, id) {
    // console.log("URL original recibida:", url); // Verifica el valor inicial de 'url'
    // console.log("ID recibido:", id); // Verifica el valor de 'id'

    if (!url) {
        // console.error("El parámetro 'url' es indefinido o vacío."); // Detecta si 'url' no tiene un valor válido
        return undefined;
    }

    let num = url.match(/\d+/);
    // console.log("Número encontrado en la URL:", num); // Verifica el resultado de 'match'

    let newUrl;
    if (num) {
        let numToChange = parseInt(num[0], 10);
        // console.log("Número extraído para reemplazar:", numToChange); // Muestra el número extraído
        newUrl = url.replace(numToChange, id);
        // console.log("Nueva URL generada:", newUrl); // Muestra la nueva URL generada
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
    $('#tableUser').addClass('stripe hover');
}

// Modal para eliminar un Usuario
function showDeleteModal(data) {
    // Mostrar el modal
    $("#deleteModal").modal("show");

    // Captura el evento submit del formulario
    $("#deleteModal form").off("submit").on("submit", function(event) {
        event.preventDefault(); // Prevenir que se recargue la página

        // Llama a la función de eliminación (puedes hacer una petición AJAX aquí)
        deleteUser(data.id);

        // Cierra el modal de confirmación
        $('#deleteModal').modal('hide');
    });
};

// Modal para mostrar detalles del usuario
function showDetailModal(userId) {
    console.log(userId)
    $.ajax({
        url: `/users/detail/${userId}/`, // Asegúrate de que este sea el endpoint correcto
        method: 'GET',
        success: function (response) {
            if (response.status === 'success') {
                const user = response.user;
                
                // Llenar los campos del modal con los datos recibidos
                $("#userFullName").text(user.get_full_name || 'N/A');
                $("#userUsername").text(user.username || 'N/A');
                $("#userEmail").text(user.email || 'N/A');
                $("#userStatus").html(user.is_active ? '<span class="badge bg-success">Activo</span>' : '<span class="badge bg-danger">Inactivo</span>');
                $("#userCreatedAt").text(formatDateTime(user.created_at));
                $("#userLastLogin").text(formatDateTime(user.last_login));
                $("#userUpdatedAt").text(formatDateTime(user.updated_at));
                $("#userDeletedAt").text(formatDateTime(user.deleted_at));
                $("#userIsAdmin").text(user.is_staff ? 'Sí' : 'No');

                // Mostrar el modal
                $("#userDetailModal").modal("show");
            } else {
                alert(response.message || 'Hubo un error al obtener los detalles.');
            }
        },
        error: function (xhr) {
            alert(`Error al cargar los detalles del usuario: ${xhr.statusText}`);
        }
    });
};

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

// Funcion para eliminar un Usuario
function deleteUser(userID) {
    // Obtén la URL de eliminación y reemplaza el ID de usuario
    const url = urls.user_delete.replace('0', userID);
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
            // Aquí puedes recargar los datos desde el servidor, si es necesario
            // table.ajax.reload();  // Recarga los datos de la tabla desde el servidor

            // También puedes optar por solo reiniciar la tabla sin eliminar una fila manualmente
            table.clear().draw();  // Elimina todas las filas y vuelve a dibujar la tabla
    
        },
        error: function(xhr, status, error) {
            console.error('Error en la solicitud AJAX:', status, error);
        }
    });
};

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

// Evento para cerrar el modal desde el botón de la parte inferior
$(".modal-footer .btn-secondary").click(function () {
    console.log("El botón de cerrar en el footer fue clickeado.");
    $('#userDetailModal').modal('hide');
});

// Evento para cerrar el modal desde el botón de la parte inferior
$(".modal-footer .btn-secondary").click(function () {
    console.log("El botón de cerrar en el footer fue clickeado.");
    $('#deleteModal').modal('hide');
});