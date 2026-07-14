using System;
using System.Net;
using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;
using Batuara.Application.ContactMessages.Models;
using Batuara.Application.Notifications.Services;
using Batuara.Domain.Enums;
using Batuara.Infrastructure.ContactMessages.Services;
using Batuara.Infrastructure.Data;
using Batuara.Infrastructure.Notifications;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.Extensions.Options;
using Xunit;

namespace Batuara.Infrastructure.Tests.ContactMessages
{
    public class ContactMessageServiceTests
    {
        private class FakeWhatsAppService : IWhatsAppService
        {
            public string? LastPhone { get; private set; }
            public string? LastResponse { get; private set; }
            public Exception? ExceptionToThrow { get; set; }

            public Task SendAuthCodeAsync(string phoneE164, string code, CancellationToken cancellationToken = default) => Task.CompletedTask;
            public Task SendContributionReminderAsync(string phoneE164, string memberName, DateTime dueDate, decimal amount, CancellationToken cancellationToken = default) => Task.CompletedTask;

            public Task SendContactResponseAsync(string phoneE164, string responseText, CancellationToken cancellationToken = default)
            {
                if (ExceptionToThrow != null)
                {
                    throw ExceptionToThrow;
                }

                LastPhone = phoneE164;
                LastResponse = responseText;
                return Task.CompletedTask;
            }
        }

        private class CapturingHandler : HttpMessageHandler
        {
            public string? RequestBody { get; private set; }

            protected override async Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
            {
                RequestBody = request.Content == null ? null : await request.Content.ReadAsStringAsync(cancellationToken);
                return new HttpResponseMessage(HttpStatusCode.OK);
            }
        }

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
            var service = new ContactMessageService(db, new FakeWhatsAppService());

            var (created, errors, conflict) = await service.CreatePublicAsync(new CreateContactMessageRequest
            {
                Name = "Visitante",
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

        [Fact]
        public async Task SendWhatsAppResponse_Should_Send_And_Mark_As_Resolved()
        {
            var db = CreateInMemoryDb();
            var whatsApp = new FakeWhatsAppService();
            var service = new ContactMessageService(db, whatsApp);

            var (created, _, _) = await service.CreatePublicAsync(new CreateContactMessageRequest
            {
                Name = "Visitante",
                Subject = "Contato",
                Message = "Gostaria de resposta por WhatsApp.",
                Phone = "11999999999",
                WantsWhatsAppResponse = true
            });

            var (updated, errors) = await service.SendWhatsAppResponseAsync(created!.Id, new SendContactWhatsAppResponseRequest
            {
                ResponseText = "Obrigado pelo contato."
            });

            errors.Should().BeEmpty();
            updated!.Status.Should().Be(ContactMessageStatus.Resolved);
            updated.IsRead.Should().BeTrue();
            updated.WhatsAppResponseSentAt.Should().NotBeNull();
            whatsApp.LastPhone.Should().Be("11999999999");
            whatsApp.LastResponse.Should().Be("Obrigado pelo contato.");
        }

        [Fact]
        public async Task SendWhatsAppResponse_Should_Not_Mark_As_Resolved_When_WhatsApp_Is_Disabled()
        {
            var db = CreateInMemoryDb();
            var whatsApp = new FakeWhatsAppService
            {
                ExceptionToThrow = new InvalidOperationException("Envio de WhatsApp está desabilitado neste ambiente.")
            };
            var service = new ContactMessageService(db, whatsApp);

            var (created, _, _) = await service.CreatePublicAsync(new CreateContactMessageRequest
            {
                Name = "Visitante",
                Subject = "Contato",
                Message = "Gostaria de resposta por WhatsApp.",
                Phone = "11999999999",
                WantsWhatsAppResponse = true
            });

            var (updated, errors) = await service.SendWhatsAppResponseAsync(created!.Id, new SendContactWhatsAppResponseRequest
            {
                ResponseText = "Obrigado pelo contato."
            });

            updated.Should().BeNull();
            errors.Should().ContainSingle("Envio de WhatsApp está desabilitado neste ambiente.");

            var persisted = await db.ContactMessages.SingleAsync(x => x.Id == created.Id);
            persisted.Status.Should().Be(ContactMessageStatus.New);
            persisted.IsRead.Should().BeFalse();
            persisted.WhatsAppResponseSentAt.Should().BeNull();
            persisted.WhatsAppResponseText.Should().BeNull();
        }

        [Fact]
        public async Task SendWhatsAppResponse_Should_Allow_Brazil_Number_With_Or_Without_Country_Code()
        {
            var db = CreateInMemoryDb();
            var handler = new CapturingHandler();
            var whatsApp = new EvolutionApiWhatsAppService(
                new HttpClient(handler) { BaseAddress = new Uri("http://localhost/") },
                Options.Create(new EvolutionApiWhatsAppOptions
                {
                    Enabled = true,
                    BaseUrl = "http://localhost/",
                    ApiKey = "test-key",
                    InstanceName = "batuara-casa",
                    AllowedRecipients = new[] { "5511975747470" }
                }),
                NullLogger<EvolutionApiWhatsAppService>.Instance);
            var service = new ContactMessageService(db, whatsApp);

            var (created, _, _) = await service.CreatePublicAsync(new CreateContactMessageRequest
            {
                Name = "Visitante",
                Subject = "Contato",
                Message = "Gostaria de resposta por WhatsApp.",
                Phone = "11975747470",
                WantsWhatsAppResponse = true
            });

            var (updated, errors) = await service.SendWhatsAppResponseAsync(created!.Id, new SendContactWhatsAppResponseRequest
            {
                ResponseText = "Obrigado pelo contato."
            });

            errors.Should().BeEmpty();
            updated.Should().NotBeNull();
            updated!.Status.Should().Be(ContactMessageStatus.Resolved);
            updated.WhatsAppResponseSentAt.Should().NotBeNull();
            handler.RequestBody.Should().Contain("5511975747470");
        }
    }
}
