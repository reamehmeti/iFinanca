using System.ComponentModel.DataAnnotations;

namespace iFinanca.API.Dtos
{
    public class KorrieriRequest
    {
        [Required, MaxLength(100)]
        public string Emri { get; set; } = string.Empty;

        [Required, MaxLength(100)]
        public string Mbiemri { get; set; } = string.Empty;

        [Required, MaxLength(30)]
        public string NumriTelefonit { get; set; } = string.Empty;

        [Required, MaxLength(100)]
        public string Posta { get; set; } = string.Empty;

        [MaxLength(100)]
        public string? Qyteti { get; set; }

        [MaxLength(20)]
        public string? TargaEAutomjetit { get; set; }

        public bool Aktiv { get; set; } = true;
    }

    public class CreateKorrieriRequest : KorrieriRequest
    {
        [Required, EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string Password { get; set; } = string.Empty;
    }

    public record KorrieriResponse(
        int KorrieriID,
        string UserId,
        string? Email,
        string Emri,
        string Mbiemri,
        string NumriTelefonit,
        string Posta,
        string? Qyteti,
        string? TargaEAutomjetit,
        bool Aktiv,
        DateTime DataEKrijimit);
}
