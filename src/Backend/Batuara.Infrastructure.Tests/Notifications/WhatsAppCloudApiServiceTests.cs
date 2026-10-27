using System;
using System.Linq;
using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;
using System.Net;
using System.Text.Json;
using Batuara.Infrastructure.Notifications;
using FluentAssertions;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.Extensions.Options;
using Xunit;

namespace Batuara.Infrastructure.Tests.Notifications
{
    public class WhatsAppCloudApiServiceTests
    {
        private class CapturingHandler : HttpMessageHandler
        {
            public string? Body { get; private set; }

            protected override async Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
            {
                Body = await request.Content!.ReadAsStringAsync(cancellationToken);
                return new HttpResponseMessage(HttpStatusCode.OK)
                {
                    Content = new StringContent("{\"messages\":[{\"id\":\"wamid.test\"}]}")
                };
            }
        }

        private static (WhatsAppCloudApiService Service, CapturingHandler Handler) CreateService(bool enabled = true)
        {
            var handler = new CapturingHandler();
            var options = Options.Create(new WhatsAppCloudApiOptions
            {
                Enabled = enabled,
                AccessToken = "token",
                PhoneNumberId = "123",
                AllowedRecipients = ["5511999999999"]
            });
            var client = new HttpClient(handler) { BaseAddress = new Uri("https://graph.test/v21.0/") };
            return (new WhatsAppCloudApiService(client, options, NullLogger<WhatsAppCloudApiService>.Instance), handler);
        }

        private static (string Name, string[] Params) Parse(string body)
        {
            using var doc = JsonDocument.Parse(body);
            var template = doc.RootElement.GetProperty("template");
            var parameters = template.GetProperty("components")[0].GetProperty("parameters")
                .EnumerateArray().Select(p => p.GetProperty("text").GetString()!).ToArray();
            return (template.GetProperty("name").GetString()!, parameters);
        }

        [Fact]
        public async Task SendBirthdayGreeting_UsesFirstNameOnly()
        {
            var (service, handler) = CreateService();
            await service.SendBirthdayGreetingAsync("11999999999", "Maria da Silva");
            var (name, parameters) = Parse(handler.Body!);
            name.Should().Be("casa_aniversario");
            parameters.Should().Equal("Maria");
        }

        [Fact]
        public async Task SendEventInvite_SendsNameEventAndDate()
        {
            var (service, handler) = CreateService();
            await service.SendEventInviteAsync("11999999999", "João Souza", "Gira de Caboclos", "15/11/2026");
            var (name, parameters) = Parse(handler.Body!);
            name.Should().Be("casa_evento_convite");
            parameters.Should().Equal("João", "Gira de Caboclos", "15/11/2026");
        }

        [Fact]
        public async Task SendMemberNotice_FlattensLineBreaksAndExtraSpaces()
        {
            var (service, handler) = CreateService();
            await service.SendMemberNoticeAsync("11999999999", "Ana Lima", "Site no ar.\n\nAcesse   agora.");
            var (name, parameters) = Parse(handler.Body!);
            name.Should().Be("casa_aviso_filho");
            parameters.Should().Equal("Ana", "Site no ar. Acesse agora.");
        }

        [Fact]
        public async Task SendSiteTutorialLink_SendsNameAndUrl()
        {
            var (service, handler) = CreateService();
            await service.SendSiteTutorialLinkAsync("11999999999", "Pedro", "https://www.batuara.org.br/tutorial.html");
            var (name, parameters) = Parse(handler.Body!);
            name.Should().Be("casa_tutorial_site");
            parameters.Should().Equal("Pedro", "https://www.batuara.org.br/tutorial.html");
        }

        [Fact]
        public async Task SendMemberNotice_WhenDisabled_DoesNotCallApi()
        {
            var (service, handler) = CreateService(enabled: false);
            var act = () => service.SendMemberNoticeAsync("11999999999", "Ana", "Aviso");
            await act.Should().ThrowAsync<InvalidOperationException>();
            handler.Body.Should().BeNull();
        }
    }
}
