using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BaseTaxis.Models
{
    public class Asistencia
    {
        public Guid Id { get; set; }
        public string Unidad { get; set; }
        public DateTime Fecha { get; set; } = DateTime.Now;

    }
}
