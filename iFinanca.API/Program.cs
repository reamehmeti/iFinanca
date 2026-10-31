
using System.Text.Json.Serialization;
using iFinanca.API.Data;
using iFinanca.API.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using QuestPDF.Infrastructure;

var builder = WebApplication.CreateBuilder(args);

// Passwords are kept in appsettings.Local.json, which is not committed to git.
builder.Configuration.AddJsonFile("appsettings.Local.json", optional: true, reloadOnChange: true);

// 1. Configure the database connection
var connectionString = builder.Configuration
    .GetConnectionString("DefaultConnection")
    ?? throw new InvalidOperationException(
        "Connection string 'DefaultConnection' was not found.");

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(connectionString));

// 2. Configure ASP.NET Core Identity
builder.Services
    .AddIdentityApiEndpoints<IdentityUser>(options =>
    {
        options.User.RequireUniqueEmail = true;
    })
    .AddRoles<IdentityRole>()
    .AddEntityFrameworkStores<ApplicationDbContext>();

builder.Services.Configure<SecurityStampValidatorOptions>(options =>
{
    options.ValidationInterval = TimeSpan.FromMinutes(1);
});

// 3. Configure controllers, authorization, and Swagger
builder.Services.AddScoped<UserAccountService>();
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    });
builder.Services.AddAuthorization();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// QuestPDF Community license: free for companies with less than $1M yearly revenue.
QuestPDF.Settings.License = LicenseType.Community;
builder.Services.AddSingleton<FaturaPdfService>();

// 4. Build the application
var app = builder.Build();

// 5. Create the database, the roles and the first Admin user
await DbSeeder.SeedAsync(app.Services);

// 6. Enable Swagger in development
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// 7. Configure the HTTP request pipeline
app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();

// 8. Map API controllers
app.MapControllers();

// 9. Map Identity endpoints.
// Only the Admin can create users, so registration and password reset by email are turned off.
app.Use(async (context, next) =>
{
    var path = context.Request.Path.Value?.ToLower();

    if (path == "/api/auth/register" ||
        path == "/api/auth/forgotpassword" ||
        path == "/api/auth/resetpassword")
    {
        context.Response.StatusCode = 404;
        return;
    }

    await next();
});

app.MapGroup("/api/auth").MapIdentityApi<IdentityUser>();

app.Run();
