using System.ComponentModel.DataAnnotations;
using iFinanca.API.Data;
using iFinanca.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace iFinanca.API.Controllers
{
    [ApiController]
    [Route("api/admin/users")]
    [Authorize(Roles = Roles.Admin)]
    public class UsersController : ControllerBase
    {
        private readonly UserManager<IdentityUser> _userManager;
        private readonly SignInManager<IdentityUser> _signInManager;
        private readonly ApplicationDbContext _context;
        private readonly UserAccountService _accounts;

        public UsersController(
            UserManager<IdentityUser> userManager,
            SignInManager<IdentityUser> signInManager,
            ApplicationDbContext context,
            UserAccountService accounts)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _context = context;
            _accounts = accounts;
        }

        public record CreateAdminRequest(
            [Required, EmailAddress] string Email,
            [Required] string Password);

        public record UpdateUserRequest(
            [Required, EmailAddress] string Email,
            string? NewPassword);

        public record UserResponse(
            string Id,
            string? Email,
            string? Role,
            string? Name,
            int? KorrieriID,
            int? KlientiID);

        [HttpGet]
        public async Task<IActionResult> GetUsers()
        {
            var users = await _context.Users.OrderBy(u => u.Email).ToListAsync();
            var korrierat = await _context.Korrierat.ToListAsync();
            var klientet = await _context.Klientet.ToListAsync();

            var result = new List<UserResponse>();

            foreach (var user in users)
            {
                var roles = await _userManager.GetRolesAsync(user);
                var korrieri = korrierat.FirstOrDefault(k => k.UserId == user.Id);
                var klienti = klientet.FirstOrDefault(k => k.UserId == user.Id);

                string? name = null;

                if (korrieri != null)
                {
                    name = korrieri.Emri + " " + korrieri.Mbiemri;
                }
                else if (klienti != null)
                {
                    name = klienti.EmriIKompanise;
                }

                result.Add(new UserResponse(
                    user.Id,
                    user.Email,
                    roles.FirstOrDefault(),
                    name,
                    korrieri?.KorrieriID,
                    klienti?.KlientiID));
            }

            return Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> CreateAdmin([FromBody] CreateAdminRequest request)
        {
            var user = new IdentityUser
            {
                UserName = request.Email.Trim(),
                Email = request.Email.Trim(),
                EmailConfirmed = true
            };

            var error = await _accounts.CreateAsync(user, request.Password, Roles.Admin);

            if (error != null)
            {
                return error;
            }

            return Ok(new
            {
                message = "User created successfully.",
                userId = user.Id,
                email = user.Email,
                role = Roles.Admin
            });
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUser(
            string id,
            [FromBody] UpdateUserRequest request)
        {
            var user = await _userManager.FindByIdAsync(id);

            if (user == null)
            {
                return NotFound(new { message = "User not found." });
            }

            var email = request.Email.Trim();

            if (user.Email != email)
            {
                var existingUser = await _userManager.FindByEmailAsync(email);

                if (existingUser != null && existingUser.Id != user.Id)
                {
                    return Conflict(new
                    {
                        message = "A user with this email already exists."
                    });
                }

                user.Email = email;
                user.UserName = email;
                user.EmailConfirmed = true;

                var updateResult = await _userManager.UpdateAsync(user);

                if (!updateResult.Succeeded)
                {
                    return BadRequest(new
                    {
                        message = "Could not update the user.",
                        errors = updateResult.Errors.Select(e => e.Description)
                    });
                }
            }

            if (!string.IsNullOrWhiteSpace(request.NewPassword))
            {
                var token = await _userManager.GeneratePasswordResetTokenAsync(user);
                var passwordResult = await _userManager.ResetPasswordAsync(
                    user,
                    token,
                    request.NewPassword);

                if (!passwordResult.Succeeded)
                {
                    return BadRequest(new
                    {
                        message = "Password change failed.",
                        errors = passwordResult.Errors.Select(e => e.Description)
                    });
                }
            }

            if (user.Id == _userManager.GetUserId(User))
            {
                await _signInManager.RefreshSignInAsync(user);
            }

            return Ok(new { message = "User updated successfully." });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(string id)
        {
            if (id == _userManager.GetUserId(User))
            {
                return BadRequest(new
                {
                    message = "You cannot delete your own account."
                });
            }

            var user = await _userManager.FindByIdAsync(id);

            if (user == null)
            {
                return NotFound(new { message = "User not found." });
            }

            var blocked = await _accounts.CheckCanDeleteAsync(user.Id);

            if (blocked != null)
            {
                return blocked;
            }

            var result = await _userManager.DeleteAsync(user);

            if (!result.Succeeded)
            {
                return BadRequest(new
                {
                    message = "Could not delete the user.",
                    errors = result.Errors.Select(e => e.Description)
                });
            }

            return NoContent();
        }
    }
}
