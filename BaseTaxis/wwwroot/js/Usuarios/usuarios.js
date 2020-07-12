class UsuarioTabla {
    constructor(id,nombre, apellido, activo,idx) {
        this.nombre = nombre;
        this.apellido = apellido;
        this.acciones = `
            <button class="btn btn-sm btn-${!activo ? "success" : "danger"} btn-Editar" data-id="${idx}" data-accion="${!activo ? "Activar" : "Desactivar"}">${!activo ? "Activar" : "Desactivar"}</button>
        `;
    }
}
$(async function () {
    // constantes para le modulo
    const Usuarios = {
        apiUrl: "api/usuarios",
        usuarios: [],
        tabla: "#tabla-usuarios",
        formulario: document.querySelector("#formulario-usuarios"),
        formularioInputs: ["Id","Nombre","Apellido","Genero","UserName","Direccion","Telefono"]
    }

    document.querySelector("#btn-reset").addEventListener("click", (e) => {
        e.preventDefault();
        Usuarios.formulario.reset();
    });

    // obtener los usuarios del sistema
    let getUsers = async () => {
        let result = await ajaxHelper(Usuarios.apiUrl);
        if (result.ok) {
            Usuarios.usuarios =  await result.json();
        } else {
            notificacion("Se ha producido un error al cargar los usuarios","error");
        }
    };
    // se manda a llamar la funcion
    await getUsers();

    //seleccionar a un usuario del arreglo principal
    let seleccionarUsuario = async (idx) => {
        let usuario = Usuarios.usuarios[idx];
        let formularioInputs = Usuarios.formulario.elements;

        Usuarios.formularioInputs.forEach(i => {
            for (const key in usuario) {
                if (key.toLowerCase() === i.toLowerCase()) {
                    formularioInputs[i].value = usuario[key];
                }
            }
        });

    }

    let cargarBotones = () => {
        let btnDescativar = document.querySelectorAll(".btn-Editar");
        btnDescativar.forEach(btn => { btn.addEventListener("click", () => { cambiarEstatusUsuario(btn.dataset.id, btn.dataset.accion) }) });

    }
    //Funciones para Tabla de usuarios
    // Cargar tabla
    let createTable = () => {
        let tabla = $(Usuarios.tabla).DataTable({
            data: transformarInformacion(Usuarios.usuarios),
            columns: [
                { data: 'nombre' },
                { data: 'apellido' },
                { data: 'acciones' }
            ],
            createdRow: function (row, data, dataIndex) {
                $(row).attr('id', dataIndex);
            },
        })

        cargarBotones();
        return tabla;
    };


    //seleccionar una fila de la tabla de los usuarios
    let SeleccionarFila = () => {
        let filas = [...document.querySelectorAll(`${Usuarios.tabla} tbody tr`)];
        filas.forEach(tr => {
            tr.addEventListener("click", () => {
                if (tr.classList.contains("selected")) {
                    tr.classList.remove("selected");
                } else {
                    table.$('tr.selected').removeClass('selected');
                    tr.classList.add("selected");
                }
                seleccionarUsuario(tr.id);
            });
        });
    }

    let recargarTabla = () => {
        table.clear().draw();
        table.rows.add(transformarInformacion(Usuarios.usuarios)).draw();

        SeleccionarFila();
    }


    //Funciones para el formulario de usuarios
    //Evento Submit
    Usuarios.formulario.onsubmit = async (e) => {
        e.preventDefault();
        let formulairo = Usuarios.formulario;
        let id = formulairo.elements["Id"].value;
        let formData = new FormData(formulairo);

        //Agregar o Editar usuario
        if (id.trim() == "") {
            let result = await agregarUsuario(formData);
            if (result.status) {
                Usuarios.usuarios.push(await result.json);
                recargarTabla();
                formulairo.reset();
                notificacion("Se ha insertado el usuario", "success");
            }
        } else {
            let result = await editarUsuario(id, formData);
            if (result) {
                await getUsers();
                recargarTabla();
                notificacion("Se ha actualizado el usuario", "success");
            }
            
        }
       
    }

    //Agregar usuario
    let agregarUsuario = async (usuario) => {
        let result = await ajaxHelper(Usuarios.apiUrl, "post", usuario);
        let response = {};
        if (!result.ok) {
            notificacion("No se pudo insertar el usuario", "error");
            response.status = false;
            return response;
        }
        response.status = true;
        response.json = result.json();
        return response;
    }

    // Editar usuario
    let editarUsuario = async (id, usuario) => {
        let result = await ajaxHelper(Usuarios.apiUrl + "/" + id, 'put', usuario);
        if (!result.ok) {
            notificacion("No se pudo editar el usuario", "error");
            return false;
        }
        return true;
    }

    let desactivarUsuario = async (idxUsuario) => {
        let usuario = Usuarios.usuarios[idxUsuario];
        let result = await ajaxHelper(`${Usuarios.apiUrl}/Desactivar/${usuario.id}`, "delete");
        if (result.ok) {
            Usuarios.usuarios[idxUsuario].activo = false;
            console.log(Usuarios.usuarios[idxUsuario]);
            recargarTabla();
            cargarBotones();

            notificacion("Se ha desactivado el usuario", "success");

        } else {
            notificacion("Hubo un error","error");
        }
    }

    let activarUsuario = async (idxUsuario) => {
        let usuario = Usuarios.usuarios[idxUsuario];

        let result = await ajaxHelper(`${Usuarios.apiUrl}/Activar/${usuario.id}`, "delete");

        if (result.ok) {
            Usuarios.usuarios[idxUsuario].activo = true;
            console.log(Usuarios.usuarios[idxUsuario]);
            recargarTabla();
            cargarBotones();
            notificacion("Se ha activado el usuario", "success");

        } else {
            notificacion("Hubo un error", "error");
        }
    }

    let cambiarEstatusUsuario = (idx,accion) => {

        if (accion.toLowerCase() === "desactivar") {
            desactivarUsuario(idx);
        } else {
            activarUsuario(idx);
        }
        //let resul = await ajaxHelper();
    }

    let table = createTable();
    SeleccionarFila();



});


// Funciones Globales
let ajaxHelper =  (url, method = "get", body = null) => {
    let configInit = {
        headers: {
            
        },
        method:method
    }

    if (body != null) configInit.body = body;

    let result =  fetch(url, configInit);

    return result;
}

let notificacion = (mensaje,type) => {
    notif({
        msg: mensaje,
        type: type
    });
    
}

let transformarInformacion = (data) => {
    let dataResult = [];
    data.forEach((d,idx) => dataResult.push(new UsuarioTabla(d.id, d.nombre, d.apellido, d.activo,idx)));
    return dataResult;
}