using Batuara.Domain.Common;
using Batuara.Domain.Enums;

namespace Batuara.Domain.Entities
{
    public class BingoEvent : BaseEntity
    {
        public string Name { get; private set; } = string.Empty;
        public DateTime EventDate { get; private set; }
        public BingoEventStatus Status { get; private set; } = BingoEventStatus.Draft;
        public bool IsTest { get; private set; }
        public bool CloseAllRequested { get; private set; }
        public DateTime? OpenedAt { get; private set; }
        public DateTime? ClosedAt { get; private set; }

        private BingoEvent()
        {
        }

        public BingoEvent(string name, DateTime eventDate, bool isTest = false)
        {
            if (string.IsNullOrWhiteSpace(name))
            {
                throw new ArgumentException("O nome do evento é obrigatório.", nameof(name));
            }

            Name = name.Trim();
            EventDate = eventDate;
            IsTest = isTest;
        }

        public bool IsOpen => Status == BingoEventStatus.Open;

        public void Open(DateTime utcNow)
        {
            Status = BingoEventStatus.Open;
            OpenedAt = utcNow;
            UpdateTimestamp();
        }

        public void Close(DateTime utcNow)
        {
            Status = BingoEventStatus.Closed;
            ClosedAt = utcNow;
            UpdateTimestamp();
        }

        public void Reopen()
        {
            Status = BingoEventStatus.Open;
            ClosedAt = null;
            UpdateTimestamp();
        }

        public void Suspend()
        {
            Status = BingoEventStatus.Suspended;
            UpdateTimestamp();
        }

        public void Resume()
        {
            Status = BingoEventStatus.Open;
            UpdateTimestamp();
        }

        public void SetCloseAllRequested(bool value)
        {
            CloseAllRequested = value;
            UpdateTimestamp();
        }
    }
}
