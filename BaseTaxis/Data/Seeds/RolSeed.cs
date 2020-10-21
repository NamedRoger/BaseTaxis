using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BaseTaxis.Data.Seeds
{
    public class RolSeed
    {
        public static void Initializate(IServiceProvider serviceProvider, 
            RoleManager<IdentityRole<Guid>> roleManager)
        {
            using (var context = new ApplicationDbContext(
                serviceProvider.GetRequiredService<
                    DbContextOptions<ApplicationDbContext>>()))
            {
                if (context.Roles.Any())return;

                var adminRol = new IdentityRole<Guid>() { 
                    Name = "Admin"
                };

                roleManager.CreateAsync(adminRol).Wait();
                roleManager.CreateAsync(new IdentityRole<Guid> { Name = "Operador" }).Wait();

            }
        }
    }
}
