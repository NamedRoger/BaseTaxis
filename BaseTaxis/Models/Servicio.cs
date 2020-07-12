using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace BaseTaxis.Models
{
    public class Servicio
    {
        [Key]
        public Guid Id { get; set; }
        public Guid IdCliente { get; set; }
        public Cliente Cliente { get; set; }
        public string Direccion { get; set; }
        public Guid IdTipoServicio { get; set; }
        public TipoServicio TipoServicio { get; set; }
        public Guid IdEstatusServicio { get; set; }
        public EstatusServicio EstatusServicio { get; set; }
        public string Unidad { get; set; }
        public DateTime FechaHora { get; set; } = DateTime.Now;
        public Guid IdUsuario { get; set; }
        public User User { get; set; }
    }

}
