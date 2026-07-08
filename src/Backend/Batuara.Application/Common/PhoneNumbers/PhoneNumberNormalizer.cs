namespace Batuara.Application.Common.PhoneNumbers
{
    public static class PhoneNumberNormalizer
    {
        public static string NormalizeBrazilMobile(string phone)
        {
            var digits = new string((phone ?? string.Empty).Where(char.IsDigit).ToArray());

            if (digits.StartsWith("55", StringComparison.Ordinal) && digits.Length >= 12)
            {
                return digits;
            }

            if (digits.Length is 10 or 11)
            {
                return "55" + digits;
            }

            return digits;
        }
    }
}
