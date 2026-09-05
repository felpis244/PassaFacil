
// conexão com o Supabase
import { supabase } from "./supabase.js";

// Verifica se o usuário está logado e é professor
const { data } = await supabase.auth.getSession();
if (!data.session) {
  window.location.href = "login.html";
}

const userId = data.session.user.id;

// Busca o perfil do professor
const { data: professor } = await supabase
  .from("perfis")
  .select("nome, role")
  .eq("id", userId)
  .single();

// Se não for professor, manda pra dashboard
if (professor.role !== "professor") {
  window.location.href = "dashboard.html";
}

// Atualiza o menu lateral
const iniciais = professor.nome.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
const avatarEl = document.getElementById("avatar-mlateral");
if (avatarEl) avatarEl.textContent = iniciais;
const nomeEl = document.getElementById("nome-usuario");
if (nomeEl) nomeEl.textContent = professor.nome.split(" ")[0];

// Busca total de alunos
const { count: totalAlunos } = await supabase
  .from("perfis")
  .select("*", { count: "exact" })
  .eq("role", "aluno");

document.getElementById("total-alunos").textContent = totalAlunos;

// Busca total de questões
const { count: totalQuestoes } = await supabase
  .from("questoes")
  .select("*", { count: "exact" });

document.getElementById("total-questoes").textContent = totalQuestoes;

// Busca total de respostas
const { count: totalRespostas } = await supabase
  .from("respostas")
  .select("*", { count: "exact" });

document.getElementById("total-respostas").textContent = totalRespostas;

// Busca todas as respostas pra calcular taxa de erro
const { data: respostas } = await supabase
  .from("respostas")
  .select("materia, acertou");

// Taxa de erro geral
const erros = respostas.filter(r => !r.acertou).length;
const taxaErro = totalRespostas > 0 ? Math.round((erros / totalRespostas) * 100) : 0;
document.getElementById("taxa-erro").textContent = taxaErro + "%";

// Junta os erros por matéria
const materias = {};
respostas.forEach(r => {
  if (!materias[r.materia]) {
    materias[r.materia] = { total: 0, erros: 0 };
  }
  materias[r.materia].total++;
  if (!r.acertou) materias[r.materia].erros++;
});

// Monta o gráfico de erros por matéria
const grafico = document.getElementById("grafico-materias");
Object.entries(materias).forEach(([nome, dados]) => {
  const taxaErroMateria = Math.round((dados.erros / dados.total) * 100);

  const item = document.createElement("div");
  item.classList.add("grafico-item");
  item.innerHTML = `
    <span class="grafico-label">${nome}</span>
    <div class="grafico-barra-wrap">
      <div class="grafico-barra" style="width:${taxaErroMateria}%"></div>
    </div>
    <span class="grafico-pct">${taxaErroMateria}%</span>
  `;
  grafico.appendChild(item);
});

// Busca top 5 alunos por XP
const { data: topAlunos } = await supabase
  .from("perfis")
  .select("nome, xp")
  .eq("role", "aluno")
  .order("xp", { ascending: false })
  .limit(5);

// Monta o top alunos
const topLista = document.getElementById("top-alunos-lista");
topAlunos.forEach((aluno, index) => {
  const iniciais = aluno.nome.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  let medalha = index + 1;
  if (index === 0) medalha = "🥇";
  if (index === 1) medalha = "🥈";
  if (index === 2) medalha = "🥉";

  const item = document.createElement("div");
  item.classList.add("top-aluno-item");
  item.innerHTML = `
    <span class="top-aluno-pos">${medalha}</span>
    <div class="top-aluno-avatar">${iniciais}</div>
    <span class="top-aluno-nome">${aluno.nome}</span>
    <span class="top-aluno-xp">${aluno.xp} XP</span>
  `;
  topLista.appendChild(item);
});

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