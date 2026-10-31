using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace iFinanca.API.Migrations
{
    /// <inheritdoc />
    public partial class AddKorrieriKlienti : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Klienti",
                columns: table => new
                {
                    KlientiID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EmriIKompanise = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    PersoniPergjegjes = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    Adresa = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: false),
                    Qyteti = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    NumriTelefonit = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: true),
                    NUI = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    DataEKrijimit = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UserId = table.Column<string>(type: "nvarchar(450)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Klienti", x => x.KlientiID);
                    table.ForeignKey(
                        name: "FK_Klienti_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Korrieri",
                columns: table => new
                {
                    KorrieriID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Emri = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Mbiemri = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    NumriTelefonit = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    Posta = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Qyteti = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    TargaEAutomjetit = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    Aktiv = table.Column<bool>(type: "bit", nullable: false),
                    DataEKrijimit = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UserId = table.Column<string>(type: "nvarchar(450)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Korrieri", x => x.KorrieriID);
                    table.ForeignKey(
                        name: "FK_Korrieri_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Klienti_UserId",
                table: "Klienti",
                column: "UserId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Korrieri_UserId",
                table: "Korrieri",
                column: "UserId",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Klienti");

            migrationBuilder.DropTable(
                name: "Korrieri");
        }
    }
}
