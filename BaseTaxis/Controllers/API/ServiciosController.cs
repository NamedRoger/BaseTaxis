using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BaseTaxis.Data;
using BaseTaxis.Models;
using BaseTaxis.Models.DTO;
using Microsoft.AspNet.Identity;

namespace BaseTaxis.Controllers.API
{
    [Route("api/[controller]")]
    [ApiController]
    public class ServiciosController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
       
        public ServiciosController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/Servicios
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ServicioDTO>>> GetServicios()
        {
            return await _context.Servicios.Where(s => s.EstatusServicio.Nombre != "Cancelado")
                .Include(s => s.Cliente)
                .Include(s => s.TipoServicio)
                .Include(s => s.EstatusServicio)
                .Select(s => ServicioToDTO(s))
                .ToListAsync();
        }

        // GET: api/Servicios/5
        [HttpGet("{id}")]
        public async Task<ActionResult<ServicioDTO>> GetServicio(Guid id)
        {
            var servicio = ServicioToDTO(await _context.Servicios.FindAsync(id));

            if (servicio == null)
            {
                return NotFound();
            }

            return servicio;
        }

        // PUT: api/Servicios/5
        // To protect from overposting attacks, enable the specific properties you want to bind to, for
        // more details, see https://go.microsoft.com/fwlink/?linkid=2123754.
        [HttpPut("{id}")]
        public async Task<IActionResult> PutServicio(Guid id, Servicio servicio)
        {
            if (id != servicio.Id)
            {
                return BadRequest();
            }

            _context.Entry(servicio).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ServicioExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // POST: api/Servicios
        // To protect from overposting attacks, enable the specific properties you want to bind to, for
        // more details, see https://go.microsoft.com/fwlink/?linkid=2123754.
        [HttpPost]
        public async Task<ActionResult<ServicioDTO>> PostServicio([FromForm] ServicioDTO servicio)
        {
            var resultCliente = await _context.Clientes.FirstOrDefaultAsync(c => c.Telefono == servicio.Telefono);
            Cliente cliente;

            if (resultCliente != null)
            {
                cliente = resultCliente;
            }
            else
            {
                cliente = new Cliente() { 
                    Direccion = servicio.Direccion,
                    Telefono = servicio.Telefono
                };

                await _context.Clientes.AddAsync(cliente);
            }

            var tipoServicio = await _context.TipoServicios.FindAsync(Guid.Parse(servicio.IdTipoServicio));
            EstatusServicio estatusServicio;
            if (tipoServicio.Nombre.ToUpper() == "Normal".ToUpper())
            {
                estatusServicio = await _context.EstatusServicios.FirstOrDefaultAsync(e =>
                e.Nombre.ToUpper() == "Asignado".ToUpper());
            }
            else
            {
                estatusServicio = await _context.EstatusServicios.FirstOrDefaultAsync(e =>
                e.Nombre.ToUpper() == "En Espera".ToUpper());
            }

            try
            {
                var nuevoServicio = new Servicio()
                {
                    IdCliente = cliente.Id,
                    FechaHora = servicio.FechaHora == null ?DateTime.Now: DateTime.Parse(servicio.FechaHora),
                    IdTipoServicio = Guid.Parse(servicio.IdTipoServicio),
                    IdEstatusServicio = estatusServicio.Id,
                    Direccion = servicio.Direccion,
                    Unidad = servicio.Unidad,
                    IdUsuario = Guid.Parse(User.Identity.GetUserId())
                };

                _context.Servicios.Add(nuevoServicio);
                await _context.SaveChangesAsync();

                return CreatedAtAction("GetServicio", new { id = servicio.Id }, servicio);
            }
            catch (Exception e)
            {
                return BadRequest(e.Message);
            }
            
        }

        // DELETE: api/Servicios/5
        [HttpDelete("{id}")]
        public async Task<ActionResult<ServicioDTO>> DeleteServicio(Guid id)
        {
            var servicio = await _context.Servicios.FindAsync(id);
            if (servicio == null)
            {
                return NotFound();
            }

            _context.Servicios.Remove(servicio);
            await _context.SaveChangesAsync();

            return ServicioToDTO(servicio);
        }

        private bool ServicioExists(Guid id)
        {
            return _context.Servicios.Any(e => e.Id == id);
        }

        public static ServicioDTO ServicioToDTO(Servicio servicio) => new ServicioDTO
        {
            Direccion = servicio.Direccion,
            EstatusServicio = servicio.EstatusServicio.Nombre,
            FechaHora = servicio.FechaHora.ToString(),
            Id = servicio.Id.ToString(),
            IdEstatusServicio = servicio.IdEstatusServicio.ToString(),
            IdTipoServicio = servicio.IdTipoServicio.ToString(),
            IdUsuario = servicio.IdUsuario.ToString(),
            Telefono = servicio.Cliente.Telefono,
            TipoServicio = servicio.TipoServicio.Nombre,
            Unidad = servicio.Unidad
        };
    }

    
}
