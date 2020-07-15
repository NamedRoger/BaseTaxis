using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BaseTaxis.Data;
using BaseTaxis.Models;
using BaseTaxis.Models.DTO;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BaseTaxis.Controllers.API
{
    [Route("api/[controller]")]
    [ApiController]
    public class AsistenciasController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public AsistenciasController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<AsistenciaDTO>>> Asistencias()
        {
            var hora = DateTime.Now.Hour - 1;
            var dia = DateTime.Now.Day;
            var mes = DateTime.Now.Month;
            var year = DateTime.Now.Year;
            var asistencias = await _context.Asistencias.Where(a => a.Fecha.Hour == hora)
                .Where(a => a.Fecha.Day == dia)
                .Where(a => a.Fecha.Month == mes)
                .Where(a => a.Fecha.Year == year)
                .Select(a => AsistenciaToDTO(a))
                .ToListAsync();

            return asistencias;
        }

        public async Task<ActionResult<AsistenciaDTO>> Asistencia(string id)
        {
            return AsistenciaToDTO(await _context.Asistencias.FindAsync(Guid.Parse(id)));
        }

        [HttpPost]
        public async Task<ActionResult<AsistenciaDTO>> AddAsistencia(string[] asistencias)
        {
            List<Asistencia> nuevasAsistencias = new List<Asistencia>();
            foreach (var asistencia in asistencias) nuevasAsistencias.Add(new Asistencia {Unidad = asistencia });

            await _context.Asistencias.AddRangeAsync(nuevasAsistencias);
            await _context.SaveChangesAsync();
            
            return CreatedAtAction("Asistencias",asistencias);
        }


        public static AsistenciaDTO AsistenciaToDTO(Asistencia asistencia) => new AsistenciaDTO
        {
            Unidad = asistencia.Unidad,
            FechaHora = asistencia.Fecha
        };

        
    }
}
