namespace iFinanca.API.Data
{
    public static class Roles
    {
        public const string Admin = "Admin";
        public const string Courier = "Courier";
        public const string Client = "Client";

        public static readonly string[] All = { Admin, Courier, Client };
    }
}
