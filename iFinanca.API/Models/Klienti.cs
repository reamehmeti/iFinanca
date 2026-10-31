using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Identity;

namespace iFinanca.API.Models
{
    public class Klienti
    {
        public int KlientiID { get; set; }

        [MaxLength(200)]
        public string EmriIKompanise { get; set; } = string.Empty;

        [MaxLength(150)]
        public string PersoniPergjegjes { get; set; } = string.Empty;

        [MaxLength(250)]
        public string Adresa { get; set; } = string.Empty;

        [MaxLength(100)]
        public string? Qyteti { get; set; }

        [MaxLength(30)]
        public string? NumriTelefonit { get; set; }

        [MaxLength(20)]
        public string? NUI { get; set; }

        public DateTime DataEKrijimit { get; set; } = DateTime.UtcNow;

        public string UserId { get; set; } = string.Empty;

        public IdentityUser? User { get; set; }
    }
}
