// Importa a conexão com o Supabase
import { supabase } from "./supabase.js";
import { sincronizarVidas, segundosParaProximaVida, formatarTempo, regenerarTodasVidas, VIDAS_MAXIMAS } from "./vidas.js";

// Verifica se o usuário está logado
const { data } = await supabase.auth.getSession();

// Se não tiver login volta pra tela de logar
if (!data.session) {
  window.location.href = "login.html";
}

// Pega o id da pessoa que fez o login
const userId = data.session.user.id;

// Busca o perfil do usuário na tabela perfis
const { data: perfil } = await supabase
  .from("perfis")
  .select("*")
  .eq("id", userId)
  .single();

// Atualiza as iniciais nos avatares
const iniciais = perfil.nome.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
const corAvatar = perfil.avatar_cor || "#4c2a96"; // mesma cor padrão usada no perfil
document.querySelectorAll(".avatar").forEach(el => {
  el.textContent = iniciais;
  el.style.backgroundColor = corAvatar; // aplica a cor escolhida no perfil aqui também
});

// Atualiza o nome
const nomeEl = document.getElementById("nome-usuario");
if (nomeEl) nomeEl.textContent = perfil.nome.split(" ")[0];

// Atualiza XP
const statXp = document.getElementById("stat-xp");
if (statXp) statXp.textContent = perfil.xp;

// Atualiza Vidas
// Antes disso, checa se alguma vida já regenerou sozinha desde a última visita
// (calcula com base no tempo que passou e, se for o caso, já salva no banco)
const vidasAtualizadas = await sincronizarVidas(supabase, userId, perfil.vidas, perfil.vidas_atualizadas_em);
perfil.vidas = vidasAtualizadas; // mantém o objeto "perfil" coerente pro resto do código

const statVidas = document.getElementById("stat-vidas");
if (statVidas) statVidas.textContent = perfil.vidas;

// Contador de "próxima vida em X" + botão de regenerar tudo na hora
const vidasContador = document.getElementById("vidas-contador");
const btnRegenerarVidas = document.getElementById("btn-regenerar-vidas");

// Atualiza o texto do contador a cada segundo (ou mostra "vidas cheias")
function atualizarContadorVidas() {
  if (!vidasContador) return;

  if (perfil.vidas >= VIDAS_MAXIMAS) {
    vidasContador.textContent = "Vidas completas!";
    if (btnRegenerarVidas) btnRegenerarVidas.disabled = true;
    return;
  }

  const segundos = segundosParaProximaVida(perfil.vidas, perfil.vidas_atualizadas_em);
  vidasContador.textContent = "Próxima vida em " + formatarTempo(segundos);
  if (btnRegenerarVidas) btnRegenerarVidas.disabled = false;
}

atualizarContadorVidas();
// atualiza o contador a cada segundo, sem precisar recarregar a página
setInterval(atualizarContadorVidas, 1000);

// Botão: regenera as 5 vidas na hora, sem precisar esperar
if (btnRegenerarVidas) {
  btnRegenerarVidas.addEventListener("click", async () => {
    btnRegenerarVidas.disabled = true;
    btnRegenerarVidas.textContent = "Regenerando...";

    // CORREÇÃO (bug "vida volta pra 4 depois de navegar"):
    // Antes, o código atualizava a tela (perfil.vidas = VIDAS_MAXIMAS)
    // sem checar se o update no banco realmente funcionou. Se o
    // Supabase bloqueava o update por falta de policy de RLS na
    // tabela "perfis", a tela mostrava 5 vidas mas o banco continuava
    // com o valor antigo — daí ao navegar pra outra página, o valor
    // real (errado) voltava. Agora regenerarTodasVidas devolve
    // { error }, e só atualizamos a tela se realmente deu certo.
    const { error } = await regenerarTodasVidas(supabase, userId);

    if (error) {
      // CORREÇÃO: usamos alert() aqui (não mostrarToast) porque o
      // dashboard.html não carrega js/toast.js. Se você quiser o toast
      // bonitinho aqui também, adicione no <head> ou antes do </body>
      // do dashboard.html:
      //   <link rel="stylesheet" href="css/toast.css">
      //   <script src="js/toast.js"></script>
      // (sempre ANTES da tag <script type="module" src="js/script-dashboard.js">)
      // e aí pode trocar este alert por:
      //   mostrarToast('Não foi possível regenerar as vidas agora. Tente de novo.', 'erro');
      alert('Não foi possível regenerar as vidas agora. Tente de novo.');
      btnRegenerarVidas.textContent = "⚡ Regenerar vidas";
      btnRegenerarVidas.disabled = false;
      return;
    }

    // só atualiza os valores locais se o banco confirmou a gravação
    perfil.vidas = VIDAS_MAXIMAS;
    perfil.vidas_atualizadas_em = new Date().toISOString();
    statVidas.textContent = perfil.vidas;
    btnRegenerarVidas.textContent = "⚡ Regenerar vidas";
    atualizarContadorVidas();
  });
}

// Atualiza Sequência
const statSeq = document.getElementById("stat-sequencia");
if (statSeq) statSeq.textContent = perfil.sequencia + " dias";

// Busca o histórico de respostas do usuário
const { data: respostas } = await supabase
  .from("respostas")
  .select("materia, acertou")
  .eq("usuario_id", userId);

if (respostas && respostas.length > 0) {
  // Junta por matéria
  const materias = {};
  respostas.forEach(r => {
    if (!materias[r.materia]) {
      materias[r.materia] = { total: 0, acertos: 0 };
    }
    materias[r.materia].total++;
    if (r.acertou) materias[r.materia].acertos++;
  });

  // Acha a melhor matéria
  let melhorMateria = "";
  let melhorTaxa = 0;
  Object.entries(materias).forEach(([nome, dados]) => {
    const taxa = Math.round((dados.acertos / dados.total) * 100);
    if (taxa > melhorTaxa) {
      melhorTaxa = taxa;
      melhorMateria = nome;
    }
  });

  // Atualiza o card de melhor matéria
  const melhorEl = document.getElementById("melhor-materia");
  const taxaEl = document.getElementById("melhor-taxa");
  if (melhorEl) melhorEl.textContent = melhorMateria || "Nenhuma ainda";
  if (taxaEl) taxaEl.textContent = melhorTaxa + "% de acerto";
}

// === GRÁFICO DE ÚLTIMAS LIÇÕES ===
// Busca todas as respostas do aluno em ordem cronológica (da mais antiga
// pra mais nova), pra poder agrupar em "lições" e montar o gráfico.
// CORREÇÃO: estava buscando a coluna "criado_em", mas na tabela
// "respostas" essa coluna se chama "respondido_em" (a "criado_em" é da
// tabela "perfis" — foi uma mistura das duas). Isso causava 400 Bad
// Request nesse GET.
const { data: respostasParaGrafico, error: erroGrafico } = await supabase
  .from("respostas")
  .select("acertou, respondido_em")
  .eq("usuario_id", userId)
  .order("respondido_em", { ascending: true });

if (erroGrafico) {
  console.error("Erro ao buscar histórico de respostas:", erroGrafico);
}

renderizarGraficoLicoes(respostasParaGrafico);

// Monta um gráfico de barras simples (feito só com HTML/CSS, sem
// biblioteca externa) mostrando a taxa de acerto das últimas lições.
function renderizarGraficoLicoes(respostas) {
  const container = document.getElementById("historico-lista");
  if (!container) return;

  if (!respostas || respostas.length === 0) {
    container.innerHTML = '<p class="sem-dados">Nenhuma lição feita ainda.</p>';
    return;
  }

  // Cada lição no site tem 10 questões (ver js/script-questao.js, que
  // busca ".limit(10)" questões por vez). Então agrupamos as respostas
  // de 10 em 10 pra "reconstruir" cada lição já feita.
  const TAMANHO_LICAO = 10;
  const licoes = [];
  for (let i = 0; i < respostas.length; i += TAMANHO_LICAO) {
    licoes.push(respostas.slice(i, i + TAMANHO_LICAO));
  }

  // Mostra só as últimas 8 lições, pra não ficar apertado no gráfico
  const MAX_BARRAS = 8;
  const ultimasLicoes = licoes.slice(-MAX_BARRAS);
  const primeiraExibida = licoes.length - ultimasLicoes.length; // pra numerar certinho

  const barras = ultimasLicoes.map((licao, index) => {
    const acertos = licao.filter(r => r.acertou).length;
    const taxa = Math.round((acertos / licao.length) * 100);
    const numeroLicao = primeiraExibida + index + 1;

    return `
      <div class="grafico-barra-coluna" title="Lição ${numeroLicao}: ${taxa}% de acerto (${acertos}/${licao.length} questões)">
        <div class="grafico-barra" style="height: ${Math.max(taxa, 4)}%"></div>
        <span class="grafico-label">L${numeroLicao}</span>
      </div>
    `;
  }).join("");

  container.innerHTML = `<div class="grafico-licoes">${barras}</div>`;
}

// Busca todos os perfis ordenados por XP pra calcular posição
const { data: todosPerfis } = await supabase
  .from("perfis")
  .select("id, xp")
  .order("xp", { ascending: false });

// Acha a posição do usuário
const minhaPosicao = todosPerfis.findIndex(p => p.id === userId) + 1;

// Atualiza o card de ranking
const statRanking = document.getElementById("stat-ranking");
if (statRanking) statRanking.textContent = "#" + minhaPosicao;

// Atualiza o texto do ranking no acesso rápido
const rapidoRanking = document.getElementById("rapido-ranking");
if (rapidoRanking) rapidoRanking.textContent = "Você está em #" + minhaPosicao;

// Logout
const btnLogout = document.getElementById("btn-logout");
if (btnLogout) {
  btnLogout.addEventListener("click", async () => {
    // espera a pessoa confirmar no modal antes de encerrar a sessão
    const confirmou = await confirmarAcao("Tem certeza que deseja sair da sua conta?");
    if (!confirmou) return; // clicou em "Cancelar", não faz nada

    await supabase.auth.signOut();
    window.location.href = "index.html";
  });
}

// Menu hamburguer
const btnMenu = document.getElementById("menu-hamburguer");
const menuMobile = document.getElementById("menu-mobile");
const menuOverlay = document.getElementById("menu-overlay");
const btnLogoutMobile = document.getElementById("btn-logout-mobile");

if (btnMenu) {
  btnMenu.addEventListener("click", () => {
    menuMobile.classList.toggle("aberto");
  });
}

if (menuOverlay) {
  menuOverlay.addEventListener("click", () => {
    menuMobile.classList.remove("aberto");
  });
}

if (btnLogoutMobile) {
  btnLogoutMobile.addEventListener("click", async () => {
    const confirmou = await confirmarAcao("Tem certeza que deseja sair da sua conta?");
    if (!confirmou) return;

    await supabase.auth.signOut();
    window.location.href = "index.html";
  });
}