using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BaseTaxis.Models
{
    public class User : IdentityUser<Guid>
    {
        public string Nombre { get; set; }
        public string Apellido { get; set; }
        public string Genero { get; set; }
        public string Direccion { get; set; }
        public bool Activo { get; set; } = true;

        public ICollection<Servicio> Servicios { get; set; }
    }
}
