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
    let table = document.getElementById("movementsForCash")
    let url = table.getAttribute("data-url")

    // Inicializar el DataTable
    var datatable = $('#movementsForCash').DataTable({
        layout: {
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
            { title: "Caja", data: 'cash_register', className: 'text-center d-node d-md-table-cell', responsivePriority: 1, width: "25%"  },
            { title: "Monto", data: 'amount', className: 'text-center d-node d-md-table-cell', responsivePriority: 1, width: "25%"  },
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
                            <a style="display: flex; justify-content: center; align-items: center;" href="${changeUrlId(urls.movements_update, data.id)}" class="btn btn-sm btn-default"><svg xmlns="http://www.w3.org/2000/svg" style="width: 20px; height: 20px; margin: 0;" viewBox="0 0 24 24"><path fill="currentColor" d="M5 19h1.425L16.2 9.225L14.775 7.8L5 17.575zm-2 2v-4.25L16.2 3.575q.3-.275.663-.425t.762-.15t.775.15t.65.45L20.425 5q.3.275.438.65T21 6.4q0 .4-.137.763t-.438.662L7.25 21zM19 6.4L17.6 5zm-3.525 2.125l-.7-.725L16.2 9.225z"/></svg></span></a>
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
};

// Función para cambiar la ID de la URL
function changeUrlId(url, id) {
    if (!url) {
        console.error("El parámetro 'url' es indefinido o vacío."); // Detecta si 'url' no tiene un valor válido
        return undefined;
    }
    
    // Usamos matchAll para obtener todas las coincidencias con sus detalles
    let matches = [...url.matchAll(/\d+/g)];  // Usamos el modificador 'g' para buscar todas las coincidencias
    
    let newUrl;
    if (matches) {
        let numToChange = parseInt(matches[1][0], 10);
        
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

// Ocultar el botón de crear si es necesario (puedes agregar tu propia condición)
function hideCreateButton() {
    const createButton = document.getElementById("create-Movimientos de la Caja");
    if (createButton) {
        createButton.style.display = 'none';
    }
}