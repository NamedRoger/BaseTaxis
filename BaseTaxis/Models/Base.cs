using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace BaseTaxis.Models
{
    public class Base
    {
        [Key]
        public Guid Id { get; set; }
        public string Nombre { get; set; }
        public bool Actvio { get; set; }

        public ICollection<BaseUnidad> BaseUnidades { get; set; }
        
    }
}
