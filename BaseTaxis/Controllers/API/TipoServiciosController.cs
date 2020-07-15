using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BaseTaxis.Data;
using BaseTaxis.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BaseTaxis.Controllers.API
{
    [Route("api/[controller]")]
    [ApiController]
    public class TipoServiciosController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public TipoServiciosController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<TipoServicio>>> GetServicios()
        {
            return await _context.TipoServicios.Where(tp => tp.Activo)
                .ToListAsync();
        }
    }
}
