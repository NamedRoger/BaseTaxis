﻿using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace BaseTaxis.Models
{
    public class TipoServicio
    {
        [Key]
        public Guid Id { get; set; }
        public string Nombre { get; set; }
        public bool Activo { get; set; } = true;
    }
}
