namespace Batuara.Application.Common.Models
{
    public class PaginatedResponse<T>
    {
        public required IReadOnlyList<T> Data { get; set; }
        public required int TotalCount { get; set; }
        public required int PageNumber { get; set; }
        public required int PageSize { get; set; }
        public required int TotalPages { get; set; }
    }
}
