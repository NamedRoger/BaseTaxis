using BaseTaxis.Models;
using Microsoft.AspNetCore.SignalR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BaseTaxis.Hubs
{
    public class ClockHub : Hub<IClock>
    {
        public async Task SendTimeToClients(DateTime dateTime)
        {
            await Clients.All.ShowTime(dateTime);
        }


        public async Task SendReservados(List<ReservadosWorker> servicios)
        {
            await Clients.All.ServiciosReservados(servicios);
        }
    }
}
