using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace BaseTaxis.Models
{
    public class Cliente
    {
        [Key]
        public Guid Id { get; set; }
        public string Telefono { get; set; }
        public string Direccion { get; set; }
        public bool Activo { get; set; } 

        public ICollection<Servicio> Servicios { get; set; }
    }
}
