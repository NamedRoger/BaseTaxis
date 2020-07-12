using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BaseTaxis.Data;
using BaseTaxis.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BaseTaxis.Controllers
{
    [Authorize(Policy = "Activo")]
    public class UsuariosController : Controller
    {
        private readonly ApplicationDbContext _context;

        public UsuariosController(ApplicationDbContext context)
        {
            _context = context;
        }

        public IActionResult Index()
        {
            return View();
        }

        
    }
}
