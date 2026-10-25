import React from 'react';
import { Box, Container, Divider, Link, Typography } from '@mui/material';

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <Box sx={{ mb: 4 }}>
    <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5, color: 'primary.main' }}>
      {title}
    </Typography>
    {children}
  </Box>
);

const P: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Typography variant="body2" sx={{ mb: 1.5, lineHeight: 1.7 }}>
    {children}
  </Typography>
);

const PrivacyPolicyPage: React.FC = () => (
  <Container maxWidth="md" sx={{ py: { xs: 6, md: 10 } }}>
    <Typography variant="h3" component="h1" sx={{ fontWeight: 700, mb: 1, color: 'primary.main' }}>
      Política de Privacidade
    </Typography>
    <Typography variant="body2" sx={{ mb: 5, opacity: 0.7 }}>
      Última atualização: outubro de 2025 · Em conformidade com a Lei nº 13.709/2018 (LGPD)
    </Typography>

    <Section title="1. Quem somos">
      <P>
        A <strong>Casa de Caridade Caboclo Batuara</strong>, localizada na Av. Brigadeiro Faria Lima, 2750 –
        Jardim Cocaia, Guarulhos – SP, CEP 07130-000, é a controladora dos dados pessoais coletados neste site.
      </P>
    </Section>

    <Section title="2. Dados que coletamos">
      <P>
        <strong>Formulário de contato:</strong> nome, telefone, assunto e mensagem, além da sua escolha sobre
        receber resposta pelo WhatsApp.
      </P>
      <P>
        <strong>Mensagem direta pelo WhatsApp:</strong> se você enviar uma mensagem ao número oficial da Casa,
        registramos seu telefone, o nome do seu perfil no WhatsApp e o texto enviado, para que a administração
        possa responder. Mensagens de áudio, imagem e outras mídias não são armazenadas.
      </P>
      <P>
        <strong>Área de filhos da casa:</strong> telefone utilizado para autenticação por código enviado via WhatsApp,
        e dados cadastrais fornecidos pela administração (nome, histórico de participação e contribuições).
      </P>
      <P>
        <strong>Cookies:</strong> utilizamos armazenamento local apenas para manter sua sessão de acesso e registrar
        sua escolha de cookies. Cookies de terceiros (Google Maps) são carregados somente mediante seu consentimento.
      </P>
    </Section>

    <Section title="3. Finalidades e bases legais">
      <P>
        Os dados do formulário de contato são usados exclusivamente para responder à sua solicitação
        (execução de medidas solicitadas pelo titular – Art. 7º, V). Os dados de filhos da casa são usados para
        gestão interna da comunidade e envio de avisos e lembretes autorizados (interesse legítimo e consentimento
        – Art. 7º, I e IX).
      </P>
    </Section>

    <Section title="4. Compartilhamento">
      <P>
        Para envio de mensagens pelo WhatsApp, utilizamos a <strong>Meta Platforms, Inc.</strong> (WhatsApp Business
        Platform), que processa número de telefone e conteúdo das mensagens conforme suas próprias políticas.
        O mapa de localização é fornecido pelo <strong>Google</strong>. Não vendemos nem compartilhamos seus dados
        para fins publicitários.
      </P>
    </Section>

    <Section title="5. Retenção">
      <P>
        Mensagens de contato e histórico de conversas são mantidos pelo tempo necessário ao atendimento e à gestão
        da casa, podendo ser eliminados mediante solicitação do titular, salvo obrigação legal de guarda.
      </P>
    </Section>

    <Section title="6. Seus direitos">
      <P>
        Nos termos do Art. 18 da LGPD, você pode solicitar confirmação, acesso, correção, anonimização,
        portabilidade ou eliminação dos seus dados, bem como revogar consentimentos. Para exercer seus direitos,
        utilize o formulário de contato do site ou compareça à sede da casa em horário de atendimento.
      </P>
    </Section>

    <Section title="7. Segurança">
      <P>
        Adotamos medidas técnicas e organizacionais razoáveis para proteger seus dados, incluindo acesso restrito,
        comunicação criptografada (HTTPS) e armazenamento em infraestrutura controlada.
      </P>
    </Section>

    <Divider sx={{ my: 4 }} />

    <Typography variant="body2" sx={{ opacity: 0.7 }}>
      Dúvidas sobre esta política? Fale conosco pela{' '}
      <Link href="/#contato" underline="hover">
        página de contato
      </Link>
      .
    </Typography>
  </Container>
);

export default PrivacyPolicyPage;
