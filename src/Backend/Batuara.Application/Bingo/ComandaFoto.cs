namespace Batuara.Application.Bingo.Models
{
    public class ComandaFotoItem
    {
        public string Name { get; set; } = string.Empty;
        public int Quantity { get; set; } = 1;
        public decimal UnitPrice { get; set; }
        /// <summary>false quando o item não foi reconhecido no cardápio (precisa de conferência).</summary>
        public bool Matched { get; set; } = true;
    }

    public class ComandaFotoExtractRequest
    {
        public string ImageBase64 { get; set; } = string.Empty;
        public string MediaType { get; set; } = "image/jpeg";
    }

    public class ComandaFotoExtractResult
    {
        public string? CustomerName { get; set; }
        public string? ComandaNumber { get; set; }
        public List<ComandaFotoItem> Items { get; set; } = new();
        public decimal Total { get; set; }
        public string? Notes { get; set; }
    }

    public class ComandaFotoSaveRequest
    {
        public string? Label { get; set; }
        public List<ComandaFotoItem> Items { get; set; } = new();
        public string ImageBase64 { get; set; } = string.Empty;
    }

    public class ComandaFotoDto
    {
        public int Id { get; set; }
        public string Label { get; set; } = string.Empty;
        public decimal Total { get; set; }
        public DateTime CreatedAt { get; set; }
        public List<ComandaFotoItem> Items { get; set; } = new();
    }

    public class ComandaFotoReport
    {
        public string EventName { get; set; } = string.Empty;
        public DateTime EventDate { get; set; }
        public string Build { get; set; } = string.Empty;
        public int Count { get; set; }
        public decimal GrandTotal { get; set; }
        public List<ComandaFotoItem> ItemTotals { get; set; } = new();
        public List<ComandaFotoDto> Comandas { get; set; } = new();
    }

    public class ComandaFotoMenuRequest
    {
        public string? Name { get; set; }
        public decimal UnitPrice { get; set; }
    }

    public class ComandaFotoOptions
    {
        public const string SectionName = "GoogleAI";
        public string ApiKey { get; set; } = string.Empty;
        public string Model { get; set; } = "gemini-3-flash-preview";
    }
}

namespace Batuara.Application.Bingo.Services
{
    using Batuara.Application.Bingo.Models;

    public interface IComandaFotoService
    {
        bool IsTokenValid(string? token);
        string GetAccessToken();
        Task<ComandaFotoExtractResult> ExtractAsync(ComandaFotoExtractRequest request, CancellationToken ct);
        Task<ComandaFotoItem> RegisterMenuItemAsync(ComandaFotoMenuRequest request, CancellationToken ct);
        Task<ComandaFotoDto> SaveAsync(ComandaFotoSaveRequest request, CancellationToken ct);
        Task<ComandaFotoReport> GetReportAsync(CancellationToken ct);
        Task<(byte[] Data, string ContentType)?> GetPhotoAsync(int id, CancellationToken ct);
        Task DiscardAsync(int id, CancellationToken ct);
    }
}
