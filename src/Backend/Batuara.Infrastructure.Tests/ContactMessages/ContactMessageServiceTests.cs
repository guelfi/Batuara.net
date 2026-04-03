using System;
using System.Threading.Tasks;
using Batuara.Application.ContactMessages.Models;
using Batuara.Domain.Enums;
using Batuara.Infrastructure.ContactMessages.Services;
using Batuara.Infrastructure.Data;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Batuara.Infrastructure.Tests.ContactMessages
{
    public class ContactMessageServiceTests
    {
        private static BatuaraDbContext CreateInMemoryDb()
        {
            var options = new DbContextOptionsBuilder<BatuaraDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;

            return new BatuaraDbContext(options);
        }

        [Fact]
        public async Task Create_And_UpdateStatus_Should_Succeed()
        {
            var db = CreateInMemoryDb();
            var service = new ContactMessageService(db);

            var (created, errors, conflict) = await service.CreatePublicAsync(new CreateContactMessageRequest
            {
                Name = "Visitante",
                Email = "visitante@exemplo.com",
                Subject = "Agendamento",
                Message = "Gostaria de saber o horário de atendimento.",
                Phone = "11999999999"
            });

            conflict.Should().BeFalse();
            errors.Should().BeEmpty();
            created.Should().NotBeNull();

            var (updated, updateErrors) = await service.UpdateStatusAsync(created!.Id, new UpdateContactMessageStatusRequest
            {
                Status = ContactMessageStatus.InProgress,
                AdminNotes = "Retorno agendado por telefone."
            });

            updateErrors.Should().BeEmpty();
            updated.Should().NotBeNull();
            updated!.Status.Should().Be(ContactMessageStatus.InProgress);
            updated.AdminNotes.Should().Be("Retorno agendado por telefone.");
        }
    }
}
