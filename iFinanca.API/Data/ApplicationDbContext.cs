using iFinanca.API.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace iFinanca.API.Data
{
    public class ApplicationDbContext
    : IdentityDbContext<IdentityUser>
    {
        public ApplicationDbContext(
            DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<Korrieri> Korrierat => Set<Korrieri>();

        public DbSet<Klienti> Klientet => Set<Klienti>();

        public DbSet<Fatura> Faturat => Set<Fatura>();

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            builder.Entity<Korrieri>(entity =>
            {
                entity.ToTable("Korrieri");
                entity.HasKey(k => k.KorrieriID);
                entity.HasOne(k => k.User)
                    .WithOne()
                    .HasForeignKey<Korrieri>(k => k.UserId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            builder.Entity<Klienti>(entity =>
            {
                entity.ToTable("Klienti");
                entity.HasKey(k => k.KlientiID);
                entity.HasOne(k => k.User)
                    .WithOne()
                    .HasForeignKey<Klienti>(k => k.UserId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // Restrict: klienti ose korrieri që ka fatura nuk mund të fshihet.
            builder.Entity<Fatura>(entity =>
            {
                entity.ToTable("Fatura");
                entity.HasKey(f => f.FaturaID);
                entity.Property(f => f.Statusi)
                    .HasConversion<string>()
                    .HasMaxLength(30);
                entity.HasOne(f => f.Klienti)
                    .WithMany()
                    .HasForeignKey(f => f.KlientiID)
                    .OnDelete(DeleteBehavior.Restrict);
                entity.HasOne(f => f.Korrieri)
                    .WithMany()
                    .HasForeignKey(f => f.KorrieriID)
                    .OnDelete(DeleteBehavior.Restrict);
            });
        }
    }
}
