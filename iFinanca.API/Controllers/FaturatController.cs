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
    [Route("api/faturat")]
    [Authorize]
    public class FaturatController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly UserManager<IdentityUser> _userManager;
        private readonly FaturaPdfService _pdf;

        public FaturatController(
            ApplicationDbContext context,
            UserManager<IdentityUser> userManager,
            FaturaPdfService pdf)
        {
            _context = context;
            _userManager = userManager;
            _pdf = pdf;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var faturat = await VisibleFaturat()
                .OrderByDescending(f => f.FaturaID)
                .ToListAsync();

            return Ok(faturat.Select(ToResponse));
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> Get(int id)
        {
            var fatura = await VisibleFaturat().FirstOrDefaultAsync(f => f.FaturaID == id);

            if (fatura == null)
            {
                return NotFound(new { message = "Fatura nuk u gjet." });
            }

            return Ok(ToResponse(fatura));
        }

        [HttpGet("{id:int}/pdf")]
        public async Task<IActionResult> DownloadPdf(int id)
        {
            var fatura = await VisibleFaturat().FirstOrDefaultAsync(f => f.FaturaID == id);

            if (fatura == null)
            {
                return NotFound(new { message = "Fatura nuk u gjet." });
            }

            return File(
                _pdf.Generate(ToResponse(fatura)),
                "application/pdf",
                FaturaPdfService.FileName(fatura.FaturaID));
        }

        [HttpPost]
        [Authorize(Roles = Roles.Admin)]
        public async Task<IActionResult> Create([FromBody] FaturaRequest request)
        {
            var error = await Validate(request, currentKorrieriID: null);

            if (error != null)
            {
                return error;
            }

            var fatura = new Fatura();
            Apply(fatura, request);

            _context.Faturat.Add(fatura);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(Get), new { id = fatura.FaturaID }, new
            {
                message = "Fatura u krijua me sukses.",
                faturaID = fatura.FaturaID
            });
        }

        [HttpPut("{id:int}")]
        [Authorize(Roles = Roles.Admin)]
        public async Task<IActionResult> Update(int id, [FromBody] FaturaRequest request)
        {
            var fatura = await _context.Faturat.FindAsync(id);

            if (fatura == null)
            {
                return NotFound(new { message = "Fatura nuk u gjet." });
            }

            var error = await Validate(request, fatura.KorrieriID);

            if (error != null)
            {
                return error;
            }

            Apply(fatura, request);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Fatura u ruajt me sukses." });
        }

        [HttpPatch("{id:int}/statusi")]
        public async Task<IActionResult> ChangeStatus(int id, [FromBody] ChangeStatusRequest request)
        {
            if (!Enum.IsDefined(request.Statusi))
            {
                return BadRequest(new { message = "Statusi nuk është valid." });
            }

            var fatura = await VisibleFaturat().FirstOrDefaultAsync(f => f.FaturaID == id);

            if (fatura == null)
            {
                return NotFound(new { message = "Fatura nuk u gjet." });
            }

            if (fatura.Statusi != request.Statusi)
            {
                var allowed = FaturaWorkflow.NextStatuses(fatura.Statusi, CurrentRole());

                if (!allowed.Contains(request.Statusi))
                {
                    return StatusCode(StatusCodes.Status403Forbidden, new
                    {
                        message = $"Statusi nuk mund të ndryshohet nga \"{StatusiFaturesInfo.Label(fatura.Statusi)}\" " +
                            $"në \"{StatusiFaturesInfo.Label(request.Statusi)}\"."
                    });
                }

                fatura.Statusi = request.Statusi;
                fatura.DataEPerditesimit = DateTime.UtcNow;
                await _context.SaveChangesAsync();
            }

            return Ok(new
            {
                message = $"Statusi u ndryshua në \"{StatusiFaturesInfo.Label(fatura.Statusi)}\".",
                statusi = fatura.Statusi
            });
        }

        [HttpDelete("{id:int}")]
        [Authorize(Roles = Roles.Admin)]
        public async Task<IActionResult> Delete(int id)
        {
            var fatura = await _context.Faturat.FindAsync(id);

            if (fatura == null)
            {
                return NotFound(new { message = "Fatura nuk u gjet." });
            }

            _context.Faturat.Remove(fatura);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // Admini i sheh të gjitha faturat, korrieri dhe klienti vetëm të tyret.
        private IQueryable<Fatura> VisibleFaturat()
        {
            var faturat = _context.Faturat
                .Include(f => f.Klienti).ThenInclude(k => k!.User)
                .Include(f => f.Korrieri);

            var userId = _userManager.GetUserId(User);

            if (User.IsInRole(Roles.Admin))
            {
                return faturat;
            }

            if (User.IsInRole(Roles.Courier))
            {
                return faturat.Where(f => f.Korrieri!.UserId == userId);
            }

            if (User.IsInRole(Roles.Client))
            {
                return faturat.Where(f => f.Klienti!.UserId == userId);
            }

            return faturat.Where(f => false);
        }

        private string? CurrentRole()
        {
            foreach (var role in Roles.All)
            {
                if (User.IsInRole(role))
                {
                    return role;
                }
            }

            return null;
        }

        private FaturaResponse ToResponse(Fatura f)
        {
            var klienti = f.Klienti!;
            var korrieri = f.Korrieri!;

            return new FaturaResponse(
                f.FaturaID,
                f.KlientiID,
                klienti.EmriIKompanise,
                klienti.PersoniPergjegjes,
                klienti.Adresa,
                klienti.Qyteti,
                klienti.NumriTelefonit,
                klienti.NUI,
                klienti.User?.Email,
                f.KorrieriID,
                korrieri.Emri + " " + korrieri.Mbiemri,
                korrieri.NumriTelefonit,
                korrieri.Posta,
                korrieri.TargaEAutomjetit,
                f.Pershkrimi,
                f.Cmimi,
                f.Statusi,
                f.DataEKrijimit,
                f.DataEPerditesimit,
                FaturaWorkflow.NextStatuses(f.Statusi, CurrentRole()));
        }

        private async Task<IActionResult?> Validate(FaturaRequest request, int? currentKorrieriID)
        {
            if (!Enum.IsDefined(request.Statusi))
            {
                return BadRequest(new { message = "Statusi nuk është valid." });
            }

            if (!await _context.Klientet.AnyAsync(k => k.KlientiID == request.KlientiID))
            {
                return BadRequest(new { message = "Klienti nuk ekziston." });
            }

            var korrieri = await _context.Korrierat.FindAsync(request.KorrieriID);

            if (korrieri == null)
            {
                return BadRequest(new { message = "Korrieri nuk ekziston." });
            }

            if (!korrieri.Aktiv && korrieri.KorrieriID != currentKorrieriID)
            {
                return BadRequest(new { message = "Mund të zgjidhet vetëm një korrier aktiv." });
            }

            return null;
        }

        private static void Apply(Fatura fatura, FaturaRequest request)
        {
            if (fatura.Statusi != request.Statusi)
            {
                fatura.DataEPerditesimit = DateTime.UtcNow;
            }

            fatura.KlientiID = request.KlientiID;
            fatura.KorrieriID = request.KorrieriID;
            fatura.Pershkrimi = request.Pershkrimi.Trim();
            fatura.Cmimi = decimal.Round(request.Cmimi, 2, MidpointRounding.AwayFromZero);
            fatura.Statusi = request.Statusi;
        }
    }
}
