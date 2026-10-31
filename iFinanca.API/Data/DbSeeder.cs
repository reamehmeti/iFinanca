using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace iFinanca.API.Data
{
    public static class DbSeeder
    {
        public static async Task SeedAsync(IServiceProvider services)
        {
            using var scope = services.CreateScope();
            var provider = scope.ServiceProvider;

            var context = provider.GetRequiredService<ApplicationDbContext>();
            var roleManager = provider.GetRequiredService<RoleManager<IdentityRole>>();
            var userManager = provider.GetRequiredService<UserManager<IdentityUser>>();
            var configuration = provider.GetRequiredService<IConfiguration>();
            var logger = provider.GetRequiredService<ILoggerFactory>()
                .CreateLogger(nameof(DbSeeder));

            await context.Database.MigrateAsync();

            foreach (var role in Roles.All)
            {
                if (!await roleManager.RoleExistsAsync(role))
                {
                    await roleManager.CreateAsync(new IdentityRole(role));
                }
            }

            var admins = await userManager.GetUsersInRoleAsync(Roles.Admin);

            if (admins.Count > 0)
            {
                return;
            }

            var email = configuration["SeedAdmin:Email"];
            var password = configuration["SeedAdmin:Password"];

            if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(password))
            {
                logger.LogWarning(
                    "No Admin user exists and SeedAdmin:Email / SeedAdmin:Password are not configured.");
                return;
            }

            var admin = await userManager.FindByEmailAsync(email);

            if (admin == null)
            {
                admin = new IdentityUser
                {
                    UserName = email,
                    Email = email,
                    EmailConfirmed = true
                };

                var createResult = await userManager.CreateAsync(admin, password);

                if (!createResult.Succeeded)
                {
                    logger.LogError(
                        "Could not create the seed Admin user: {Errors}",
                        string.Join(" ", createResult.Errors.Select(e => e.Description)));
                    return;
                }
            }

            await userManager.AddToRoleAsync(admin, Roles.Admin);
            logger.LogInformation("Seed Admin user {Email} is ready.", email);
        }
    }
}
