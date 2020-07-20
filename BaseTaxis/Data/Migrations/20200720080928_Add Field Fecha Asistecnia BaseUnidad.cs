using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace BaseTaxis.Data.Migrations
{
    public partial class AddFieldFechaAsistecniaBaseUnidad : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "Fecha",
                table: "BaseUnidades",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Fecha",
                table: "BaseUnidades");
        }
    }
}
