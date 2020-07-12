using System;
using System.Collections.Generic;
using System.Text;
using BaseTaxis.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace BaseTaxis.Data
{
    public class ApplicationDbContext : IdentityDbContext<User,IdentityRole<Guid>,Guid>
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<Servicio> Servicios { get; set; }
        public DbSet<Base> Bases { get; set; }
        public DbSet<Cliente> Clientes { get; set; }
        public DbSet<EstatusServicio> EstatusServicios { get; set; }
        public DbSet<BaseUnidad> BaseUnidades { get; set; }
        public DbSet<Asistencia> Asistencias { get; set; }
        public DbSet<TipoServicio> TipoServicios { get; set; }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            builder.Entity<Servicio>(entity => {
                entity.HasKey(s => s.Id);

                entity.HasOne(s => s.TipoServicio)
                    .WithMany()
                    .HasForeignKey(s => s.IdTipoServicio);

                entity.HasOne(s => s.EstatusServicio)
                    .WithMany()
                    .HasForeignKey(s => s.IdEstatusServicio);

                entity.HasOne(s => s.Cliente)
                    .WithMany(c => c.Servicios)
                    .HasForeignKey(s => s.IdCliente);

                entity.HasOne(s => s.User)
                    .WithMany(u => u.Servicios)
                    .HasForeignKey(s => s.IdUsuario);
            });

            builder.Entity<Asistencia>(entity => {
                entity.HasKey(a => a.Id);
            });

            builder.Entity<BaseUnidad>(entity => {
                entity.HasKey(bu => bu.Id);

                entity.HasOne(bu => bu.Base)
                    .WithMany(b => b.BaseUnidades)
                    .HasForeignKey(bu => bu.IdBase);
            });


        }
    }
}
