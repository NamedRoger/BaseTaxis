using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BaseTaxis.Data;
using BaseTaxis.Models;
using BaseTaxis.Models.DTO;
using Microsoft.AspNetCore.Identity;
using System.Security.Claims;

namespace BaseTaxis.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsuariosController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly UserManager<User> _userManager;

        public UsuariosController(ApplicationDbContext context, UserManager<User> userManager)
        {
            _context = context;
            _userManager = userManager;
        }

        // GET: api/Users
        [HttpGet]
        public async Task<ActionResult<IEnumerable<UserDTO>>> GetUsers()
        {
            return await _context.Users.Select(u => UserToDTO(u)).ToListAsync();
        }

        // GET: api/Users/5
        [HttpGet("{id}")]
        public async Task<ActionResult<UserDTO>> GetUser(Guid id)
        {
            var user = UserToDTO(await _context.Users.FindAsync(id));
            

            if (user == null)
            {
                return NotFound();
            }

            return user;
        }

        // PUT: api/Users/5
        // To protect from overposting attacks, enable the specific properties you want to bind to, for
        // more details, see https://go.microsoft.com/fwlink/?linkid=2123754.
        [HttpPut("{id}")]
        public async Task<IActionResult> PutUser(string id,[FromForm] UserDTO user)
        {
            if (id != user.Id)
            {
                return BadRequest();
            }

            var usuario = await _context.Users.FindAsync(Guid.Parse(id));

            usuario.Nombre = user.Nombre;
            usuario.UserName = user.UserName;
            usuario.Apellido = user.Apellido;
            usuario.Direccion = user.Direccion;
            usuario.Genero = user.Genero;
            usuario.PhoneNumber = user.Telefono;

            try
            {
                var resultUpdateUser = await _userManager.UpdateAsync(usuario);
                await _userManager.ChangePasswordAsync(usuario,usuario.PasswordHash,user.Password);
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!UserExists(Guid.Parse(id)))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // POST: api/Users
        // To protect from overposting attacks, enable the specific properties you want to bind to, for
        // more details, see https://go.microsoft.com/fwlink/?linkid=2123754.
        [HttpPost]
        public async Task<ActionResult<UserDTO>> PostUser([FromForm]UserDTO newUser)
        {
            var user = new User() { 
                Nombre = newUser.Nombre,
                Apellido = newUser.Apellido,
                Direccion = newUser.Direccion,
                Genero = newUser.Genero,
                PhoneNumber = newUser.Telefono,
                UserName = newUser.UserName
            };
            var result = await _userManager.CreateAsync(user,newUser.Password);

            if (!result.Succeeded) return BadRequest() ;

            if (result.Succeeded)
            {
                await _userManager.AddToRoleAsync(user,"Operador");
                await _userManager.AddClaimAsync(user,new Claim("Activo","Activo"));
            }
            
            return CreatedAtAction("GetUser", new { id = user.Id }, user);
        }

        // DELETE: api/Users/5
        [HttpDelete]
        [Route("Desactivar/{id}")]
        public async Task<ActionResult<User>> Desactivar(string id)
        {
            var user = await _context.Users.FindAsync(Guid.Parse(id));
            if (user == null)
            {
                return NotFound();
            }

            user.Activo = false;
            await _context.SaveChangesAsync();
            var result = await _userManager.RemoveClaimAsync(user,new Claim("Activo","Activo"));

            return user;
        }

        [HttpDelete]
        [Route("Activar/{id}")]
        public async Task<ActionResult<User>> Activar(string id)
        {
            var user = await _context.Users.FindAsync(Guid.Parse(id));
            if (user == null)
            {
                return NotFound();
            }

            user.Activo = true;
            await _context.SaveChangesAsync();
            var result = await _userManager.AddClaimAsync(user, new Claim("Activo", "Activo"));

            return user;
        }

        private bool UserExists(Guid id)
        {
            return _context.Users.Any(e => e.Id == id);
        }

        public static UserDTO UserToDTO(User user) => new UserDTO
        {
            Id = user.Id.ToString(),
            Nombre = user.Nombre,
            Apellido = user.Apellido,
            Direccion = user.Direccion,
            Genero = user.Genero,
            Password = user.PasswordHash,
            Telefono = user.PhoneNumber,
            UserName = user.UserName,
            Servicios = user.Servicios,
            Activo = user.Activo
        };
    }
}
