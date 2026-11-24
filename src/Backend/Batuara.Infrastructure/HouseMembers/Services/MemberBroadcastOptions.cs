namespace Batuara.Infrastructure.HouseMembers.Services
{
    public class MemberBroadcastOptions
    {
        public string TutorialUrl { get; set; } = "https://www.batuara.org.br/tutorial.html";
        public string SiteLaunchNotice { get; set; } = "O site da Casa já está no ar! Acesse batuara.org.br, entre com o código que você vai receber aqui pelo WhatsApp e atualize seus dados cadastrais.";
        public int SendIntervalMs { get; set; } = 300;
    }
}
