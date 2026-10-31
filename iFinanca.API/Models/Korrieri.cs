using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Identity;

namespace iFinanca.API.Models
{
    public class Korrieri
    {
        public int KorrieriID { get; set; }

        [MaxLength(100)]
        public string Emri { get; set; } = string.Empty;

        [MaxLength(100)]
        public string Mbiemri { get; set; } = string.Empty;

        [MaxLength(30)]
        public string NumriTelefonit { get; set; } = string.Empty;

        [MaxLength(100)]
        public string Posta { get; set; } = string.Empty;

        [MaxLength(100)]
        public string? Qyteti { get; set; }

        [MaxLength(20)]
        public string? TargaEAutomjetit { get; set; }

        public bool Aktiv { get; set; } = true;

        public DateTime DataEKrijimit { get; set; } = DateTime.UtcNow;

        public string UserId { get; set; } = string.Empty;

        public IdentityUser? User { get; set; }
    }
}
