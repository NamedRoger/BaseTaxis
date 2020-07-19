$(function () {
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

    }

    let addBase = async () => {

    }

    let editBase = async () => {

    }

    let deleteBase = async () => {

    }

    let createTable = () => {

    }

    let cargarBotones = () => {

    }

    let recargarTabla = () => {

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