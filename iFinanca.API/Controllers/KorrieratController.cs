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
    [Route("api/admin/korrierat")]
    [Authorize(Roles = Roles.Admin)]
    public class KorrieratController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly UserManager<IdentityUser> _userManager;
        private readonly UserAccountService _accounts;

        public KorrieratController(
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
            var korrierat = await _context.Korrierat
                .Include(k => k.User)
                .OrderBy(k => k.Emri)
                .ThenBy(k => k.Mbiemri)
                .ToListAsync();

            return Ok(korrierat.Select(ToResponse));
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> Get(int id)
        {
            var korrieri = await _context.Korrierat
                .Include(k => k.User)
                .FirstOrDefaultAsync(k => k.KorrieriID == id);

            if (korrieri == null)
            {
                return NotFound(new { message = "Courier not found." });
            }

            return Ok(ToResponse(korrieri));
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateKorrieriRequest request)
        {
            await using var transaction = await _context.Database.BeginTransactionAsync();

            var user = new IdentityUser
            {
                UserName = request.Email.Trim(),
                Email = request.Email.Trim(),
                EmailConfirmed = true
            };

            var error = await _accounts.CreateAsync(user, request.Password, Roles.Courier);

            if (error != null)
            {
                return error;
            }

            var korrieri = new Korrieri { UserId = user.Id };
            Apply(korrieri, request);

            _context.Korrierat.Add(korrieri);
            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            return CreatedAtAction(nameof(Get), new { id = korrieri.KorrieriID }, new
            {
                message = "Courier created successfully.",
                korrieriID = korrieri.KorrieriID,
                userId = user.Id,
                email = user.Email
            });
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] KorrieriRequest request)
        {
            var korrieri = await _context.Korrierat.FindAsync(id);

            if (korrieri == null)
            {
                return NotFound(new { message = "Courier not found." });
            }

            Apply(korrieri, request);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Courier updated successfully." });
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var korrieri = await _context.Korrierat
                .Include(k => k.User)
                .FirstOrDefaultAsync(k => k.KorrieriID == id);

            if (korrieri == null)
            {
                return NotFound(new { message = "Courier not found." });
            }

            var blocked = await _accounts.CheckCanDeleteAsync(korrieri.UserId);

            if (blocked != null)
            {
                return blocked;
            }

            if (korrieri.User == null)
            {
                _context.Korrierat.Remove(korrieri);
                await _context.SaveChangesAsync();
                return NoContent();
            }

            var result = await _userManager.DeleteAsync(korrieri.User);

            if (!result.Succeeded)
            {
                return BadRequest(new
                {
                    message = "Could not delete the courier.",
                    errors = result.Errors.Select(e => e.Description)
                });
            }

            return NoContent();
        }

        private static KorrieriResponse ToResponse(Korrieri k)
        {
            return new KorrieriResponse(
                k.KorrieriID,
                k.UserId,
                k.User?.Email,
                k.Emri,
                k.Mbiemri,
                k.NumriTelefonit,
                k.Posta,
                k.Qyteti,
                k.TargaEAutomjetit,
                k.Aktiv,
                k.DataEKrijimit);
        }

        private static void Apply(Korrieri korrieri, KorrieriRequest request)
        {
            korrieri.Emri = request.Emri.Trim();
            korrieri.Mbiemri = request.Mbiemri.Trim();
            korrieri.NumriTelefonit = request.NumriTelefonit.Trim();
            korrieri.Posta = request.Posta.Trim();
            korrieri.Qyteti = Clean(request.Qyteti);
            korrieri.TargaEAutomjetit = Clean(request.TargaEAutomjetit)?.ToUpperInvariant();
            korrieri.Aktiv = request.Aktiv;
        }

        private static string? Clean(string? value) =>
            string.IsNullOrWhiteSpace(value) ? null : value.Trim();
    }
}
