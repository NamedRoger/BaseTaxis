using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.UI;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.HttpsPolicy;
using Microsoft.EntityFrameworkCore;
using BaseTaxis.Data;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc.Authorization;
using BaseTaxis.Models;
using Microsoft.CodeAnalysis.Options;
using BaseTaxis.Hubs;
using Pomelo.EntityFrameworkCore.MySql.Infrastructure;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.HttpOverrides;

namespace BaseTaxis
{
    public class Startup
    {
        public Startup(IConfiguration configuration, IWebHostEnvironment environment)
        {
            Configuration = configuration;
            _env = environment;
        }

        public IConfiguration Configuration { get; }
        private IWebHostEnvironment _env;

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            if(_env.IsProduction())
            {
                Console.WriteLine(_env.EnvironmentName);
                services.AddDbContext<ApplicationDbContext>(builder => {
                    builder.UseMySql(Configuration.GetConnectionString("BaseTaxis"),
                    mySqlOptions => mySqlOptions.ServerVersion(new Version(5,7,31),ServerType.MariaDb));
                });
            }
            else
            {
                services.AddDbContext<ApplicationDbContext>(op => 
                    op.UseMySql(Configuration.GetConnectionString("BaseTaxis"),
                    mySqlOptions => mySqlOptions.ServerVersion(new Version(5,7,31),ServerType.MySql)
                    ).UseLoggerFactory(
                        LoggerFactory.Create(
                            logging => logging
                                .AddConsole()
                                .AddFilter(level => level >= LogLevel.Information)))
                    .EnableSensitiveDataLogging()
                    .EnableDetailedErrors());
            }
            // services.AddDbContext<ApplicationDbContext>(op => 
            //         op.UseMySql(Configuration.GetConnectionString("BaseTaxis"),
            //         mySqlOptions => mySqlOptions.ServerVersion(new Version(5,7,31),ServerType.MySql)
            //         ).UseLoggerFactory(
            //             LoggerFactory.Create(
            //                 logging => logging
            //                     .AddConsole()
            //                     .AddFilter(level => level >= LogLevel.Information)))
            //         .EnableSensitiveDataLogging()
            //         .EnableDetailedErrors());

            

            services.AddDefaultIdentity<User>(options => {
                options.Password.RequireDigit = false;
                options.Password.RequiredLength = 4;
                options.Password.RequireLowercase = false;
                options.Password.RequireNonAlphanumeric = false;
                options.Password.RequireUppercase = false;

                options.User.RequireUniqueEmail = false;
               
                options.SignIn.RequireConfirmedAccount = false;
                

            })
                .AddRoles<IdentityRole<Guid>>()
                .AddEntityFrameworkStores<ApplicationDbContext>();

            services.AddControllersWithViews(config => {

                //a�ande la poiliica para la autorizacion 
                var policy = new AuthorizationPolicyBuilder()
                .RequireAuthenticatedUser()
                .Build();

                config.Filters.Add(new AuthorizeFilter(policy));

            })
                .AddNewtonsoftJson(op => {
                    op.SerializerSettings.ReferenceLoopHandling = Newtonsoft.Json.ReferenceLoopHandling.Ignore;
                });

            services.Configure<ForwardedHeadersOptions>(op => {
                op.AllowedHosts.Add("*");
                op.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
            });
            
            services.AddRazorPages();

            services.AddSignalR();
            services.AddHostedService<Worker>();

            services.AddAuthorization(op => {
                op.AddPolicy("Activo",policy => policy.RequireClaim("Activo"));
            });
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            app.UseForwardedHeaders();


            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
                app.UseDatabaseErrorPage();
            }
            else
            {
                app.UseExceptionHandler("/Home/Error");
                // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
                app.UseHsts();
            }
            // app.UseHttpsRedirection();
            app.UseStaticFiles();

            app.UseRouting();

            

            app.UseAuthentication();
            app.UseAuthorization();

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllerRoute(
                    name: "default",
                    pattern: "{controller=Home}/{action=Index}/{id?}");
                endpoints.MapRazorPages();
                endpoints.MapHub<ClockHub>("/hubs/clock");
            });
        }
    }
}
