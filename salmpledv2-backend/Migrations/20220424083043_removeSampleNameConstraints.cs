using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace salmpledv2_backend.Migrations
{
    public partial class removeSampleNameConstraints : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Samples_Name_PackId",
                table: "Samples");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_Samples_Name_PackId",
                table: "Samples",
                columns: new[] { "Name", "PackId" },
                unique: true);
        }
    }
}
