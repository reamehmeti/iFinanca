using iFinanca.API.Data;
using iFinanca.API.Dtos;
using iFinanca.API.Models;
using iFinanca.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace iFinanca.API.Controllers
{
    [ApiController]
    [Route("api/admin/klientet")]
    [Authorize(Roles = Roles.Admin)]
    public class KlientetController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly UserManager<IdentityUser> _userManager;
        private readonly UserAccountService _accounts;

        public KlientetController(
            ApplicationDbContext context,
            UserManager<IdentityUser> userManager,
            UserAccountService accounts)
        {
            _context = context;
            _userManager = userManager;
            _accounts = accounts;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var klientet = await _context.Klientet
                .Include(k => k.User)
                .OrderBy(k => k.EmriIKompanise)
                .ToListAsync();

            return Ok(klientet.Select(ToResponse));
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> Get(int id)
        {
            var klienti = await _context.Klientet
                .Include(k => k.User)
                .FirstOrDefaultAsync(k => k.KlientiID == id);

            if (klienti == null)
            {
                return NotFound(new { message = "Client not found." });
            }

            return Ok(ToResponse(klienti));
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateKlientiRequest request)
        {
            await using var transaction = await _context.Database.BeginTransactionAsync();

            var user = new IdentityUser
            {
                UserName = request.Email.Trim(),
                Email = request.Email.Trim(),
                EmailConfirmed = true
            };

            var error = await _accounts.CreateAsync(user, request.Password, Roles.Client);

            if (error != null)
            {
                return error;
            }

            var klienti = new Klienti { UserId = user.Id };
            Apply(klienti, request);

            _context.Klientet.Add(klienti);
            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            return CreatedAtAction(nameof(Get), new { id = klienti.KlientiID }, new
            {
                message = "Client created successfully.",
                klientiID = klienti.KlientiID,
                userId = user.Id,
                email = user.Email
            });
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] KlientiRequest request)
        {
            var klienti = await _context.Klientet.FindAsync(id);

            if (klienti == null)
            {
                return NotFound(new { message = "Client not found." });
            }

            Apply(klienti, request);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Client updated successfully." });
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var klienti = await _context.Klientet
                .Include(k => k.User)
                .FirstOrDefaultAsync(k => k.KlientiID == id);

            if (klienti == null)
            {
                return NotFound(new { message = "Client not found." });
            }

            var blocked = await _accounts.CheckCanDeleteAsync(klienti.UserId);

            if (blocked != null)
            {
                return blocked;
            }

            if (klienti.User == null)
            {
                _context.Klientet.Remove(klienti);
                await _context.SaveChangesAsync();
                return NoContent();
            }

            var result = await _userManager.DeleteAsync(klienti.User);

            if (!result.Succeeded)
            {
                return BadRequest(new
                {
                    message = "Could not delete the client.",
                    errors = result.Errors.Select(e => e.Description)
                });
            }

            return NoContent();
        }

        private static KlientiResponse ToResponse(Klienti k)
        {
            return new KlientiResponse(
                k.KlientiID,
                k.UserId,
                k.User?.Email,
                k.EmriIKompanise,
                k.PersoniPergjegjes,
                k.Adresa,
                k.Qyteti,
                k.NumriTelefonit,
                k.NUI,
                k.DataEKrijimit);
        }

        private static void Apply(Klienti klienti, KlientiRequest request)
        {
            klienti.EmriIKompanise = request.EmriIKompanise.Trim();
            klienti.PersoniPergjegjes = request.PersoniPergjegjes.Trim();
            klienti.Adresa = request.Adresa.Trim();
            klienti.Qyteti = Clean(request.Qyteti);
            klienti.NumriTelefonit = Clean(request.NumriTelefonit);
            klienti.NUI = Clean(request.NUI);
        }

        private static string? Clean(string? value) =>
            string.IsNullOrWhiteSpace(value) ? null : value.Trim();
    }
}
