﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BaseTaxis.Data;
using BaseTaxis.Models;

namespace BaseTaxis.Controllers.API
{
    [Route("api/[controller]")]
    [ApiController]
    public class BasesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public BasesController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/Bases
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Base>>> GetBases()
        {
            return await _context.Bases.ToListAsync();
        }

        // GET: api/Bases/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Base>> GetBase(Guid id)
        {
            var @base = await _context.Bases.FindAsync(id);

            if (@base == null)
            {
                return NotFound();
            }

            return @base;
        }

        // PUT: api/Bases/5
        // To protect from overposting attacks, enable the specific properties you want to bind to, for
        // more details, see https://go.microsoft.com/fwlink/?linkid=2123754.
        [HttpPut("{id}")]
        public async Task<IActionResult> PutBase(Guid id, Base @base)
        {
            if (id != @base.Id)
            {
                return BadRequest();
            }

            _context.Entry(@base).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!BaseExists(id))
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

        // POST: api/Bases
        // To protect from overposting attacks, enable the specific properties you want to bind to, for
        // more details, see https://go.microsoft.com/fwlink/?linkid=2123754.
        [HttpPost]
        public async Task<ActionResult<Base>> PostBase(Base @base)
        {
            _context.Bases.Add(@base);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetBase", new { id = @base.Id }, @base);
        }

        // DELETE: api/Bases/5
        [HttpDelete("{id}")]
        public async Task<ActionResult<Base>> DeleteBase(Guid id)
        {
            var @base = await _context.Bases.FindAsync(id);
            if (@base == null)
            {
                return NotFound();
            }

            _context.Bases.Remove(@base);
            await _context.SaveChangesAsync();

            return @base;
        }

        private bool BaseExists(Guid id)
        {
            return _context.Bases.Any(e => e.Id == id);
        }
    }
}
