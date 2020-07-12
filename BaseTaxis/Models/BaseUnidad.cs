using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BaseTaxis.Models
{
    public class BaseUnidad
    {
        public Guid Id { get; set; }
        public Guid IdBase { get; set; }
        public Base Base { get; set; }
        public string Unidad { get; set; }
        public bool Activo { get; set; } = true;
    }
}
