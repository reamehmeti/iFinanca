using System.ComponentModel.DataAnnotations;
using iFinanca.API.Models;

namespace iFinanca.API.Dtos
{
    public class FaturaRequest
    {
        [Range(1, int.MaxValue, ErrorMessage = "Zgjidh klientin.")]
        public int KlientiID { get; set; }

        [Range(1, int.MaxValue, ErrorMessage = "Zgjidh korrierin.")]
        public int KorrieriID { get; set; }

        [Required, MaxLength(500)]
        public string Pershkrimi { get; set; } = string.Empty;

        [Range(typeof(decimal), "0", "99999999", ErrorMessage = "Çmimi duhet të jetë 0 ose më i madh.")]
        public decimal Cmimi { get; set; }

        public StatusiFatures Statusi { get; set; } = StatusiFatures.EKrijuar;
    }

    public class ChangeStatusRequest
    {
        public StatusiFatures Statusi { get; set; }
    }

    public record FaturaResponse(
        int FaturaID,
        int KlientiID,
        string EmriIKompanise,
        string PersoniPergjegjes,
        string Adresa,
        string? KlientiQyteti,
        string? KlientiTelefoni,
        string? NUI,
        string? KlientiEmail,
        int KorrieriID,
        string KorrieriEmri,
        string KorrieriTelefoni,
        string Posta,
        string? TargaEAutomjetit,
        string Pershkrimi,
        decimal Cmimi,
        StatusiFatures Statusi,
        DateTime DataEKrijimit,
        DateTime DataEPerditesimit,
        StatusiFatures[] StatuseTeLejuara);
}
