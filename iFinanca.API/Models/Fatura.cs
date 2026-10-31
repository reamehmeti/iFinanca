using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace iFinanca.API.Models
{
    public class Fatura
    {
        public int FaturaID { get; set; }

        public int KlientiID { get; set; }

        public Klienti? Klienti { get; set; }

        public int KorrieriID { get; set; }

        public Korrieri? Korrieri { get; set; }

        [MaxLength(500)]
        public string Pershkrimi { get; set; } = string.Empty;

        [Column(TypeName = "decimal(18,2)")]
        public decimal Cmimi { get; set; }

        public StatusiFatures Statusi { get; set; } = StatusiFatures.EKrijuar;

        public DateTime DataEKrijimit { get; set; } = DateTime.UtcNow;

        public DateTime DataEPerditesimit { get; set; } = DateTime.UtcNow;
    }

    public enum StatusiFatures
    {
        EKrijuar,
        GatiPerDorezim,
        NeDorezim,
        EPranuar,
        EPaguar
    }

    public static class StatusiFaturesInfo
    {
        public static string Label(StatusiFatures statusi) => statusi switch
        {
            StatusiFatures.EKrijuar => "E krijuar",
            StatusiFatures.GatiPerDorezim => "Gati për dorëzim",
            StatusiFatures.NeDorezim => "Në dorëzim",
            StatusiFatures.EPranuar => "E pranuar",
            StatusiFatures.EPaguar => "E paguar",
            _ => statusi.ToString()
        };
    }
}
