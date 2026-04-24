import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Privacidade · LinkBio BR",
  description:
    "Saiba como a LinkBio BR coleta, trata e protege seus dados pessoais em conformidade com a LGPD e o Marco Civil da Internet.",
};

export default function PrivacidadePage() {
  return (
    <>
      <h1>Política de Privacidade</h1>
      <div className="meta">
        <strong>Última atualização:</strong> 24 de abril de 2026<br />
        <strong>Vigência:</strong> a partir da data de publicação
      </div>

      <h2>Preâmbulo</h2>
      <p>
        A presente <strong>Política de Privacidade</strong> ("Política") descreve como
        a <strong>LinkBio BR</strong>, doravante designada apenas como
        "LinkBio BR", "Plataforma" ou "Controladora", realiza o tratamento de
        dados pessoais dos usuários e visitantes da plataforma disponível em
        <strong> https://linkbiobr.com</strong> e seus subdomínios, nos termos da
        Lei nº 13.709/2018 (LGPD), da Lei nº 12.965/2014 (Marco Civil da
        Internet) e demais normas aplicáveis.
      </p>
      <p>
        Ao utilizar a Plataforma, o Titular manifesta seu <strong>consentimento
        livre, informado e inequívoco</strong> com os termos desta Política,
        reconhecendo tê-la lido integralmente e compreendido suas disposições.
      </p>

      <h2>1. Definições</h2>
      <p>Para os fins desta Política, aplicam-se as seguintes definições:</p>
      <ul>
        <li><strong>Titular:</strong> pessoa natural a quem se referem os dados pessoais tratados;</li>
        <li><strong>Usuário:</strong> pessoa natural ou jurídica que se cadastra e utiliza as funcionalidades da Plataforma, seja em plano gratuito ou pago;</li>
        <li><strong>Visitante:</strong> pessoa natural que acessa páginas públicas criadas por Usuários, sem necessariamente possuir conta;</li>
        <li><strong>Dados Pessoais:</strong> toda informação relacionada a pessoa natural identificada ou identificável;</li>
        <li><strong>Tratamento:</strong> toda operação realizada com dados pessoais, conforme art. 5º, X, da LGPD;</li>
        <li><strong>Controladora:</strong> a LinkBio BR, responsável pelas decisões sobre o tratamento;</li>
        <li><strong>Operador:</strong> terceiro que realiza tratamento em nome da Controladora;</li>
        <li><strong>Cookies:</strong> arquivos de pequeno porte armazenados no navegador para permitir funcionalidades e análise de uso.</li>
      </ul>

      <h2>2. Dados Pessoais Coletados</h2>

      <h3>2.1. Dados fornecidos pelo Usuário</h3>
      <p>No cadastro e uso da Plataforma, são coletados:</p>
      <ul>
        <li>Nome completo ou nome de exibição;</li>
        <li>Endereço de e-mail;</li>
        <li>Senha (armazenada exclusivamente em formato criptografado, hash unidirecional);</li>
        <li>Imagem de avatar e capa (opcionais);</li>
        <li>Biografia, descrição e textos inseridos nas páginas;</li>
        <li>Número de telefone, quando voluntariamente informado em blocos de WhatsApp;</li>
        <li>Conteúdo de links, textos, imagens e demais materiais publicados pelo Usuário.</li>
      </ul>

      <h3>2.2. Dados via autenticação com terceiros (Google OAuth)</h3>
      <p>
        Caso o Usuário opte pela autenticação via Google, são recebidos: identificador
        único do Google, e-mail, nome e URL de imagem de perfil, além de tokens OAuth
        armazenados de forma restrita.
      </p>

      <h3>2.3. Dados coletados automaticamente</h3>
      <p>Durante o acesso à Plataforma e páginas públicas, são coletados:</p>
      <ul>
        <li>Endereço IP;</li>
        <li>User-agent (identificação do navegador e dispositivo);</li>
        <li>Sistema operacional;</li>
        <li>País de origem, inferido por geolocalização aproximada de IP;</li>
        <li>Página de origem (referrer);</li>
        <li>Data, hora e duração do acesso;</li>
        <li>Páginas visitadas e cliques em blocos;</li>
        <li>Registros de sessão, nos termos do art. 15 do Marco Civil da Internet.</li>
      </ul>

      <h3>2.4. Dados de pagamento</h3>
      <p>Para planos pagos, são tratados:</p>
      <ul>
        <li>Identificador de cliente e assinatura no gateway de pagamento (Abacate Pay);</li>
        <li>Status de cobrança, data de renovação e cancelamento;</li>
        <li>Histórico de cobranças.</li>
      </ul>
      <div className="highlight">
        <strong>Importante:</strong> dados de cartão de crédito, débito, PIX ou quaisquer instrumentos de
        pagamento <strong>NÃO são coletados, armazenados ou processados pela LinkBio BR</strong>.
        Tais informações são tratadas exclusivamente pelo gateway de pagamento, em
        ambiente certificado PCI-DSS de responsabilidade do respectivo operador.
      </div>

      <h3>2.5. Dados de Visitantes coletados pelo Usuário</h3>
      <p>
        A Plataforma permite que Usuários criem blocos de formulário, newsletter e
        outros mecanismos de coleta de dados de terceiros. Os dados assim coletados
        são armazenados pela LinkBio BR na <strong>qualidade de Operadora</strong>, em
        nome do Usuário criador da página, sendo este o <strong>Controlador</strong> perante os Visitantes,
        nos termos do art. 5º, VI e VII, da LGPD.
      </p>

      <h3>2.6. Dados que NÃO são coletados</h3>
      <p>
        A LinkBio BR <strong>não coleta</strong> dados pessoais sensíveis definidos no
        art. 5º, II, da LGPD (origem racial, convicção religiosa, opinião política,
        dado referente à saúde, sexual, biométrico, etc.), exceto quando voluntariamente
        inseridos pelo próprio Usuário em campos de texto livre, caso em que a
        responsabilidade pela licitude do tratamento recai integralmente sobre o Usuário.
      </p>

      <h2>3. Finalidades e Bases Legais do Tratamento</h2>
      <p>Cada tratamento é realizado com base em uma ou mais hipóteses dos arts. 7º e 11 da LGPD:</p>
      <table>
        <thead>
          <tr><th>Finalidade</th><th>Base Legal (LGPD)</th></tr>
        </thead>
        <tbody>
          <tr><td>Criação e manutenção da conta</td><td>Execução de contrato (art. 7º, V)</td></tr>
          <tr><td>Autenticação, login e proteção antifraude</td><td>Legítimo interesse (art. 7º, IX)</td></tr>
          <tr><td>Registro de logs de sessão (IP, user-agent)</td><td>Obrigação legal (art. 7º, II c/c art. 15 Marco Civil)</td></tr>
          <tr><td>Processamento de pagamentos</td><td>Execução de contrato (art. 7º, V)</td></tr>
          <tr><td>E-mails transacionais (verificação, reset, cobrança)</td><td>Execução de contrato (art. 7º, V)</td></tr>
          <tr><td>Analytics, mensuração e melhoria</td><td>Legítimo interesse (art. 7º, IX)</td></tr>
          <tr><td>Marketing direto, promoções e ofertas</td><td>Consentimento (art. 7º, I)</td></tr>
          <tr><td>Exibição de publicidade em páginas de redirecionamento</td><td>Legítimo interesse e consentimento</td></tr>
          <tr><td>Obrigações legais, fiscais e regulatórias</td><td>Obrigação legal (art. 7º, II)</td></tr>
          <tr><td>Exercício de direitos em processos</td><td>Art. 7º, VI</td></tr>
          <tr><td>Proteção do crédito e prevenção a fraudes</td><td>Legítimo interesse (art. 7º, IX)</td></tr>
        </tbody>
      </table>
      <p>
        A LinkBio BR reserva-se o direito de utilizar os dados coletados, de forma
        agregada, anonimizada ou pseudonimizada, para fins estatísticos, de pesquisa,
        desenvolvimento de novas funcionalidades, treinamento de sistemas internos e
        aprimoramento da experiência do Usuário, sem necessidade de novo consentimento,
        observados os limites do art. 12 da LGPD.
      </p>

      <h2>4. Compartilhamento de Dados com Terceiros</h2>
      <p>A LinkBio BR poderá compartilhar dados com as seguintes categorias de terceiros:</p>
      <table>
        <thead>
          <tr><th>Categoria</th><th>Finalidade</th><th>Exemplos</th></tr>
        </thead>
        <tbody>
          <tr><td>Processadores de pagamento</td><td>Cobrança de assinaturas</td><td>Abacate Pay</td></tr>
          <tr><td>Infraestrutura</td><td>Hospedagem e storage</td><td>Vercel, Supabase</td></tr>
          <tr><td>E-mail transacional</td><td>Mensagens de sistema</td><td>Resend</td></tr>
          <tr><td>Autenticação</td><td>Login social</td><td>Google LLC</td></tr>
          <tr><td>Publicidade</td><td>Anúncios em páginas de redirecionamento</td><td>Google AdSense</td></tr>
          <tr><td>Analytics e pixels</td><td>Mensuração quando habilitados pelo Usuário</td><td>Google Analytics, Meta, TikTok, GTM</td></tr>
          <tr><td>Autoridades competentes</td><td>Ordem judicial ou requisição legal</td><td>Poder Judiciário, MP, Fisco</td></tr>
          <tr><td>Consultores e assessores</td><td>Defesa dos interesses da Controladora</td><td>Advogados, auditores</td></tr>
          <tr><td>Sucessores societários</td><td>Continuidade do negócio</td><td>Fusão, cisão, aquisição</td></tr>
        </tbody>
      </table>
      <p>
        Alguns operadores estão localizados fora do território nacional. A
        transferência internacional observa o art. 33 da LGPD.
      </p>
      <div className="highlight">
        A LinkBio BR <strong>não se responsabiliza</strong> pelo tratamento de dados realizado
        por terceiros após o compartilhamento autorizado, sendo cada operador responsável
        pelo cumprimento de sua política de privacidade. A LinkBio BR <strong>jamais vende
        dados pessoais</strong> a terceiros.
      </div>

      <h2>5. Cookies e Tecnologias Similares</h2>
      <p>A Plataforma utiliza cookies com as seguintes finalidades:</p>
      <ul>
        <li><strong>Estritamente necessários:</strong> autenticação, manutenção de sessão, segurança. Não exigem consentimento.</li>
        <li><strong>Desempenho e analytics:</strong> mensuração anônima, identificação de falhas, melhoria.</li>
        <li><strong>Publicidade e marketing:</strong> anúncios, inclusive na tela intersticial do encurtador (Google AdSense), e pixels habilitados pelo Usuário.</li>
      </ul>
      <p>
        O Visitante pode gerenciar cookies nas configurações do navegador. A desativação
        de cookies essenciais pode impedir o funcionamento da Plataforma. O Usuário que
        habilitar pixels de terceiros assume <strong>integralmente</strong> a responsabilidade
        pelo cumprimento das obrigações de informação e consentimento.
      </p>

      <h2>6. Armazenamento e Segurança</h2>
      <p>
        Os dados são armazenados em servidores com controles técnicos adequados,
        incluindo criptografia em trânsito (TLS), criptografia de senhas em repouso,
        controle de acesso, logs de auditoria e backups periódicos.
      </p>
      <div className="highlight">
        <strong>Nenhum sistema é absolutamente seguro.</strong> A LinkBio BR adota as melhores
        práticas, porém <strong>não garante inviolabilidade absoluta</strong> de seus sistemas.
        O Usuário exime a LinkBio BR de responsabilidade por incidentes decorrentes de:
      </div>
      <ol>
        <li>ataques cibernéticos, invasões ou fraudes de terceiros;</li>
        <li>falhas em serviços de terceiros (operadores, gateways, provedores de nuvem);</li>
        <li>divulgação negligente de credenciais pelo próprio Usuário;</li>
        <li>senhas fracas, reutilizadas ou compartilhadas;</li>
        <li>dispositivos do Usuário comprometidos;</li>
        <li>caso fortuito ou força maior.</li>
      </ol>
      <p>
        Em caso de incidente relevante, a LinkBio BR comunicará o ocorrido à ANPD
        e aos Titulares afetados, na forma do art. 48 da LGPD.
      </p>

      <h2>7. Prazos de Retenção</h2>
      <table>
        <thead>
          <tr><th>Categoria</th><th>Prazo Mínimo</th></tr>
        </thead>
        <tbody>
          <tr><td>Dados cadastrais</td><td>Enquanto durar a conta ativa</td></tr>
          <tr><td>Logs de sessão e conexão (IP, user-agent)</td><td>6 meses (art. 15 Marco Civil)</td></tr>
          <tr><td>Registros de pagamento e faturamento</td><td>5 anos (fins fiscais)</td></tr>
          <tr><td>Eventos de analytics</td><td>Até 24 meses, podendo ser anonimizados antes</td></tr>
          <tr><td>Dados de formulários do Usuário</td><td>Enquanto a página existir, sob responsabilidade do Usuário</td></tr>
          <tr><td>Inscrições em newsletter</td><td>Enquanto o inscrito não solicitar remoção</td></tr>
          <tr><td>Defesa em processos</td><td>Até trânsito em julgado ou prescrição</td></tr>
        </tbody>
      </table>

      <h2>8. Direitos do Titular</h2>
      <p>Com base no art. 18 da LGPD, o Titular pode exercer:</p>
      <ol>
        <li>confirmação da existência de tratamento;</li>
        <li>acesso aos dados;</li>
        <li>correção de dados incompletos, inexatos ou desatualizados;</li>
        <li>anonimização, bloqueio ou eliminação de dados desnecessários ou em desconformidade;</li>
        <li>portabilidade a outro fornecedor, observados os segredos comercial e industrial;</li>
        <li>eliminação de dados tratados com consentimento;</li>
        <li>informação sobre entidades com as quais houve compartilhamento;</li>
        <li>informação sobre a possibilidade de não consentir;</li>
        <li>revogação do consentimento.</li>
      </ol>
      <p>
        As solicitações devem ser encaminhadas ao Encarregado pelo e-mail
        <strong> visionxma@gmail.com</strong>, com comprovação de identidade.
      </p>
      <p>A LinkBio BR poderá negar, justificadamente, pedidos que:</p>
      <ol>
        <li>contrariem obrigações legais ou regulatórias;</li>
        <li>violem segredo comercial ou industrial;</li>
        <li>exijam esforço técnico desproporcional;</li>
        <li>comprometam a defesa em processo em curso ou iminente;</li>
        <li>sejam manifestamente infundados, abusivos ou repetitivos.</li>
      </ol>

      <h2>9. Encarregado de Dados (DPO)</h2>
      <p>Nos termos do art. 41 da LGPD:</p>
      <ul>
        <li><strong>E-mail:</strong> visionxma@gmail.com</li>
      </ul>

      <h2>10. Dados de Crianças e Adolescentes</h2>
      <p>
        A Plataforma é destinada exclusivamente a pessoas com <strong>18 (dezoito) anos
        ou mais</strong>. Menores somente poderão utilizá-la mediante consentimento
        específico de pelo menos um dos pais ou responsável legal, nos termos do
        art. 14 da LGPD. Identificado tratamento indevido, a LinkBio BR procederá
        à exclusão imediata.
      </p>

      <h2>11. Alterações desta Política</h2>
      <p>
        A LinkBio BR poderá modificar unilateralmente esta Política a qualquer tempo,
        mediante publicação em https://linkbiobr.com/privacidade. O uso continuado
        da Plataforma implica aceitação automática das novas condições.
      </p>

      <h2>12. Legislação e Foro</h2>
      <p>
        Esta Política é regida pelas leis da República Federativa do Brasil, ficando
        eleito o foro da comarca da sede da LinkBio BR, com renúncia a qualquer outro,
        por mais privilegiado que seja.
      </p>

      <h2>Contato</h2>
      <p><strong>Encarregado de Dados:</strong> visionxma@gmail.com</p>
    </>
  );
}
