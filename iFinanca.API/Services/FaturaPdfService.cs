using System.Globalization;
using iFinanca.API.Dtos;
using iFinanca.API.Models;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace iFinanca.API.Services
{
    public class FaturaPdfService
    {
        private static readonly CultureInfo Culture = CultureInfo.GetCultureInfo("de-DE");
        private const string Accent = "#155EEF";
        private const string Muted = "#687386";

        private readonly IConfiguration _configuration;

        public FaturaPdfService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        private string Kompania(string key) => _configuration[$"Kompania:{key}"] ?? string.Empty;

        public static string FileName(int faturaId) => $"Fatura-{Number(faturaId)}.pdf";

        public byte[] Generate(FaturaResponse fatura)
        {
            return Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.Size(PageSizes.A4);
                    page.Margin(40);
                    page.DefaultTextStyle(text => text.FontSize(10).FontColor("#172033"));

                    page.Header().Element(header => Header(header, fatura));
                    page.Content().PaddingVertical(24).Element(content => Content(content, fatura));
                    page.Footer().AlignCenter().Text(text =>
                    {
                        text.DefaultTextStyle(style => style.FontSize(8).FontColor(Muted));
                        text.Span($"{Kompania("Emri")} · {Kompania("Website")} · Faqja ");
                        text.CurrentPageNumber();
                        text.Span(" / ");
                        text.TotalPages();
                    });
                });
            }).GeneratePdf();
        }

        private void Header(IContainer container, FaturaResponse fatura)
        {
            container.Row(row =>
            {
                row.RelativeItem().Column(column =>
                {
                    column.Item().Text("iFinanca").FontSize(22).Bold().FontColor(Accent);
                    column.Item().PaddingTop(4).Text(Kompania("Emri")).SemiBold();
                    column.Item().Text(Kompania("Adresa")).FontColor(Muted);
                    column.Item().Text(Kompania("Qyteti")).FontColor(Muted);
                    column.Item().Text($"{Kompania("Telefoni")} · {Kompania("Email")}").FontColor(Muted);
                });

                row.ConstantItem(200).AlignRight().Column(column =>
                {
                    column.Item().AlignRight().Text("FATURË").FontSize(20).Bold();
                    column.Item().AlignRight().Text($"Nr. {Number(fatura.FaturaID)}").SemiBold();
                    column.Item().AlignRight().Text($"Data: {Date(fatura.DataEKrijimit)}").FontColor(Muted);
                    column.Item().AlignRight().PaddingTop(6)
                        .Background(StatusColor(fatura.Statusi)).PaddingVertical(3).PaddingHorizontal(8)
                        .Text(StatusiFaturesInfo.Label(fatura.Statusi)).FontColor(Colors.White).SemiBold();
                });
            });
        }

        private static void Content(IContainer container, FaturaResponse fatura)
        {
            container.Column(column =>
            {
                column.Spacing(20);

                column.Item().Row(row =>
                {
                    row.Spacing(20);

                    row.RelativeItem().Element(box => InfoBox(box, "KLIENTI", info =>
                    {
                        info.Item().Text(fatura.EmriIKompanise).Bold().FontSize(11);
                        info.Item().Text($"Personi përgjegjës: {fatura.PersoniPergjegjes}");
                        info.Item().Text(fatura.Adresa);
                        Optional(info, fatura.KlientiQyteti);
                        Optional(info, fatura.NUI, "NUI: ");
                        Optional(info, fatura.KlientiTelefoni, "Tel: ");
                        Optional(info, fatura.KlientiEmail);
                    }));

                    row.RelativeItem().Element(box => InfoBox(box, "KORRIERI", info =>
                    {
                        info.Item().Text(fatura.KorrieriEmri).Bold().FontSize(11);
                        info.Item().Text($"Posta: {fatura.Posta}");
                        info.Item().Text($"Tel: {fatura.KorrieriTelefoni}");
                        Optional(info, fatura.TargaEAutomjetit, "Targa: ");
                    }));
                });

                column.Item().Table(table =>
                {
                    table.ColumnsDefinition(columns =>
                    {
                        columns.ConstantColumn(30);
                        columns.RelativeColumn();
                        columns.ConstantColumn(100);
                    });

                    table.Header(header =>
                    {
                        HeaderCell(header.Cell(), "#");
                        HeaderCell(header.Cell(), "Përshkrimi");
                        HeaderCell(header.Cell(), "Çmimi", alignRight: true);
                    });

                    BodyCell(table.Cell()).Text("1");
                    BodyCell(table.Cell()).Text(fatura.Pershkrimi);
                    BodyCell(table.Cell()).AlignRight().Text(Money(fatura.Cmimi));
                });

                column.Item().AlignRight().Width(220).Background("#EFF4FF").Padding(12).Row(row =>
                {
                    row.RelativeItem().Text("Totali për pagesë").SemiBold();
                    row.AutoItem().Text(Money(fatura.Cmimi)).Bold().FontSize(13).FontColor(Accent);
                });

                column.Item().Text(
                        $"Statusi u përditësua më {Date(fatura.DataEPerditesimit)}. " +
                        "Kjo faturë është gjeneruar automatikisht nga iFinanca.")
                    .FontSize(8).FontColor(Muted);
            });
        }

        private static void InfoBox(IContainer container, string title, Action<ColumnDescriptor> content)
        {
            container.Border(1).BorderColor("#E5EAF2").Padding(12).Column(column =>
            {
                column.Spacing(2);
                column.Item().PaddingBottom(4).Text(title).FontSize(8).SemiBold().FontColor(Muted);
                content(column);
            });
        }

        private static void Optional(ColumnDescriptor column, string? value, string prefix = "")
        {
            if (!string.IsNullOrWhiteSpace(value))
            {
                column.Item().Text(prefix + value);
            }
        }

        private static void HeaderCell(IContainer container, string text, bool alignRight = false)
        {
            var cell = container.BorderBottom(1).BorderColor("#D5DCE8").PaddingVertical(6);
            (alignRight ? cell.AlignRight() : cell).Text(text).FontSize(9).SemiBold().FontColor(Muted);
        }

        private static IContainer BodyCell(IContainer container) =>
            container.BorderBottom(1).BorderColor("#F0F3F8").PaddingVertical(8);

        private static string Number(int faturaId) => faturaId.ToString("D6");

        private static string Date(DateTime value) =>
            DateTime.SpecifyKind(value, DateTimeKind.Utc).ToLocalTime().ToString("dd.MM.yyyy");

        private static string Money(decimal value) => $"{value.ToString("N2", Culture)} €";

        public static string StatusColor(StatusiFatures statusi) => statusi switch
        {
            StatusiFatures.EKrijuar => "#64748B",
            StatusiFatures.GatiPerDorezim => "#D97706",
            StatusiFatures.NeDorezim => "#2563EB",
            StatusiFatures.EPranuar => "#7C3AED",
            StatusiFatures.EPaguar => "#16A34A",
            _ => "#64748B"
        };
    }
}
