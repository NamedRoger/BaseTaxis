using BaseTaxis.Data;
using BaseTaxis.Hubs;
using BaseTaxis.Models;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace BaseTaxis
{
    public class Worker : BackgroundService
    {
        private readonly ILogger<Worker> _logger;
        private readonly IHubContext<ClockHub, IClock> _clockHub;
        private readonly IServiceScopeFactory _serviceScopeFactory;

        public Worker(ILogger<Worker> logger, IHubContext<ClockHub, IClock> clockHub, IServiceScopeFactory serviceScopeFactory)
        {
            _logger = logger;
            _clockHub = clockHub;
            _serviceScopeFactory = serviceScopeFactory;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                using (var scope = _serviceScopeFactory.CreateScope())
                {
                    var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

                    var year = DateTime.Now.Year;
                    var month = DateTime.Now.Month;
                    var day = DateTime.Now.Day;
                    var hour = DateTime.Now.Hour;
                    var time = DateTime.Now.Minute;

                    var reservados = await context.Servicios.Where(s =>
                        s.TipoServicio.Nombre.ToUpper() == "Reservado".ToUpper())
                        .Where(s => s.EstatusServicio.Nombre.ToUpper() == "En Espera")
                        .Where(s => s.FechaHora.Year == year)
                        .Where(s => s.FechaHora.Month == month)
                        .Where(s => s.FechaHora.Day == day)
                        .Where(s => s.FechaHora.Hour - 1 == hour)
                        .Include(s => s.Cliente)
                        .Select(s => new ReservadosWorker
                        {
                            Id = s.Id.ToString(),
                            Telefono = s.Cliente.Telefono,
                            Direccion = s.Direccion,
                            Unidad = s.Unidad
                        })
                        .ToListAsync();

                    // _logger.LogInformation("Worker running at: {Time}", DateTime.Now);
                    await _clockHub.Clients.All.ServiciosReservados(reservados);
                    await Task.Delay(1000);
                }

            }
        }
    }
}
