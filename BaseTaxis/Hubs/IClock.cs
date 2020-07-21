using BaseTaxis.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BaseTaxis.Hubs
{
    public interface IClock
    {
        Task ShowTime(DateTime dateTime);
        Task ServiciosReservados(List<ReservadosWorker> reservados);
    }
}
