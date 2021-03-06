﻿using System;
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
                .Where(s => s.EstatusServicio.Nombre != "Cancelado")
                .Include(s => s.Cliente)
                .Include(s => s.TipoServicio)
                .Include(s => s.User)
                .Include(s => s.EstatusServicio)
                .Select(s => ServicioToDTO(s))
                .ToListAsync();
        }

        // GET: api/Servicios/5
        [HttpGet("{id}")]
        public async Task<ActionResult<ServicioDTO>> GetServicio(Guid id)
        {
            var servicio = ServicioToDTO(await _context.Servicios.Include(s => s.Cliente)
                .Include(s => s.TipoServicio)
                .Include(s => s.User)
                .Include(s => s.EstatusServicio)
                .FirstOrDefaultAsync (s => s.Id == id));

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
        public async Task<IActionResult> PutServicio(Guid id, [FromForm] ServicioDTO servicioDto)
        {
            if (id != Guid.Parse(servicioDto.Id))
            {
                return BadRequest();
            }

            var servicio = await _context.Servicios.FindAsync(id);

            
            servicio.Direccion = servicioDto.Direccion;
            servicio.FechaHora = DateTime.Parse(servicioDto.FechaHora);
            servicio.Unidad = servicioDto.Unidad;
            servicio.IdTipoServicio = Guid.Parse(servicioDto.IdTipoServicio);
            servicio.IdEstatusServicio = Guid.Parse(servicioDto.IdEstatusServicio);

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

            var nuevoServicio = new Servicio()
            {
                IdCliente = cliente.Id,
                FechaHora = servicio.FechaHora == null ? DateTime.Now : DateTime.Parse(servicio.FechaHora),
                IdTipoServicio = Guid.Parse(servicio.IdTipoServicio),
                IdEstatusServicio = estatusServicio.Id,
                Direccion = servicio.Direccion,
                Unidad = servicio.Unidad,
                IdUsuario = Guid.Parse(User.Identity.GetUserId())
            };

            try
            {
                _context.Servicios.Add(nuevoServicio);
                await _context.SaveChangesAsync();  

            }
            catch (Exception e)
            {
                return BadRequest(e.Message);
            }

            return CreatedAtAction("GetServicio", new { id = nuevoServicio.Id }, ServicioToDTO(nuevoServicio));
        }

        [HttpPut]
        [Route("Asignar/{id}")]
        public async Task<IActionResult> AsignarServicio(Guid id,[FromBody] ReservadosWorker reservado)
        {
            var servicio = await _context.Servicios.FindAsync(id);

            var estatusServicio = await _context.EstatusServicios.FirstOrDefaultAsync(e => e.Nombre == "Asignado");

            servicio.Unidad = reservado.Unidad;
            servicio.IdEstatusServicio = estatusServicio.Id;

            await _context.SaveChangesAsync();

            return Ok();
        }

        // DELETE: api/Servicios/5
        [HttpDelete("{id}")]
        public async Task<ActionResult<ServicioDTO>> CancelarServicio(Guid id)
        {
            var servicio = await _context.Servicios.Include(s => s.Cliente)
                .Include(s => s.EstatusServicio)
                .Include(s => s.TipoServicio)
                .Include(s => s.User)
                .FirstOrDefaultAsync(s => s.Id == id);

            if (servicio == null)
            {
                return NotFound();
            }

            var estatusServicio = await _context.EstatusServicios.FirstOrDefaultAsync(es => 
            es.Nombre.ToUpper() == "Cancelado".ToUpper());

            servicio.IdEstatusServicio = estatusServicio.Id;

            await _context.SaveChangesAsync(); //5256781617941492

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
            Usuario = servicio.User == null ?"":servicio.User.UserName,
            Telefono = servicio.Cliente.Telefono,
            TipoServicio = servicio.TipoServicio.Nombre,
            Unidad = servicio.Unidad
        };
    }

    
}
