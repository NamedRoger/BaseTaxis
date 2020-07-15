class UnidadTabla{
    constructor(id,unidad,idx) {
        this.unidad = unidad;
        this.idx = idx;
        this.acciones = `
            <button type="button" class="btn btn-sm btn-danger btn-borrar" data-id="${idx}">
                Eliminar
            </button>
        `;
    }
}

class AsistenciaPasada {
    constructor(id, unidad, idx) {
        this.id = id;
        this.unidad = unidad;
        this.idx = idx;
        this.acciones = `
            <button type="button" class="btn btn-sm btn-success btn-agregar" data-id="${idx}">
                Agregar
            </button>
        `;
    }
}

$(async function () {
    const Asistencias = {
        localStorage: {
            asistenciasActuales: "asistenciasActuales",
            asistenciasTemp:"asistenciasTemp"
        },
        apiUrl: "api/asistencias",
        formulario: {
            form: document.querySelector("#form-asistencias"),
            inputs: ["unidad"]
        },
        asistenciasPasadas: {
            tabla: "#tabla-asistencias-pasadas",
            data: [
            ],
            dataTemp: []

        },
        asistenciasActuales: {
            tabla: "#tabla-asistencias-actuales",
            data: [
            ]
        },

    }

    let getAsistenciasActuales = async () => {
        let data = localStorage.getItem(Asistencias.localStorage.asistenciasActuales);
        if (data != null && data != 'undefined') {
            Asistencias.asistenciasActuales.data = JSON.parse(data);
        }
    }

    await getAsistenciasActuales();

    let getAsistenciasPasadas = async () => {
        let result = await ajaxHelper(Asistencias.apiUrl);
        if (!result.ok) {
            notificacion("No se pudieron cargar las asistencias", "error");
        } else {
            let asistenciasPasadas = await result.json();
            let data = localStorage.getItem(Asistencias.localStorage.asistenciasTemp);
            //Asistencias.asistenciasPasadas.data = asistenciasPasadas;

            if (data != null && data != undefined) {
                let asistenciasPasadasFiltradas = [];
                let asistenciasTemporales = JSON.parse(data);

                Asistencias.asistenciasPasadas.dataTemp = asistenciasTemporales;
                if (asistenciasTemporales.length > 0) {
                    asistenciasPasadas
                    asistenciasPasadas.forEach(at => {
                        let existAsistencia = asistenciasTemporales.find(ap => ap.unidad == at.unidad);
                        if (!existAsistencia) {
                            asistenciasPasadasFiltradas.push(at);
                        }
                    });
                    Asistencias.asistenciasPasadas.data = asistenciasPasadasFiltradas;
                } else {
                    Asistencias.asistenciasPasadas.data = asistenciasPasadas;
                }
                
            } else {
                Asistencias.asistenciasPasadas.data = asistenciasPasadas;
            }
        }
    }

    await getAsistenciasPasadas();

    let cargarBotonesAsistenciasActuales = () => {
        let btnBorrar = document.querySelectorAll(".btn-borrar");
        btnBorrar.forEach(btn => {
            btn.onclick = (e) => {
                let asistencia = Asistencias.asistenciasActuales.data[btn.dataset.id];
                Asistencias.asistenciasActuales.data.splice(btn.dataset.id, 1);
                recargarTablaAsistenciasAct();
                cargarBotonesAsistenciasActuales();
                console.log(asistencia.unidad);
                let result = findUnidadDataTemp(asistencia.unidad);
                console.log(result);
                if (result > -1) {
                    Asistencias.asistenciasPasadas.data.push(asistencia);
                    recargarTablaAsistenciasPasd();
                    cargarBotonesAsistenciasPasadas();

                    Asistencias.asistenciasPasadas.dataTemp.splice(result, 1);
                    localStorage.setItem("asistenciasTemp", JSON.stringify(Asistencias.asistenciasPasadas.dataTemp));
                }

                localStorage.setItem(Asistencias.localStorage.asistenciasActuales, JSON.stringify(Asistencias.asistenciasActuales.data));
            }
        });
    } 

    let cargarBotonesAsistenciasPasadas = () => {
        let btnAgregar = document.querySelectorAll(".btn-agregar");
        btnAgregar.forEach(btn => {
            btn.onclick = (e) => {
                let asistencia = Asistencias.asistenciasPasadas.data[btn.dataset.id];

                //asistencias pasadas
                Asistencias.asistenciasPasadas.data.splice(btn.dataset.id, 1);
                recargarTablaAsistenciasPasd();
                cargarBotonesAsistenciasPasadas();

                //asistencias actuales
                Asistencias.asistenciasActuales.data.push(asistencia);
                recargarTablaAsistenciasAct();
                cargarBotonesAsistenciasActuales();

                //asistencias temp
                Asistencias.asistenciasPasadas.dataTemp.push(asistencia);

                localStorage.setItem(Asistencias.localStorage.asistenciasTemp, JSON.stringify(Asistencias.asistenciasPasadas.dataTemp));
                localStorage.setItem(Asistencias.localStorage.asistenciasActuales, JSON.stringify(Asistencias.asistenciasActuales.data));
            }
        });
    }

    let findUnidadDataTemp = (unidad) => {
        let asistencia = Asistencias.asistenciasPasadas.dataTemp.findIndex(a => a.unidad === unidad);
        return asistencia;
    }

    

    let createTableAsistenciasActuales = (idTabla, data) => {
        let tabla = $(idTabla).DataTable({
            data: transformarInformacionAsisAct(data),
            columns: [
                { data: 'unidad' },
                { data: 'acciones' }
            ],
            createdRow: function (row, data, dataIndex) {
                $(row).attr('id', dataIndex);
            },
        });
        return tabla;
    }

    let createTableAsistenciasPasadas = (idTabla, data) => {
        let tabla = $(idTabla).DataTable({
            data: transformarInformacionAsisPasd(data),
            columns: [
                { data: 'unidad' },
                { data: 'acciones' }
            ],
            createdRow: function (row, data, dataIndex) {
                $(row).attr('id', dataIndex);
            },
        });
        return tabla;
    }

    let tablaAsistenciasActuales = createTableAsistenciasActuales(Asistencias.asistenciasActuales.tabla, Asistencias.asistenciasActuales.data);
    cargarBotonesAsistenciasActuales();

    let recargarTablaAsistenciasAct = () => {
        tablaAsistenciasActuales.clear().draw();
        tablaAsistenciasActuales.rows.add(transformarInformacionAsisAct(Asistencias.asistenciasActuales.data)).draw();
    }

   
    let tablaAsistenciasPasadas = createTableAsistenciasPasadas(Asistencias.asistenciasPasadas.tabla, Asistencias.asistenciasPasadas.data);
    cargarBotonesAsistenciasPasadas();

    let recargarTablaAsistenciasPasd = () => {
        tablaAsistenciasPasadas.clear().draw();
        tablaAsistenciasPasadas.rows.add(transformarInformacionAsisPasd(Asistencias.asistenciasPasadas.data)).draw();

    }

    Asistencias.formulario.form.onsubmit = (e) => {
        e.preventDefault();
        let asistencia = {};
        let input = Asistencias.formulario.form.elements["unidad"];
        if (input.value.trim() === "") {
            return 
        }

        asistencia.unidad = input.value.trim();

        Asistencias.asistenciasActuales.data.push(asistencia);
        recargarTablaAsistenciasAct();
        cargarBotonesAsistenciasActuales();
        Asistencias.formulario.form.reset();

        localStorage.setItem(Asistencias.localStorage.asistenciasActuales, JSON.stringify(Asistencias.asistenciasActuales.data));
    }

    document.querySelector("#btn-guardar").onclick = async () => {
        let asistencias = Asistencias.asistenciasActuales.data.map(a => a.unidad);
        let data = {
            asistencias
        };
        //data.append("asistencias", asistencias);
        let result = await ajaxHelper(Asistencias.apiUrl, 'Post', JSON.stringify(asistencias));
        if (result.ok) {
            Asistencias.asistenciasActuales.data = [];
            recargarTablaAsistenciasAct();
            cargarBotonesAsistenciasActuales();
            notificacion("Se han insertado las asistencias", "success");
            localStorage.clear();
        }
    };
});

let ajaxHelper = (url, method = "get", body = null) => {
    let configInit = {
        headers: {
            "Content-Type":"application/json"
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

let transformarInformacionAsisAct = (data) => {
    let dataResult = [];
    data.forEach((d, idx) => dataResult.push(new UnidadTabla(d.id,d.unidad,idx)));
    return dataResult;
}

let transformarInformacionAsisPasd = (data) => {
    let dataResult = [];
    data.forEach((d, idx) => dataResult.push(new AsistenciaPasada(d.id, d.unidad, idx)));
    return dataResult;
}