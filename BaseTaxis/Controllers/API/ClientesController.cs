using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BaseTaxis.Data;
using BaseTaxis.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BaseTaxis.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ClientesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ClientesController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Cliente>>> GetClientes()
        {
            return await _context.Clientes.ToListAsync();
        }

        [HttpGet("{telefono}")]
        public async Task<ActionResult<Cliente>> ClienteByTelefono(string telefono)
        {
            if (String.IsNullOrEmpty(telefono)) return BadRequest();

            var cliente =  await _context.Clientes.FirstOrDefaultAsync(c => c.Telefono == telefono);

            if (cliente == null) return NotFound();

            return cliente;
        }
    }
}
