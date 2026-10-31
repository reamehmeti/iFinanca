using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace iFinanca.API.Migrations
{
    /// <inheritdoc />
    public partial class AddFatura : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Fatura",
                columns: table => new
                {
                    FaturaID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    KlientiID = table.Column<int>(type: "int", nullable: false),
                    KorrieriID = table.Column<int>(type: "int", nullable: false),
                    Pershkrimi = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    Cmimi = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Statusi = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    DataEKrijimit = table.Column<DateTime>(type: "datetime2", nullable: false),
                    DataEPerditesimit = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Fatura", x => x.FaturaID);
                    table.ForeignKey(
                        name: "FK_Fatura_Klienti_KlientiID",
                        column: x => x.KlientiID,
                        principalTable: "Klienti",
                        principalColumn: "KlientiID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Fatura_Korrieri_KorrieriID",
                        column: x => x.KorrieriID,
                        principalTable: "Korrieri",
                        principalColumn: "KorrieriID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Fatura_KlientiID",
                table: "Fatura",
                column: "KlientiID");

            migrationBuilder.CreateIndex(
                name: "IX_Fatura_KorrieriID",
                table: "Fatura",
                column: "KorrieriID");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Fatura");
        }
    }
}
