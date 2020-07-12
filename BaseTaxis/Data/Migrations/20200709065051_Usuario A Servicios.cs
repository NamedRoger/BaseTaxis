using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace BaseTaxis.Data.Migrations
{
    public partial class UsuarioAServicios : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "IdUsuario",
                table: "Servicios",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.CreateIndex(
                name: "IX_Servicios_IdUsuario",
                table: "Servicios",
                column: "IdUsuario");

            migrationBuilder.AddForeignKey(
                name: "FK_Servicios_AspNetUsers_IdUsuario",
                table: "Servicios",
                column: "IdUsuario",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Servicios_AspNetUsers_IdUsuario",
                table: "Servicios");

            migrationBuilder.DropIndex(
                name: "IX_Servicios_IdUsuario",
                table: "Servicios");

            migrationBuilder.DropColumn(
                name: "IdUsuario",
                table: "Servicios");
        }
    }
}
