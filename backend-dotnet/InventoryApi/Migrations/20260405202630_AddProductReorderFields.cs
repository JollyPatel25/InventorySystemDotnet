using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace InventoryApi.Migrations
{
    /// <inheritdoc />
    public partial class AddProductReorderFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "LeadTimeDays",
                table: "Products",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "ReorderPoint",
                table: "Products",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "AnomalyDetected",
                table: "Predictions",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "InsightMessage",
                table: "Predictions",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ModelUsed",
                table: "Predictions",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "RecommendedReorderQty",
                table: "Predictions",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "StockoutRiskDays",
                table: "Predictions",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Trend",
                table: "Predictions",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<double>(
                name: "TrendPercent",
                table: "Predictions",
                type: "double precision",
                nullable: false,
                defaultValue: 0.0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "LeadTimeDays",
                table: "Products");

            migrationBuilder.DropColumn(
                name: "ReorderPoint",
                table: "Products");

            migrationBuilder.DropColumn(
                name: "AnomalyDetected",
                table: "Predictions");

            migrationBuilder.DropColumn(
                name: "InsightMessage",
                table: "Predictions");

            migrationBuilder.DropColumn(
                name: "ModelUsed",
                table: "Predictions");

            migrationBuilder.DropColumn(
                name: "RecommendedReorderQty",
                table: "Predictions");

            migrationBuilder.DropColumn(
                name: "StockoutRiskDays",
                table: "Predictions");

            migrationBuilder.DropColumn(
                name: "Trend",
                table: "Predictions");

            migrationBuilder.DropColumn(
                name: "TrendPercent",
                table: "Predictions");
        }
    }
}
