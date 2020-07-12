using BaseTaxis.Models;
using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BaseTaxis.Data.Seeds
{
    public static class SeedData
    {
        public static void Initialization(IServiceProvider serviceProvider,
            UserManager<User> userManager,
            RoleManager<IdentityRole<Guid>> roleManager)
        {
            RolSeed.Initializate(serviceProvider,roleManager);
            UserSeed.Initializate(serviceProvider, userManager);
            EstatusServicioSeed.Initializate(serviceProvider);
            TiposServicioSeed.Initializate(serviceProvider);
        }
    }
}
