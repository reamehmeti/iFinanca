using iFinanca.API.Data;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace iFinanca.API.Services
{
    public class UserAccountService
    {
        private readonly UserManager<IdentityUser> _userManager;
        private readonly ApplicationDbContext _context;

        public UserAccountService(
            UserManager<IdentityUser> userManager,
            ApplicationDbContext context)
        {
            _userManager = userManager;
            _context = context;
        }

        public async Task<IActionResult?> CheckCanDeleteAsync(string userId)
        {
            var count = await _context.Faturat.CountAsync(f =>
                f.Korrieri!.UserId == userId || f.Klienti!.UserId == userId);

            if (count == 0)
            {
                return null;
            }

            return new ConflictObjectResult(new
            {
                message = $"Nuk mund të fshihet: ka {count} faturë/a të lidhura. " +
                    "Fshij ose ndrysho faturat më parë."
            });
        }

        public async Task<IActionResult?> CreateAsync(IdentityUser user, string password, string role)
        {
            if (await _userManager.FindByEmailAsync(user.Email!) != null)
            {
                return new ConflictObjectResult(new
                {
                    message = "A user with this email already exists."
                });
            }

            var createResult = await _userManager.CreateAsync(user, password);

            if (!createResult.Succeeded)
            {
                return new BadRequestObjectResult(new
                {
                    message = "User creation failed.",
                    errors = createResult.Errors.Select(e => e.Description)
                });
            }

            var roleResult = await _userManager.AddToRoleAsync(user, role);

            if (!roleResult.Succeeded)
            {
                await _userManager.DeleteAsync(user);

                var error = new ObjectResult(new
                {
                    message = "Could not assign the role. User creation was rolled back.",
                    errors = roleResult.Errors.Select(e => e.Description)
                });
                error.StatusCode = 500;
                return error;
            }

            return null;
        }
    }
}
