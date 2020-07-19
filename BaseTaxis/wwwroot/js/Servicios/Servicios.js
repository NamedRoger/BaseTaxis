$(async function () {
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
            currenTab: 0,
            form: document.querySelector("#form-servicios"),
            inputs: [""],
            btns: {
                steps: document.querySelectorAll(".stepper-step"),
                prev: document.querySelector("#btn-step-prev"),
                next: document.querySelector("#btn-step-next"),
            },
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

    // Formulario Step
    let showTab = n => {
        let tabs = document.querySelectorAll(".stepper-content .tab-form ");

        tabs[n].style.display = "block";

        if (n === 0)
            Servicios.formulario.btns.prev.style.display = "none";
        else
            Servicios.formulario.btns.prev.style.display = "inline";

        if (n === (tabs.length - 1)) {
            Servicios.formulario.btns.next.innerHTML = "Guardar";
        }
        else {
            Servicios.formulario.btns.next.innerHTML = "Siguiente";
        }
        ActiveStepIndicador(n);
    }

    let setTab = async (tab) => {
        let tabs = document.querySelectorAll(".stepper-content .tab-form ");
        if (tab <= tabs.length) {
            tabs[Servicios.formulario.currenTab].style.display = "none";
        }
        Servicios.formulario.currenTab = tab;
        if (Servicios.formulario.currenTab >= tabs.length) {
            //...the form gets submitted:
            let result = await agregarServicio();
            if (result) {
                Servicios.formulario.form.reset();
                Servicios.formulario.currenTab = 0;
                setTab(0);
                recargatTablas();
                cargarBotones();
                tdToIput();
            }
            
            return;
        }
        showTab(Servicios.formulario.currenTab);
    }

    let ActiveStepIndicador = (tab) => {
        let steps = Servicios.formulario.btns.steps;
        for (let i = 0; i < steps.length; i++) {
            steps[i].classList.remove("stepper-step-isActive");
            steps[i].classList.remove("stepper-step-isValid");
        }

        for (let i = 0; i < tab; i++) {
            steps[i].classList.add("stepper-step-isValid");
        }

        steps[tab].classList.add("stepper-step-isActive");
    }

    showTab(Servicios.formulario.currenTab);

    Servicios.formulario.btns.steps.forEach((stp,idx) => {
        stp.onclick = () => {
            setTab(idx);
        }
    });

    Servicios.formulario.btns.next.onclick = () => {
        let tab = Servicios.formulario.currenTab + 1;
        setTab(tab);

    }
    Servicios.formulario.btns.prev.onclick = () => {
        let tab = Servicios.formulario.currenTab - 1;
        setTab(tab);
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
    let findIdxServicio = (id) => {
        return  Servicios.servicios.findIndex(s => s.id === id);
    }

    let createTableServiciosAsignados = () => {
        let tabla = $(Servicios.tabla.asignados.tag).DataTable({
            data: tranformarInformacionAsignados(Servicios.tabla.asignados.data),
            columns: [
                { data: 'unidad' },
                { data: 'direccion' },
                { data: 'telefono' },
                { data: 'fechaHora' },
                { data: 'usuario' },
                { data: 'tipoServicio' },
                { data: 'acciones' }
            ],
            createdRow: function (row, data, dataIndex) {
                $(row).attr('id', data.id);
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
                { data: 'usuario' },
                { data: 'tipoServicio' },
                { data: 'acciones' }
            ],
            createdRow: function (row, data, dataIndex) {
                $(row).attr('id', data.id);
            },
        });
        return tabla;
    }

    let cargarBotones = () => {
        let btnCancelar = document.querySelectorAll(".btn-cancelar");
        btnCancelar.forEach(btn => {
            btn.onclick = async () => {
                let servicioIdx = findIdxServicio(btn.dataset.id);
                let servicio = Servicios.servicios[servicioIdx];

                let result = await cancelarServicio(servicio.id);
                if (result) {
                    Servicios.servicios.splice(servicioIdx, 1);
                    recargatTablas();
                    cargarBotones();
                    tdToIput();
                    notificacion("Se ha cancelado el servicio", "success");
                } else {
                    notificacion("No se pudo cancelar el servicio", "error");
                }
            }
        });
    }

    let tdToIput = () => {
        let tds = document.querySelectorAll("table tr  td:first-child");
        let input = document.createElement("input");
        let btnAceptar = document.createElement("button");
        let btnCancelar = document.createElement("button");

        input.classList.add("form-control");
        btnAceptar.classList.add("btn", "btn-sm", "btn-success");
        btnAceptar.innerHTML = `<i class="icon ion-checkmark-outline"></i>`;
        btnCancelar.classList.add("btn", "btn-sm", "btn-danger");

        let activo = false;
        //console.log(td);
        tds.forEach(td => {
            td.ondblclick = () => {
                let tr = td.parentElement;
                let unidad = td.textContent;
                if (activo) {
                    delteInput(td, input.value);
                    activo = false;
                } else {
                    let servicio = Servicios.servicios[(findIdxServicio(tr.id))];
                    td.innerHTML = "";
                    input.value = unidad;
                    td.appendChild(input);

                    btnCancelar.onclick = () => {
                        delteInput(td, unidad);
                        activo = false;
                    }

                    btnAceptar.onclick = async () => {
                        servicio.unidad = input.value;
                        let result = await editarServicio(servicio);
                        if (result.ok) {
                            notificacion("Se ha actulizado la unidad", "success");
                            delteInput(td, input.value);
                            activo = false;
                        } else {
                            servicio.unidad = unidad;
                            notificacion("No se pudo cambiar la unidad","error");
                        }
                    }

                    td.appendChild(btnAceptar);
                    td.appendChild(btnCancelar);
                    activo = true;
                }
            }
        });
    }

    let delteInput = (td,value) => {
        td.innerHTML = `${value}`;
    }

    let getServicios = async () => {
        let result = await ajaxHelper(Servicios.apiUrl);
        if (result.ok) {
            Servicios.servicios = await result.json();
            AgruparPorTipo();
        } else {
            notificacion("Ocurrio un error al cargar los servicios", "error");
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

    let editarServicio = async (servicio) => {
        let data = new FormData();
        for (key in servicio) {
            data.append(key,servicio[key]);
        }

        let result = await ajaxHelper(`${Servicios.apiUrl}/${servicio.id}`, "put", data);
        return result;
    }

    let serivicioAsignado = async () => {

    }

    let cancelarServicio = async (id) => {
        let result = await ajaxHelper(`${Servicios.apiUrl}/${id}`, `delete`);
        return result.ok;
    }

    // ---------------------------------- Clientes ---------------------------------------------------
    let buscarCliente = async (telefono) => {
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

    let crearEventoChangeSelect = () => {
        Servicios.TiposServicios.select.tag.onchange = () => {
            
            let tipoServicio = Servicios.TiposServicios.select.tag.value;

            if (tipoServicio === Servicios.TiposServicios.select.requiereFecha) {
                document.querySelector("#div-input-fechahora").classList.remove("d-none");
            } else {
                document.querySelector("#div-input-fechahora").classList.add("d-none");
            }
        }
    }

    let cargarSelect = () => {
        
        Servicios.TiposServicios.select.options.forEach(op => {
            Servicios.TiposServicios.select.tag.appendChild(createOption(op.id, op.nombre));
        });

        if (Servicios.TiposServicios.select.tag.value != Servicios.TiposServicios.select.requiereFecha) {
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
    crearEventoChangeSelect();
    cargarBotnonBuscar();

    //servicios 
    await getServicios();

    let tablaAsignados = createTableServiciosAsignados();
    let tablaPendientes = createTableSerivciosPendientes();
    cargarBotones();
    tdToIput();

    let recargatTablas = () => {
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


class Asignado {
    constructor(id,
        unidad,
        direccion,
        telefono,
        tipoServicio,
        idUsuario,
        usuario,
        fechaHora,
        idx
    ) {
        this.id = id;
        this.unidad = unidad;
        this.direccion = direccion;
        this.telefono = telefono;
        this.tipoServicio = tipoServicio;
        this.idUsuario = idUsuario;
        this.usuario = usuario;
        this.fechaHora = fechaHora;
        this.idx = idx;
        this.acciones = `<button class="btn btn-sm btn-danger btn-cancelar" data-id=${id}>Cancelar</button>`;
    }
}

class Pendiente {
    constructor(id,
        unidad,
        direccion,
        telefono,
        tipoServicio,
        idUsuario,
        usuario,
        fechaHora,
        idx
    ) {
        this.id = id;
        this.unidad = unidad;
        this.direccion = direccion;
        this.telefono = telefono;
        this.tipoServicio = tipoServicio;
        this.idUsuario = idUsuario;
        this.usuario = usuario;
        this.fechaHora = fechaHora;
        this.idx = idx;
        this.acciones = `<button class="btn btn-sm btn-danger btn-cancelar" data-id=${id}>Cancelar</button>
        `;
    }
}
let tranformarInformacionAsignados = (data) => {
    let dataResult = [];
    data.forEach((d, idx) => dataResult.push(new Asignado(d.id, d.unidad, d.direccion,
        d.telefono, d.tipoServicio, d.idUsuario, d.usuario, d.fechaHora, idx)));
    return dataResult;
}

let tranformarInformacionPendientes = (data) => {
    let dataResult = [];
    data.forEach((d, idx) => dataResult.push(new Pendiente(d.id, d.unidad, d.direccion,
        d.telefono, d.tipoServicio, d.idUsuario, d.usuario, d.fechaHora, idx)));
    return dataResult;
}