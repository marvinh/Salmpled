using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace salmpledv2_backend.Migrations
{
    public partial class tempo : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "Tempo",
                table: "Samples",
                type: "decimal(18,2)",
                precision: 18,
                scale: 2,
                nullable: false,
                defaultValue: 0m);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Tempo",
                table: "Samples")
                .Annotation("SqlServer:IsTemporal", true)
                .Annotation("SqlServer:TemporalHistoryTableName", "SamplesHistory")
                .Annotation("SqlServer:TemporalHistoryTableSchema", null);
        }
    }
}
