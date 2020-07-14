using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BaseTaxis.Models.DTO
{
    public class AsistenciaDTO
    {
        public string Unidad { get; set; }
        public DateTime FechaHora { get; set; } = DateTime.Now;
    }
}
