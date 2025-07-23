namespace Batuara.Application.Auth.Services
{
    public interface IPasswordService
    {
        string HashPassword(string password);
        bool VerifyPassword(string password, string passwordHash);
        bool ValidatePasswordStrength(string password);
    }
}