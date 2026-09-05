
// Importa a conexão com o Supabase
import { supabase } from "./supabase.js";

// Verifica se o usuário está logado e é professor
const { data } = await supabase.auth.getSession();
if (!data.session) {
  window.location.href = "login.html";
}

const userId = data.session.user.id;

// Verifica se é professor
const { data: professor } = await supabase
  .from("perfis")
  .select("nome, role, avatar_cor")
  .eq("id", userId)
  .single();

if (professor.role !== "professor") {
  window.location.href = "dashboard.html";
}

// Atualiza o menu lateral
const iniciais = professor.nome.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
const avatarEl = document.getElementById("avatar-mlateral");
if (avatarEl) {
  avatarEl.textContent = iniciais;
  avatarEl.style.backgroundColor = professor.avatar_cor || "#4c2a96";
}

// Busca todos os alunos
const { data: alunos } = await supabase
  .from("perfis")
  .select("nome, xp, vidas, sequencia, criado_em, avatar_cor")
  .eq("role", "aluno")
  .order("xp", { ascending: false });

// Atualiza o total
document.getElementById("total-alunos").textContent = alunos.length + " alunos cadastrados";

// Monta a lista
const lista = document.getElementById("alunos-lista");

if (alunos.length === 0) {
  lista.innerHTML = '<p style="padding:24px;color:rgba(255,255,255,0.4);">Nenhum aluno cadastrado ainda.</p>';
} else {
  alunos.forEach((aluno, index) => {
    const iniciais = aluno.nome.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
    const data = new Date(aluno.criado_em).toLocaleDateString("pt-BR");
    const corAvatar = aluno.avatar_cor || "#4c2a96";

    const item = document.createElement("div");
    item.classList.add("ranking-item");
    item.innerHTML = `
      <span class="ranking-posicao">${index + 1}</span>
      <div class="ranking-avatar" style="background-color: ${corAvatar}">${iniciais}</div>
      <span class="ranking-nome">${aluno.nome}</span>
      <span style="font-size:13px;color:rgba(255,255,255,0.4);flex:1;text-align:center;">Desde ${data}</span>
      <span style="font-size:13px;color:#1D9E75;margin-right:16px;">🔥 ${aluno.sequencia} dias</span>
      <span class="ranking-xp">${aluno.xp} XP</span>
    `;

    lista.appendChild(item);
  });
}

// Logout
const btnLogout = document.getElementById("btn-logout");
if (btnLogout) {
  btnLogout.addEventListener("click", async () => {
    // pede confirmação antes de encerrar a sessão do professor
    const confirmou = await confirmarAcao("Tem certeza que deseja sair da sua conta?");
    if (!confirmou) return;

    await supabase.auth.signOut();
    window.location.href = "index.html";
  });
}