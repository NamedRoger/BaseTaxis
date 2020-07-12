using BaseTaxis.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BaseTaxis.Data.Seeds
{
    public static class EstatusServicioSeed
    {
        public static void Initializate(IServiceProvider serviceProvider)
        {
            using (var context = new ApplicationDbContext(
                serviceProvider.GetRequiredService<
                    DbContextOptions<ApplicationDbContext>>()))
            {
                if (context.EstatusServicios.Any())return;

                var estatusServicios = new List<EstatusServicio>(){
                    new EstatusServicio
                    {
                        Nombre = "Asignado",
                        Descripcion = "Se ha hasignado a una unidad",
                        Color = "#5FB404"
                    },
                    new EstatusServicio
                    {
                        Nombre = "En Espera",
                        Descripcion = "El servicio esta en reserva",
                        Color = "#FF8000"
                    },
                    new EstatusServicio
                    {
                        Nombre = "Cancelado",
                        Descripcion = "Se ha cancelado el servicio",
                        Color = "#FF0000"
                    }
                };

                context.AddRange(estatusServicios);
                context.SaveChanges();
            }
        }
    }
}
