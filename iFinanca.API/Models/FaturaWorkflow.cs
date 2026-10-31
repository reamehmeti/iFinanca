using iFinanca.API.Data;

namespace iFinanca.API.Models
{
    // E krijuar -> Gati për dorëzim (Admin) -> Në dorëzim (Korrieri) -> E pranuar (Korrieri/Klienti) -> E paguar (Klienti)
    // Admini mund ta vendosë çdo status.
    public static class FaturaWorkflow
    {
        public static StatusiFatures[] NextStatuses(StatusiFatures current, string? role)
        {
            if (role == Roles.Admin)
            {
                return Enum.GetValues<StatusiFatures>()
                    .Where(statusi => statusi != current)
                    .ToArray();
            }

            if (role == Roles.Courier)
            {
                if (current == StatusiFatures.GatiPerDorezim)
                {
                    return new[] { StatusiFatures.NeDorezim };
                }

                if (current == StatusiFatures.NeDorezim)
                {
                    return new[] { StatusiFatures.EPranuar };
                }
            }

            if (role == Roles.Client)
            {
                if (current == StatusiFatures.NeDorezim)
                {
                    return new[] { StatusiFatures.EPranuar };
                }

                if (current == StatusiFatures.EPranuar)
                {
                    return new[] { StatusiFatures.EPaguar };
                }
            }

            return Array.Empty<StatusiFatures>();
        }
    }
}
