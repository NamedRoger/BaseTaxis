using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BaseTaxis.Controllers
{
    [Authorize(Policy = "Activo")]
    public class BasesController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }

        public IActionResult Asistencias()
        {
            return View();
        }
    }
}
