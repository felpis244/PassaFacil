// Importa a conexão com o Supabase
import { supabase } from "./supabase.js";

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
document.querySelectorAll(".avatar").forEach(el => {
  el.textContent = iniciais;
});

// Atualiza o nome
const nomeEl = document.getElementById("nome-usuario");
if (nomeEl) nomeEl.textContent = perfil.nome.split(" ")[0];

// Atualiza XP
const statXp = document.getElementById("stat-xp");
if (statXp) statXp.textContent = perfil.xp;

// Atualiza Vidas
const statVidas = document.getElementById("stat-vidas");
if (statVidas) statVidas.textContent = perfil.vidas;

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
    await supabase.auth.signOut();
    window.location.href = "index.html";
  });
}