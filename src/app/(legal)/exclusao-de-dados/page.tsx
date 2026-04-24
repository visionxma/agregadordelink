import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Exclusão de Conta e Dados · LinkBio BR",
  description:
    "Procedimentos, prazos e limites aplicáveis à solicitação de eliminação de dados pessoais na LinkBio BR, conforme a LGPD.",
};

export default function ExclusaoPage() {
  return (
    <>
      <h1>Política de Exclusão de Conta e Dados</h1>
      <div className="meta">
        <strong>Última atualização:</strong> 24 de abril de 2026<br />
        <strong>Vigência:</strong> a partir da data de publicação
      </div>

      <h2>Preâmbulo</h2>
      <p>
        A presente <strong>Política de Exclusão de Conta e Dados</strong> detalha os
        procedimentos, prazos e limites aplicáveis à solicitação de eliminação de
        dados pessoais pelos Titulares perante a <strong>LinkBio BR</strong>, nos
        termos do art. 18, incisos IV e VI, da Lei nº 13.709/2018 (LGPD), e
        complementa a Política de Privacidade e os Termos de Uso.
      </p>

      <h2>1. Formas de Solicitar a Exclusão</h2>
      <p>O Titular poderá solicitar a exclusão por quaisquer dos seguintes canais:</p>
      <ol>
        <li>
          <strong>Autoatendimento:</strong> por meio da funcionalidade "Excluir conta"
          disponível em <strong>https://linkbiobr.com/dashboard/account</strong>, após
          autenticação;
        </li>
        <li>
          <strong>E-mail:</strong> mensagem para <strong>visionxma@gmail.com</strong>,
          a partir do e-mail cadastrado, informando de forma clara a solicitação.
        </li>
      </ol>
      <p>
        Para confirmação da identidade e prevenção a fraude, a LinkBio BR poderá
        solicitar informações adicionais, sendo a solicitação <strong>desconsiderada</strong>
        caso o Titular se recuse a fornecê-las ou se identifique divergência relevante.
      </p>

      <h2>2. Dados que Serão Excluídos</h2>
      <p>
        Confirmada e processada a solicitação, serão eliminados, por propagação em cascata:
      </p>
      <ol>
        <li>Dados cadastrais: nome, e-mail, senha criptografada, imagem de avatar;</li>
        <li>Sessões ativas e tokens de autenticação (incluindo tokens OAuth);</li>
        <li>Páginas criadas pelo Usuário, com blocos, temas, integrações e domínios vinculados;</li>
        <li>Links curtos criados pelo Usuário;</li>
        <li>Arquivos de imagem armazenados nos servidores de storage vinculados;</li>
        <li>Eventos de analytics associados às páginas excluídas;</li>
        <li>Inscrições de newsletter capturadas nas páginas do Usuário;</li>
        <li>Submissões de formulários recebidas nas páginas do Usuário;</li>
        <li>Templates publicados na galeria da comunidade;</li>
        <li>Registro de assinatura ativo, com cancelamento automático junto ao gateway de pagamento.</li>
      </ol>
      <div className="highlight">
        A exclusão é <strong>irreversível</strong>. A LinkBio BR não mantém backup de dados
        pessoais restituíveis ao Titular após o processamento da solicitação.
      </div>

      <h2>3. Dados que NÃO Poderão ser Excluídos</h2>
      <p>
        Em observância ao art. 16 da LGPD, <strong>serão retidos</strong> mesmo após a
        solicitação, pelos prazos mínimos legais:
      </p>
      <table>
        <thead>
          <tr>
            <th>Dado</th>
            <th>Base Legal</th>
            <th>Prazo</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Registros de conexão (IP, porta, data, hora)</td>
            <td>Art. 13 da Lei 12.965/2014 (Marco Civil)</td>
            <td>1 ano, prorrogável por ordem judicial</td>
          </tr>
          <tr>
            <td>Logs de acesso a aplicação</td>
            <td>Art. 15 da Lei 12.965/2014</td>
            <td>6 meses</td>
          </tr>
          <tr>
            <td>Documentos fiscais e comprovantes</td>
            <td>Art. 195 do CTN e Decreto 9.295/2018</td>
            <td>5 anos</td>
          </tr>
          <tr>
            <td>Registros contábeis</td>
            <td>Art. 1.194 do Código Civil</td>
            <td>10 anos</td>
          </tr>
          <tr>
            <td>Dados para defesa em processos</td>
            <td>Art. 7º, VI, e art. 16, II, LGPD</td>
            <td>Até trânsito em julgado ou prescrição</td>
          </tr>
          <tr>
            <td>Dados para prevenção de fraude e proteção do crédito</td>
            <td>Art. 7º, IX, e art. 16, III, LGPD</td>
            <td>Conforme finalidade</td>
          </tr>
          <tr>
            <td>Dados anonimizados ou agregados</td>
            <td>Art. 12 LGPD (não são dados pessoais)</td>
            <td>Indeterminado</td>
          </tr>
        </tbody>
      </table>
      <p>
        A retenção é <strong>exigência legal</strong> e independe de consentimento ou
        concordância do Titular.
      </p>

      <h2>4. Dados Coletados por Outros Usuários</h2>
      <p>
        O Titular reconhece que, ao interagir com páginas de outros Usuários (submissão
        de formulários, inscrição em newsletter, contato via WhatsApp), seus dados são
        tratados pelo respectivo Usuário na <strong>qualidade de Controlador</strong>,
        sendo a LinkBio BR <strong>mera Operadora</strong>.
      </p>
      <p>
        Para exercer direitos sobre tais dados, <strong>o Titular deverá dirigir-se
        diretamente ao Usuário</strong> criador da página. A LinkBio BR apenas encaminhará
        solicitações recebidas e somente excluirá tais dados mediante instrução expressa
        do Controlador ou ordem judicial.
      </p>

      <h2>5. Dados Compartilhados com Terceiros</h2>
      <p>
        A LinkBio BR <strong>não possui controle</strong> sobre dados compartilhados com
        operadores externos (Google, Meta, TikTok, Abacate Pay, Resend, Supabase, Vercel,
        entre outros) no curso regular do serviço.
      </p>
      <p>
        Caberá ao Titular solicitar diretamente a exclusão perante cada um desses terceiros,
        observando suas respectivas políticas. A LinkBio BR envidará esforços razoáveis
        para notificar seus Operadores, sem assumir obrigação de resultado.
      </p>

      <h2>6. Prazos de Atendimento</h2>
      <p>
        Recebida a solicitação e confirmada a identidade, a LinkBio BR processará a
        exclusão no <strong>prazo de até 15 (quinze) dias corridos</strong>, podendo
        ser prorrogado por igual período mediante justificativa, nos termos do art. 19
        da LGPD.
      </p>
      <p>
        A exclusão por autoatendimento produz efeitos <strong>imediatos</strong> para os
        dados excluíveis, mantidos em retenção legal apenas aqueles da Cláusula 3.
      </p>

      <h2>7. Consequências da Exclusão</h2>
      <p>Ao solicitar a exclusão, o Titular reconhece e aceita que:</p>
      <ol>
        <li>perderá imediata e definitivamente o acesso à conta e todo o conteúdo associado;</li>
        <li><strong>não haverá restituição</strong> de valores pagos, salvo nas hipóteses legais obrigatórias;</li>
        <li>os slugs (ex.: <em>linkbiobr.com/meu-nome</em>), códigos de links curtos e domínios vinculados ficarão livres para uso por outros Usuários, sem direito a indenização;</li>
        <li>qualquer backup exportado previamente é de exclusiva responsabilidade de guarda do Titular;</li>
        <li>inscritos, submissões e outros dados acumulados serão excluídos sem recuperação.</li>
      </ol>
      <div className="highlight">
        <strong>Recomendação:</strong> a LinkBio BR recomenda enfaticamente que o Usuário
        realize backup e exportação de seus dados previamente ao pedido de exclusão.
      </div>

      <h2>8. Recusa ou Limitação da Exclusão</h2>
      <p>A LinkBio BR poderá <strong>recusar</strong>, total ou parcialmente, pedidos de exclusão quando:</p>
      <ol>
        <li>houver necessidade de cumprimento de obrigação legal ou regulatória;</li>
        <li>houver processo judicial, administrativo ou arbitral em curso ou iminente com a Controladora;</li>
        <li>for necessário ao exercício regular de direitos pela Controladora;</li>
        <li>for para prevenção a fraude, proteção do crédito ou de terceiros;</li>
        <li>houver obrigação contratual não adimplida pelo Titular;</li>
        <li>a solicitação for manifestamente infundada, repetitiva ou abusiva.</li>
      </ol>
      <p>
        Em caso de recusa, o Titular será informado do fundamento, preservado seu
        direito de reclamar à Autoridade Nacional de Proteção de Dados (ANPD).
      </p>

      <h2>9. Exclusão de Ofício pela LinkBio BR</h2>
      <p>
        A LinkBio BR poderá, a <strong>exclusivo critério</strong> e independentemente
        de solicitação, excluir contas em caso de:
      </p>
      <ol>
        <li>inatividade superior a 24 meses em plano gratuito;</li>
        <li>violação destes Termos, da Política de Privacidade ou da legislação;</li>
        <li>ordem judicial ou administrativa;</li>
        <li>descontinuação parcial ou total da Plataforma;</li>
        <li>risco à segurança técnica ou jurídica.</li>
      </ol>
      <p>
        Nessas hipóteses, o Titular será notificado com razoável antecedência no e-mail
        cadastrado, quando possível, sem prejuízo da imediata descontinuidade quando
        a situação exigir resposta urgente.
      </p>

      <h2>10. Direito de Reclamação</h2>
      <p>Em caso de discordância, o Titular poderá apresentar reclamação:</p>
      <ul>
        <li>Internamente, ao Encarregado: <strong>visionxma@gmail.com</strong></li>
        <li>À <strong>Autoridade Nacional de Proteção de Dados (ANPD)</strong>, em www.gov.br/anpd;</li>
        <li>Aos órgãos de defesa do consumidor, quando cabível.</li>
      </ul>

      <h2>11. Alterações desta Política</h2>
      <p>
        A LinkBio BR poderá alterar unilateralmente esta Política a qualquer tempo,
        mediante publicação em <strong>https://linkbiobr.com/exclusao-de-dados</strong>.
      </p>

      <h2>12. Legislação e Foro</h2>
      <p>
        Aplica-se o disposto na Política de Privacidade e nos Termos de Uso, especialmente
        quanto à legislação brasileira e ao foro da comarca da sede da LinkBio BR, com
        renúncia a qualquer outro.
      </p>

      <h2>Contato</h2>
      <p><strong>Encarregado de Dados (DPO):</strong> visionxma@gmail.com</p>
    </>
  );
}
