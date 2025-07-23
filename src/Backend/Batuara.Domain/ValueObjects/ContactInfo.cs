using System;
using System.Text.RegularExpressions;

namespace Batuara.Domain.ValueObjects
{
    public class ContactInfo : IEquatable<ContactInfo>
    {
        public string Address { get; private set; }
        public string Email { get; private set; }
        public string Phone { get; private set; }
        public string Instagram { get; private set; }

        private ContactInfo() 
        { 
            // For EF Core
            Address = string.Empty;
            Email = string.Empty;
            Phone = string.Empty;
            Instagram = string.Empty;
        }

        public ContactInfo(string address, string email, string phone, string instagram)
        {
            ValidateContactInfo(address, email, phone, instagram);
            
            Address = address;
            Email = email.ToLowerInvariant();
            Phone = phone;
            Instagram = instagram;
        }

        private static void ValidateContactInfo(string address, string email, string phone, string instagram)
        {
            if (string.IsNullOrWhiteSpace(address))
                throw new ArgumentException("Address cannot be empty", nameof(address));

            if (string.IsNullOrWhiteSpace(email))
                throw new ArgumentException("Email cannot be empty", nameof(email));

            if (!IsValidEmail(email))
                throw new ArgumentException("Invalid email format", nameof(email));

            if (string.IsNullOrWhiteSpace(phone))
                throw new ArgumentException("Phone cannot be empty", nameof(phone));

            if (!string.IsNullOrWhiteSpace(instagram) && !IsValidInstagram(instagram))
                throw new ArgumentException("Invalid Instagram handle", nameof(instagram));
        }

        private static bool IsValidEmail(string email)
        {
            const string emailPattern = @"^[^@\s]+@[^@\s]+\.[^@\s]+$";
            return Regex.IsMatch(email, emailPattern, RegexOptions.IgnoreCase);
        }

        private static bool IsValidInstagram(string instagram)
        {
            // Instagram usernames can contain letters, numbers, periods, and underscores
            const string instagramPattern = @"^[a-zA-Z0-9._]+$";
            return Regex.IsMatch(instagram, instagramPattern) && instagram.Length <= 30;
        }

        public bool Equals(ContactInfo? other)
        {
            if (other is null) return false;
            if (ReferenceEquals(this, other)) return true;
            return Address == other.Address && 
                   Email == other.Email && 
                   Phone == other.Phone && 
                   Instagram == other.Instagram;
        }

        public override bool Equals(object? obj)
        {
            return Equals(obj as ContactInfo);
        }

        public override int GetHashCode()
        {
            return HashCode.Combine(Address, Email, Phone, Instagram);
        }

        public static bool operator ==(ContactInfo? left, ContactInfo? right)
        {
            return Equals(left, right);
        }

        public static bool operator !=(ContactInfo? left, ContactInfo? right)
        {
            return !Equals(left, right);
        }
    }
}