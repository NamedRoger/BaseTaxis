using BaseTaxis.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Security.Policy;
using System.Threading.Tasks;

namespace BaseTaxis.Data.Seeds
{
    public static class UserSeed
    {
        public static void Initializate(IServiceProvider serviceProvider, UserManager<User> userManager)
        {
            using (var context = new ApplicationDbContext(
                serviceProvider.GetRequiredService<
                    DbContextOptions<ApplicationDbContext>>()))
            {
                if (context.Users.Any()) return;

                var usuario = new User() { 
                    UserName = "admin",
                    Email = "admin@admin.com"
                };

                IdentityResult result = userManager.CreateAsync(usuario,"admin").Result;
                var claimResult = userManager.AddClaimAsync(usuario, new Claim("Activo", "Activo"));


                if (result.Succeeded && claimResult.Result.Succeeded)
                {
                    userManager.AddToRoleAsync(usuario,"Admin").Wait();
                }

            }
        }
    }
}
