using BaseTaxis.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BaseTaxis.Data.Seeds
{
    public class TiposServicioSeed
    {
        public static void Initializate(IServiceProvider serviceProvider)
        {
            using (var context =new ApplicationDbContext(
                serviceProvider.GetRequiredService<
                    DbContextOptions<ApplicationDbContext>>()))
            {
                if (context.TipoServicios.Any())return;

                var tipoServicio = new List<TipoServicio>() { 
                    new TipoServicio
                    {
                        Nombre = "Normal"
                    },
                    new TipoServicio
                    {
                        Nombre = "Reservado"
                    }

                };

                context.TipoServicios.AddRange(tipoServicio);
                context.SaveChanges();

            }
        }
    }
}
