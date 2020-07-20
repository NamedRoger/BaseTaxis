$(async function () {
    const Bases = {
        apiUrl: "api/Bases",
        bases:[],
        formulario: {
            tag: document.querySelector("#form-bases"),
        },
        tabla: {
            tag: "#tabla-bases",
            data: []
        }
    }

    let getBases = async () => {
        let result = await ajaxHelper(Bases.apiUrl);
        if (!result.ok) {
            notificacion("Ocurrió un error al cargar las bases","error");
            return false;
        }

        Bases.bases = await result.json();
    }

    await getBases();

    let findIndexBaseById = (id) => {
        return Bases.bases.findIndex(b => b.id == id);
    }

    let addBase = async () => {
        let data = new FormData(Bases.formulario.tag);
        let result = await ajaxHelper(Bases.apiUrl, "post", data);
        return result;
    }

    let editBase = async (id) => {
        let data = new FormData(Bases.formulario.tag);
        let result = await ajaxHelper(`${Bases.apiUrl}/${id}`, "put", data);
        return result;
    }

    let deleteBase = async (id) => {
        let result = await ajaxHelper(`${Bases.apiUrl}/${id}`, 'delete');
        return result;
    }

    let createTable = () => {
        let table = $(Bases.tabla.tag).DataTable({
            data: transformarInformacionBases(Bases.bases),
            columns: [
                { data: 'base' },
                { data: 'acciones' }
            ],
            createdRow: function (row, data, dataIndex) {
                $(row).attr('id', data.idx);
            },
        });

        return table;
    }

    let tabla = createTable();

    let cargarBotones = () => {
        let btnDelete = document.querySelectorAll(".btn-delete");
        btnDelete.forEach(btn => {
            btn.onclick = async (e) => {
                let id = Bases.bases[btn.dataset.id].id;
                let result = await deleteBase(id);
                if (!result.ok) {
                    notificacion("No se pudo eliminar la base","error");
                    return false;
                }

                Bases.bases.splice(btn.dataset.id,1);
                notificacion("Se ha eliminado la base", "success");
                recargarTabla();
                cargarBotones();
                chooseBase();

                e.stopPropagation();
            }
        });
    }
    cargarBotones();

    let chooseBase = () => {
        let rows = [...document.querySelectorAll(`${Bases.tabla.tag} tr`)];
        rows.forEach(row => {
            let base = Bases.bases[row.id];
            row.onclick = () => {
                let formulairo = Bases.formulario.tag.elements;
                let id, inputBase;
                id = formulairo["Id"];
                inputBase = formulairo["Nombre"];

                id.value = base.id;
                inputBase.value = base.nombre;

            }
        });
    }
    chooseBase();

    let recargarTabla = () => {
        tabla.clear().draw();
        tabla.rows.add(transformarInformacionBases(Bases.bases)).draw();
    }


    Bases.formulario.tag.onsubmit = async (e) => {
        e.preventDefault();

        let formulario = Bases.formulario.tag;
        let id = formulario.elements["Id"].value;

        let result;

        if (id.trim() === "") {
            result = await addBase();
            if (!result.ok) {
                notificacion("No se pudo insertar","error");
                return false;
            }

            Bases.bases.push(await result.json());
            formulario.reset();
            notificacion("Se ha insertado una nueva Base","success");
            recargarTabla();
            chooseBase();
            cargarBotones();
        } else {
            result = await editBase(id);
            if (!result.ok) {
                notificacion("No se pudo editar la Base","error");
                return false;
            }

            Bases.bases[findIndexBaseById(id)].nombre = formulario.elements["Nombre"].value;

            notificacion("Se ha actualizado la Base", "success");
            recargarTabla();
            chooseBase();
            cargarBotones();

        }
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

class Base {
    constructor(id,base,idx) {
        this.id = id;
        this.base = base;
        this.idx = idx;
        this.acciones = `
            <button class="btn btn-sm btn-danger btn-delete" data-id="${idx}">
                Eliminar
            </button>
        `;
    }
}

let transformarInformacionBases = (data) => {
    let dataResult = [];
    data.forEach((d, idx) => dataResult.push(new Base(d.id, d.nombre, idx)));
    return dataResult;
}