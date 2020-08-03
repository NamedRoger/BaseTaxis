"use strict";
(() => {
  let audio = document.querySelector("#audio-alerta");
  document.addEventListener("DOMContentLoaded", () => {
    const connection = new signalR.HubConnectionBuilder()
      .withUrl("/hubs/clock")
      .build();

    let start = async () => {
      try {
        await connection.start();
      } catch (err) {
        console.log(err);
        setTimeout(() => start(), 5000);
      }
    };

    var onConnection = connection.on("ServiciosReservados", function (res) {
      let notifys = localStorage.getItem("notify");
      let notitysArr,
        countNotify = 0;
      countNotify = res.length;
      if (notifys != null && notifys != undefined) {
        notitysArr = JSON.parse(notifys);

        if (notitysArr.length == 0) {
          localStorage.setItem("notify", JSON.stringify(res));
          if (res.length > 0) {
            alertaNotify();
          }
        } else {
          res.forEach((s) => {
            let r = notitysArr.find((not) => not.id == s.id);
            if (r == undefined) {
              notitysArr.push(s);
              alertaNotify();
            }
          });
          localStorage.setItem("notify", JSON.stringify(notitysArr));
        }
      } else {
        localStorage.setItem("notify", JSON.stringify(res));
        if (res.length > 0) {
          alertaNotify();
        }
      }
      console.log(JSON.parse(notifys).length, countNotify);
      if (
        countNotify > JSON.parse(notifys).length ||
        countNotify < JSON.parse(notifys).length
      ) {
        shownotifys();
      } else {
        shownotifys();
      }
    });

    //connection.onclose(async () => {
    //    await start();
    //});

    start();

    function shownotifys() {
      let notifysDiv = document.querySelector("#notifys");
      let notifys = JSON.parse(localStorage.getItem("notify"));
      if (notifys.length == 0) {
        notifysDiv.innerHTML = "";
        return;
      }
      notifysDiv.innerHTML = "";
      notifys.forEach((not) => {
        notifysDiv.appendChild(createNotify(not));
      });
      mostrarAlerta();
    }

    function createNotify(not) {
      let notify = document.createElement("a");
      let titleNotify = document.createElement("div");
      let contentNotify = document.createElement("div");
      let telNotity = document.createElement("h5");
      let dicNotify = document.createElement("div");
      let btnNotify = document.createElement("div");

      notify.id = not.id;

      notify.classList.add("d-flex", "p-3", "border-bottom");
      titleNotify.classList.add("notifyimg", "bg-pink");
      contentNotify.classList.add("ml-3");
      telNotity.classList.add("notification-label", "mb-1");
      dicNotify.classList.add("notification-subtext");

      telNotity.innerHTML = not.telefono;
      dicNotify.innerHTML = not.direccion;

      contentNotify.appendChild(telNotity);
      contentNotify.appendChild(dicNotify);

      titleNotify.innerHTML = `
                    <div class="notifyimg bg-pink">
                        <i class="la la-file-alt text-white"></i>
                    </div>`;

      notify.appendChild(titleNotify);
      notify.appendChild(contentNotify);

      notify.onclick = () => {
        mostrarModal(not);
      };

      return notify;
    }

    function removeNotify(id) {
      let notifys = JSON.parse(localStorage.getItem("notify"));
      let index = notifys.findIndex((n) => n.id == id);

      if (index > -1) {
        notifys.splice(index, 1);
        localStorage.setItem("notify", JSON.stringify(notifys));
      }
    }

    function alertaNotify(mostrar = true) {
      if (mostrar) {
        audio.play();
        mostrarAlerta();
      } else {
        ocultarAlerta();
      }
    }

    function mostrarAlerta() {
      let alertDanger = document.querySelector("#alert-danger-not");
      if (alertDanger.classList.contains("d-none")) {
        alertDanger.classList.remove("d-none");
      }
    }

    function ocultarAlerta() {
      let alertDanger = document.querySelector("#alert-danger-not");
      if (!alertDanger.classList.contains("d-none")) {
        alertDanger.classList.add("d-none");
      }
    }

    async function mostrarModal(not) {
      let unidad = prompt("Introduce la unidad", not.unidad);
      let result = await ajaxHelper(
        `api/Servicios/Asignar/${not.id}`,
        "put",
        JSON.stringify(not)
      );
      if (!result.ok) {
        notificacion("No se pudo asiganar el servicio", "error");
        mostrarModal(not);
        return;
      }

      notificacion("Se ha asigando el servicio", "success");
      removeNotify(not.id);
      shownotifys();
    }

    let ajaxHelper = (url, method = "get", body = null) => {
      let configInit = {
        headers: {
          "Content-Type": "application/json",
        },
        method: method,
      };

      if (body != null) configInit.body = body;

      let result = fetch(url, configInit);

      return result;
    };
  });
})();
