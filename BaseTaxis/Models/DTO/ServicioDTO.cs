using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography.X509Certificates;
using System.Threading.Tasks;

namespace BaseTaxis.Models.DTO
{
    public class ServicioDTO
    {
        public string Id { get; set; }
        public string Unidad { get; set; }
        public string Direccion { get; set; }
        public string Telefono { get; set; }
        public string TipoServicio { get; set; }
        public string IdTipoServicio { get; set; }
        public string EstatusServicio { get; set; }
        public string IdEstatusServicio { get; set; }
        public string FechaHora { get; set; } = DateTime.Now.ToString();
        public string IdUsuario { get; set; }
    }
}
