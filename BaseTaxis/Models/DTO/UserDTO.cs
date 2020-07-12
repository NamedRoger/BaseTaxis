using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BaseTaxis.Models.DTO
{
    public class UserDTO
    {
        public string Id { get; set; }
        public string Nombre { get; set; }
        public string Apellido { get; set; }
        public string UserName { get; set; }
        public Guid IdRol {get;set;}
        public string Rol { get; set; }
        public string Password { get; set; }
        public string Genero { get; set; }
        public string Direccion { get; set; }
        public string Telefono { get; set; }
        public bool Activo { get; set; }

        public ICollection<Servicio> Servicios { get; set; }
    }
}
