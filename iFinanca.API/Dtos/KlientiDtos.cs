using System.ComponentModel.DataAnnotations;

namespace iFinanca.API.Dtos
{
    public class KlientiRequest
    {
        [Required, MaxLength(200)]
        public string EmriIKompanise { get; set; } = string.Empty;

        [Required, MaxLength(150)]
        public string PersoniPergjegjes { get; set; } = string.Empty;

        [Required, MaxLength(250)]
        public string Adresa { get; set; } = string.Empty;

        [MaxLength(100)]
        public string? Qyteti { get; set; }

        [MaxLength(30)]
        public string? NumriTelefonit { get; set; }

        [MaxLength(20)]
        public string? NUI { get; set; }
    }

    public class CreateKlientiRequest : KlientiRequest
    {
        [Required, EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string Password { get; set; } = string.Empty;
    }

    public record KlientiResponse(
        int KlientiID,
        string UserId,
        string? Email,
        string EmriIKompanise,
        string PersoniPergjegjes,
        string Adresa,
        string? Qyteti,
        string? NumriTelefonit,
        string? NUI,
        DateTime DataEKrijimit);
}
