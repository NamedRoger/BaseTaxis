$(async function () {
    const Constantes = {
        apiUrl: {
            asistencias: "/api/Bases/asistencias",
            bases: "/api/Bases"
        },
        asistencias: {
            data: [],
            groups: {

            }
        },
        bases: [],
        formulario: {
            tag: document.querySelector("#form-asistencias")
        },
        tablas:[]

    }

    //----------------------------------------------------------- Bases -------------------------------------------------
    let getBases = async () => {
        let result = await ajaxHelper(Constantes.apiUrl.bases);
        if (!result.ok) {
            notificacion("Ocurrio un error al obtener las bases","error");
            return false;
        }
        Constantes.bases = await result.json();
    };


    let cargarSelect = () => {
        let select = document.querySelector("#Bases");
        Constantes.bases.forEach(base => select.appendChild(createOption(base.id,base.nombre)));
    }

    let createOption = (value,text) => {
        let op = document.createElement("option");
        op.value = value;
        op.text = text;
        return op;
    }

    //--------------------------------------------------------- Asistencias  --------------------------------------------
    let getAsistencias = async () => {
        let result = await ajaxHelper(Constantes.apiUrl.asistencias);
        if (!result.ok) {
            notificacion("Ocurrio un error al obtener las asistencias");
            return false;
        }
        Constantes.asistencias.data = await result.json();
    }

    let agruparAsistencias = () => {
        let asistencias = Constantes.asistencias.data;
        Constantes.bases.forEach(base => {
            let asistencias = Constantes.asistencias.data.filter(a => a.idBase == base.id);
            Constantes.asistencias.groups[base.id] = asistencias;
        });
    }

    let addAsistencia = async (data) => {
        let result = await ajaxHelper(`${Constantes.apiUrl.asistencias}/`, "post", data);
        return result;
    }

    let deleteAsistencia = async () => {

    }

    //---------------------------------------------------- Tablas
    let creatTables = () => {
        let contentTable = document.querySelector("#contetn-tables");
        let tables;
        Constantes.bases.forEach(base => {
            let idTabla = `table-${base.id}`;
            let content = `
            <div class="col-4">
                <div class="card">
                    
                    <div class="card-body">
                        <div class="card-title">
                            <h4>${base.nombre}</h4>
                        </div>
                        <div class="table-responsive">
                            <table class="table w-100" id="${idTabla}">
                                <thead>
                                    <tr>
                                        <th>Unidad</th>
                                    </tr>
                                </thead>
                                <tbody>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
            `;

            contentTable.innerHTML += content;
            Constantes.tablas.push(base.id);
        });
    }

    let createTabla = (id, data) => {
        console.log(Constantes.asistencias.groups[id]);

        let table = $("#table-" + id).DataTable({
            data: transformarInformacionBases(Constantes.asistencias.groups[id]),
            columns: [
                { data: 'unidad'},
            ],
            createdRow: function (row, data, dataIndex) {
                $(row).attr('id', data.idx);
            },
        });

    }

    let cargarBotones = () => {

    }

    let recargarTabla = (tabla,data) => {
        tabla.clear().draw();
        tabla.rows.add().draw();

    }

    //--------------------------------------------------------------------------Formulario 
    Constantes.formulario.tag.onsubmit = async (e) => {
        e.preventDefault();
        let data = new FormData(Constantes.formulario.tag);
        let result = await addAsistencia(data);
        if (!result.ok) {
            notificacion("No se pudo insertar la asistencia","error");
            return false;
        }

        notificacion("Se insertó la asistencia", "success");
        Constantes.formulario.tag.reset();
        
    }


    //-------------------------------------------------------- cargar funciones
    await getBases();
    await getAsistencias();
    agruparAsistencias();


    await cargarSelect();

    creatTables();
    Constantes.tablas.forEach(tabla => {
        createTabla(tabla);
    });
   
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

class Asistecnia {
    constructor(id,unidad,base,idBase,idx) {
        this.id = id;
        this.unidad = unidad;
        this.base = base;
        this.idBase = idBase;
        this.idx = idx;
        
    }
}

let transformarInformacionBases = (data) => {
    let dataResult = [];
    data.forEach((d, idx) => dataResult.push(new Asistecnia(d.id, d.unidad,d.base.nombre,d.idBase,idx)));
    return dataResult;
}