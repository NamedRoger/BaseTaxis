$.fn.steps.setStep = function (step) {
    var currentIndex = $(this).steps('getCurrentIndex');
    for (var i = 0; i < Math.abs(step - currentIndex); i++) {
        if (step > currentIndex) {
            $(this).steps('next');
        }
        else {
            $(this).steps('previous');
        }
    }
};

$(async function () {
    let createWizard = async () => {
        $('#form-servicios').steps({
            headerTag: 'h3',
            bodyTag: 'section',
            autoFocus: true,
            titleTemplate: '<span class="number">#index#<\/span> <span class="title">#title#<\/span>',
            transitionEffect: "fade",
            labels: {
                cancel: "Cancelar",
                current: "current step:",
                pagination: "Paginación",
                finish: "Terminar",
                next: "Siguiente",
                previous: "Anterior",
                loading: "Loading ..."
            },
            enableAllSteps: true,
            onFinishing: async () => {
                return await agregarServicio();
            },
            onFinished: async (event, currentIdx) => {
                $("#form-servicios").steps("destroy");
                await createWizard();
                cargarBotnonBuscar();
                recargatTablas();
                //$("#wizard1").steps("setStep", 0);
            }
        });
    }
    await createWizard();

    const Servicios = {
        apiUrl: "api/Servicios",
        servicios: [],
        tabla: {
            asignados: {
                tag: "#tabla-asignados",
                data: []
            },
            reservados: {
                tag: "#tabla-reservados",
                data: []
            }
        },
        formulario: {
            form: document.querySelector("#form-servicios"),
            inputs: [""],
            clienteNuevo: false
        },
        TiposServicios: {
            apiUrl: "api/TipoServicios",
            select: {
                tag: document.querySelector("#select-tipo-servicio"),
                options: [],
                requiereFecha: ""
            }
        },
        Clientes: {
            apiUrl: "api/Clientes",
            cliente: {
                telefono: "#Telefono",
                direccion: "#Direccion"
            }
        }

    }

    //------------------------------------ botones -----------------------------------------------
    let cargarBotnonBuscar = async () => {
        // buscar cliente
        document.querySelector("#buscar-cliente").onclick = async () => {
            let telefono = document.querySelector("#Telefono").value;
            if (telefono.trim() === "") return;

            let result = await buscarCliente(telefono);
            if (result.exist) {
                document.querySelector(Servicios.Clientes.cliente.direccion).value = result.cliente.direccion;
            } else {
                document.querySelector(Servicios.Clientes.cliente.direccion).value = "";
                alert("El cliente no existe, se creara un nuevo registro del cliente");
            }
        };
    }

    //----------------------------------- Servicios ---------------------------------------------
    let createTableServiciosAsignados = () => {
        let tabla = $(Servicios.tabla.asignados.tag).DataTable({
            data: tranformarInformacionAsignados(Servicios.tabla.asignados.data),
            columns: [
                { data: 'unidad' },
                { data: 'direccion' },
                { data: 'telefono' },
                { data: 'fechaHora' },
                { data: 'idUsuario' },
                { data: 'tipoServicio' },
                { data: 'acciones' }
            ],
            createdRow: function (row, data, dataIndex) {
                $(row).attr('id', dataIndex);
            },
        });
        return tabla;
    }

    let createTableSerivciosPendientes = () => {
        let tabla = $(Servicios.tabla.reservados.tag).DataTable({
            data: tranformarInformacionPendientes(Servicios.tabla.reservados.data),
            columns: [
                { data: 'unidad' },
                { data: 'direccion' },
                { data: 'telefono' },
                { data: 'fechaHora' },
                { data: 'idUsuario' },
                { data: 'tipoServicio' },
                { data: 'acciones' }
            ],
            createdRow: function (row, data, dataIndex) {
                $(row).attr('id', dataIndex);
            },
        });
        return tabla;
    }

    let getServicios = async () => {
        let result = await ajaxHelper(Servicios.apiUrl);
        if (result.ok) {
            Servicios.servicios = await result.json();
            AgruparPorTipo();
        } else {
            notificacion("Ocurrio un error al cargar los servicios","error");
        }
    }

    let AgruparPorTipo = () => {
        let asignados = [];
        let pendientes = [];

        asignados = Servicios.servicios.filter(s => s.estatusServicio.toUpperCase().trim() == "Asignado".toUpperCase());
        pendientes = Servicios.servicios.filter(s => s.estatusServicio.toUpperCase().trim() == "En espera".toUpperCase());

        Servicios.tabla.asignados.data = asignados;
        Servicios.tabla.reservados.data = pendientes;
    }

   

    let agregarServicio = async () => {
        let data = new FormData(Servicios.formulario.form);
        let result = await ajaxHelper(Servicios.apiUrl, "post", data);

        if (result.ok) {
            notificacion("Se ha agregado un nuevo servicio", "success");
            Servicios.servicios.push(await result.json());
            return true;
        } else {
            notificacion("Ocurrio un error", "error");
            return false;

        }
    }

    let editarServicio = async () => {

    }

    let cancelarServicio = async () => {

    }

    // ---------------------------------- Clientes ---------------------------------------------------
    let buscarCliente = async (telefono) => {
        console.log("click buscar")
        let result = await ajaxHelper(`${Servicios.Clientes.apiUrl}/${telefono}`);
        if (result.ok) {
            return {
                cliente: await result.json(),
                exist: true
            };
        } else {
            return {
                cliente: null,
                exist: false
            };
        }
    }

   

    //----------------------------------- Tipo Servicios ---------------------------------------------
    let getTipoServicios = async () => {
        let result = await ajaxHelper(Servicios.TiposServicios.apiUrl);
        if (!result.ok) {
            notificacion("Ocurrió un error", "error");
            return
        } else {

            let opts = await result.json();
            Servicios.TiposServicios.select.options = opts;
            
            let requiereFecha = opts.find(o => o.nombre.toUpperCase().trim() === "RESERVADO");
            Servicios.TiposServicios.select.requiereFecha = requiereFecha.id;
        }
    }

    Servicios.TiposServicios.select.tag.onchange = () => {
        let tipoServicio = Servicios.TiposServicios.select.tag.value;

        if (tipoServicio === Servicios.TiposServicios.select.requiereFecha) {
            document.querySelector("#div-input-fechahora").classList.remove("d-none");
        } else {
            document.querySelector("#div-input-fechahora").classList.add("d-none");
        }
    }

    let cargarSelect = () => {
        Servicios.TiposServicios.select.options.forEach(op => {
            Servicios.TiposServicios.select.tag.appendChild(createOption(op.id, op.nombre));
        });

        if (Servicios.TiposServicios.select.tag.value !== Servicios.TiposServicios.select.requiereFecha) {
            document.querySelector("#div-input-fechahora").classList.add("d-none");
        }
    }

    let createOption = (value, Texto) => {
        let option = document.createElement("option");
        option.value = value;
        option.text = Texto;
        return option;
    }

    //-------------------------------------------------- Formulario -------------------------------

    //--------------------------------------------------- Main -----------------------------------
    
        //cargar form 

        //Tipo servicios
        await getTipoServicios();

        cargarSelect();
        cargarBotnonBuscar();

        //servicios 
        await getServicios();

        let tablaAsignados = createTableServiciosAsignados();
        let tablaPendientes = createTableSerivciosPendientes();


    let recargatTablas = () => {
        console.log("Hola");
        AgruparPorTipo();
        tablaAsignados.clear().draw();
        tablaAsignados.rows.add(tranformarInformacionAsignados(Servicios.tabla.asignados.data)).draw();

        tablaPendientes.clear().draw();
        tablaPendientes.rows.add(tranformarInformacionPendientes(Servicios.tabla.reservados.data)).draw();
    }
   
});

let ajaxHelper = (url, method = "get", body = null) => {
    let configInit = {
        headers: {
           
        },
        method: method
    }

    if (body != null) configInit.body = body;

    let result = fetch(url, configInit);

    return result;
}

let notificacion = (mensaje, type) => {
    notif({
        msg: mensaje,
        type: type
    });
}

function _goToStep(wizard, options, state, index) {
    return paginationClick(wizard, options, state, index);
}


class Asignado {
    constructor(id,
        unidad,
        direccion,
        telefono,
        tipoServicio,
        idUsuario,
        fechaHora,
        idx
    ) {
        this.id = id;
        this.unidad = unidad;
        this.direccion = direccion;
        this.telefono = telefono;
        this.tipoServicio = tipoServicio;
        this.idUsuario = idUsuario;
        this.fechaHora = fechaHora;
        this.idx = idx;
        this.acciones = `<button class="btn btn-sm btn-danger btn-cancelar" data-id=${idx}>Cancelar</button>`;
    }
}

class Pendiente {
    constructor(id,
        unidad,
        direccion,
        telefono,
        tipoServicio,
        idUsuario,
        fechaHora,
        idx
    ) {
        this.id = id;
        this.unidad = unidad;
        this.direccion = direccion;
        this.telefono = telefono;
        this.tipoServicio = tipoServicio;
        this.idUsuario = idUsuario;
        this.fechaHora = fechaHora;
        this.idx = idx;
        this.acciones = `<button class="btn btn-sm btn-danger btn-cancelar" data-id=${idx}>Cancelar</button>
            <button class="btn btn-sm btn-success btn-cancelar" data-id=${idx}>Asignado</button>
        `;
    }
}
let tranformarInformacionAsignados = (data) => {
    let dataResult = [];
    data.forEach((d, idx) => dataResult.push(new Asignado(d.id, d.unidad, d.direccion,
        d.telefono, d.tipoServicio, d.idUsuario, d.fechaHora,idx)));
    return dataResult;
}

let tranformarInformacionPendientes = (data) => {
    let dataResult = [];
    data.forEach((d, idx) => dataResult.push(new Pendiente(d.id, d.unidad, d.direccion,
        d.telefono, d.tipoServicio, d.idUsuario, d.fechaHora, idx)));
    return dataResult;
}