import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Termos de Uso",
  description:
    "Termos de Uso do LinkBio — condições de cadastro, responsabilidades, limitação de responsabilidade e uso aceitável.",
  alternates: { canonical: "https://linkbiobr.com/termos" },
};

export default function TermosPage() {
  return (
    <>
      <h1>Termos de Uso</h1>
      <div className="meta">
        <strong>Última atualização:</strong> 24 de abril de 2026<br />
        <strong>Vigência:</strong> a partir da data de publicação
      </div>

      <h2>Preâmbulo</h2>
      <p>
        Os presentes <strong>Termos de Uso</strong> ("Termos") constituem contrato
        celebrado entre <strong>LinkBio BR</strong> (doravante "LinkBio BR" ou
        "Plataforma") e o Usuário que acessa, cadastra-se ou utiliza a plataforma
        disponível em <strong>https://linkbiobr.com</strong>.
      </p>
      <div className="highlight">
        <strong>AO CLICAR EM "CADASTRAR", "ACEITAR" OU AO UTILIZAR A PLATAFORMA, O
        USUÁRIO DECLARA TER LIDO, COMPREENDIDO E CONCORDADO INTEGRALMENTE COM ESTES
        TERMOS E COM A POLÍTICA DE PRIVACIDADE.</strong> Caso não concorde com qualquer
        disposição, deve abster-se de utilizar a Plataforma.
      </div>

      <h2>1. Natureza do Serviço</h2>
      <p>
        A LinkBio BR é uma <strong>plataforma tecnológica de software como serviço (SaaS)</strong>
        que disponibiliza ferramentas para:
      </p>
      <ol>
        <li>criação e hospedagem de páginas agregadoras de links ("link na bio");</li>
        <li>encurtamento de URLs com tela intersticial de redirecionamento contendo publicidade;</li>
        <li>geração de links para aplicativos de mensagens (WhatsApp);</li>
        <li>geração de QR codes;</li>
        <li>mensuração de acessos (analytics) das páginas criadas;</li>
        <li>captação de inscritos em newsletter e submissões de formulários;</li>
        <li>integração com ferramentas de marketing e publicidade de terceiros;</li>
        <li>demais funcionalidades correlatas que venham a ser disponibilizadas.</li>
      </ol>
      <p>
        A LinkBio BR atua <strong>exclusivamente como intermediária tecnológica</strong>.
        Não produz, edita, revisa, endossa ou garante qualquer conteúdo publicado pelos
        Usuários ou por terceiros nas páginas hospedadas. A LinkBio BR não é provedora
        de telecomunicação, não é instituição financeira, não é agência de publicidade.
      </p>

      <h2>2. Cadastro e Conta</h2>
      <p>
        Para utilizar a Plataforma, o Usuário deve realizar cadastro informando dados
        verdadeiros, precisos, atualizados e completos, sob pena de responsabilização
        civil e criminal (arts. 299 e 307 do Código Penal).
      </p>
      <p>
        O Usuário declara ser <strong>maior de 18 anos</strong> e ter plena capacidade
        civil. É o único responsável pela guarda e confidencialidade de suas credenciais,
        respondendo por todas as ações praticadas com sua conta. É vedado ceder, vender,
        alugar, compartilhar ou transferir a conta a terceiros.
      </p>
      <div className="highlight">
        A LinkBio BR poderá, a exclusivo critério, recusar cadastros, exigir comprovação
        adicional de identidade, suspender ou encerrar contas que apresentem indícios
        de irregularidade, fraude ou violação destes Termos, <strong>sem necessidade de
        aviso prévio ou justificativa</strong>, sem que tal decisão gere direito a
        indenização.
      </div>

      <h2>3. Planos e Pagamentos</h2>
      <p>
        A Plataforma disponibiliza planos gratuito e pagos (Pro e Business), com limites
        descritos na área de planos. Planos pagos são cobrados de forma <strong>recorrente</strong>,
        via cartão de crédito ou meio eletrônico aceito pelo gateway Abacate Pay.
      </p>
      <p>
        O Usuário autoriza expressamente a cobrança recorrente, que se renova
        automaticamente até cancelamento pelo próprio Usuário.
      </p>
      <p>
        <strong>Não há direito a reembolso</strong> dos valores já pagos, salvo nas
        hipóteses obrigatórias (art. 49 do CDC, no prazo de 7 dias a contar da contratação
        à distância). Após esse prazo, o cancelamento produz efeitos apenas ao término
        do ciclo vigente.
      </p>
      <p>
        A LinkBio BR reserva-se o direito de alterar preços, estrutura de planos, limites
        e condições comerciais a qualquer tempo, com aviso antecipado de 30 dias. Não se
        responsabiliza por falhas, bloqueios ou estornos realizados pelo gateway, banco
        ou administradora de cartão.
      </p>

      <h2>4. Uso Permitido e Conteúdo</h2>
      <p>O Usuário declara e garante que todo conteúdo publicado:</p>
      <ol>
        <li>é de sua titularidade ou está devidamente licenciado;</li>
        <li>não viola direitos de terceiros (autorais, marcas, imagem, honra, privacidade, segredo);</li>
        <li>não é falso, fraudulento, enganoso, difamatório, obsceno, discriminatório, apologético ao crime, ódio ou violência;</li>
        <li>não se destina a phishing, engenharia social, malware, spam, pirâmide financeira ou atividade ilícita;</li>
        <li>cumpre a LGPD, especialmente quanto à coleta via formulários e newsletters.</li>
      </ol>
      <p><strong>É EXPRESSAMENTE VEDADO:</strong></p>
      <ol>
        <li>violar direitos intelectuais;</li>
        <li>praticar concorrência desleal ou usurpar identidade alheia;</li>
        <li>realizar engenharia reversa ou burlar medidas técnicas;</li>
        <li>utilizar robôs, scrapers ou meios não autorizados;</li>
        <li>criar múltiplas contas para burlar limites do plano gratuito;</li>
        <li>veicular conteúdo político-partidário em violação à legislação eleitoral;</li>
        <li>distribuir pornografia ou conteúdo impróprio a menores;</li>
        <li>comercializar produtos proibidos (drogas ilícitas, armas sem habilitação, falsificados);</li>
        <li>utilizar a Plataforma para competir diretamente com a LinkBio BR.</li>
      </ol>
      <p>
        A LinkBio BR poderá, a qualquer tempo, <strong>remover unilateralmente</strong>
        conteúdo que considere violar estes Termos, a lei ou direitos de terceiros,
        independentemente de notificação prévia, nos termos do art. 19 do Marco Civil.
      </p>
      <p>
        O Usuário <strong>concede à LinkBio BR licença não exclusiva, mundial, gratuita
        e pelo prazo legal</strong> para reproduzir, armazenar, transmitir, exibir e
        adaptar tecnicamente o conteúdo publicado, exclusivamente para viabilizar o
        funcionamento e a promoção da Plataforma.
      </p>

      <h2>5. Responsabilidade pelo Tratamento de Dados de Terceiros</h2>
      <p>
        Ao utilizar funcionalidades que coletam dados de terceiros (formulários,
        newsletters, pixels, domínio próprio), o Usuário atua como <strong>Controlador</strong>
        perante os Visitantes, nos termos do art. 5º, VI, da LGPD, e assume integralmente:
      </p>
      <ol>
        <li>informar os Visitantes sobre a coleta e finalidade;</li>
        <li>obter consentimento válido quando exigido por lei;</li>
        <li>fornecer política de privacidade própria;</li>
        <li>responder a requisições dos Titulares (acesso, correção, exclusão);</li>
        <li>manter os dados seguros e não utilizá-los para finalidades abusivas.</li>
      </ol>
      <div className="highlight">
        O Usuário <strong>isenta expressamente</strong> a LinkBio BR de responsabilidade
        pelo tratamento dos dados de Visitantes, obrigando-se a arcar, regressivamente,
        com quaisquer indenizações, multas, custas e honorários decorrentes de reclamações
        de Titulares, ANPD ou terceiros.
      </div>

      <h2>6. Limitação de Responsabilidade</h2>
      <p>
        A Plataforma é fornecida <strong>"NO ESTADO EM QUE SE ENCONTRA" ("AS IS") e
        "CONFORME DISPONÍVEL"</strong>, sem garantias de qualquer espécie, expressas
        ou implícitas, incluindo adequação a finalidade, continuidade, disponibilidade,
        precisão, segurança absoluta ou ausência de erros.
      </p>
      <p><strong>A LinkBio BR NÃO SE RESPONSABILIZA</strong> por:</p>
      <ol>
        <li>indisponibilidade, lentidão ou falhas, ainda que por tempo prolongado;</li>
        <li>perda de dados por falha técnica, caso fortuito, força maior, ato de terceiro ou do próprio Usuário;</li>
        <li>atos, conteúdo, produtos ou serviços de Usuários, Visitantes ou terceiros;</li>
        <li>prejuízos de integrações ativadas pelo Usuário com serviços de terceiros;</li>
        <li>lucros cessantes, perda de oportunidades, dano indireto ou consequencial;</li>
        <li>conteúdo de anúncios (Google AdSense ou outros) na tela intersticial, de curadoria exclusiva do respectivo provedor;</li>
        <li>problemas do dispositivo, rede ou provedor de internet do Usuário ou Visitante.</li>
      </ol>
      <div className="highlight">
        Caso a LinkBio BR venha a ser condenada ao pagamento de qualquer indenização,
        sua responsabilidade total, em qualquer hipótese, <strong>ficará limitada ao
        valor efetivamente pago pelo Usuário à Plataforma nos 12 (doze) meses imediatamente
        anteriores ao evento danoso</strong>, observando-se o art. 944, parágrafo único,
        do Código Civil.
      </div>

      <h2>7. Propriedade Intelectual</h2>
      <p>
        Todos os elementos da Plataforma — código-fonte, interfaces, layouts, marcas,
        logotipos, bases de dados, algoritmos, templates da biblioteca oficial — são
        de propriedade exclusiva da LinkBio BR ou seus licenciantes, protegidos pela
        Lei nº 9.610/1998, Lei nº 9.279/1996, Lei nº 9.609/1998 e tratados internacionais.
      </p>
      <p>
        O uso da Plataforma não transfere ao Usuário qualquer direito de propriedade
        intelectual, sendo-lhe concedida apenas licença pessoal, limitada, revogável
        e não exclusiva. Templates publicados por outros Usuários na galeria da
        comunidade permanecem de titularidade dos respectivos autores.
      </p>

      <h2>8. Suspensão, Bloqueio e Encerramento</h2>
      <p>
        A LinkBio BR poderá, a <strong>exclusivo critério</strong>, sem aviso prévio e
        sem direito a indenização:
      </p>
      <ol>
        <li>suspender, restringir ou bloquear a conta;</li>
        <li>remover páginas, links, conteúdos e funcionalidades;</li>
        <li>encerrar definitivamente a conta;</li>
        <li>invalidar links curtos associados.</li>
      </ol>
      <p>Hipóteses exemplificativas de bloqueio:</p>
      <ol>
        <li>violação destes Termos ou da Política de Privacidade;</li>
        <li>violação de lei ou direito de terceiro;</li>
        <li>denúncia de abuso considerada procedente;</li>
        <li>inadimplência superior a 10 dias em plano pago;</li>
        <li>fraude, chargeback indevido;</li>
        <li>conduta ofensiva contra colaboradores;</li>
        <li>ordem judicial ou administrativa;</li>
        <li>risco reputacional, técnico ou jurídico, a exclusivo juízo da LinkBio BR.</li>
      </ol>

      <h2>9. Alterações Unilaterais dos Termos</h2>
      <p>
        A LinkBio BR poderá alterar unilateralmente estes Termos a qualquer tempo,
        publicando a nova versão em <strong>https://linkbiobr.com/termos</strong>. O uso
        continuado da Plataforma após a publicação implica <strong>aceitação tácita</strong>
        das modificações. Caso o Usuário não concorde, deverá encerrar sua conta, sem
        direito a reembolso proporcional.
      </p>

      <h2>10. Comunicações</h2>
      <p>
        As comunicações oficiais serão feitas pelo e-mail cadastrado na conta do Usuário,
        por notificação dentro da Plataforma ou canais oficiais da LinkBio BR,
        considerando-se válidas e eficazes.
      </p>

      <h2>11. Cláusulas Gerais</h2>
      <p>
        A tolerância quanto ao descumprimento de qualquer obrigação não constitui
        novação, renúncia ou precedente. A nulidade de qualquer cláusula não afeta
        as demais, que permanecem válidas. Estes Termos constituem o acordo integral
        entre as partes. O Usuário não poderá ceder seus direitos; a LinkBio BR poderá
        cedê-los livremente em operações societárias.
      </p>

      <h2>12. Legislação e Foro</h2>
      <p>
        Estes Termos são regidos pelas leis da República Federativa do Brasil. Fica
        eleito o foro da comarca da sede da LinkBio BR, com renúncia a qualquer outro,
        por mais privilegiado que seja, facultado à LinkBio BR propor ação no domicílio
        do Usuário quando este for consumidor.
      </p>

      <h2>Contato</h2>
      <p><strong>Suporte e Encarregado de Dados:</strong> visionxma@gmail.com</p>
    </>
  );
}
