
// conexão com o Supabase
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
  .select("nome, role")
  .eq("id", userId)
  .single();

if (professor.role !== "professor") {
  window.location.href = "dashboard.html";
}

// Atualiza o menu lateral
const iniciais = professor.nome.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
const avatarEl = document.getElementById("avatar-mlateral");
if (avatarEl) avatarEl.textContent = iniciais;

// Função para carregar questões
async function carregarQuestoes() {
  const { data: questoes } = await supabase
    .from("questoes")
    .select("*")
    .order("id", { ascending: false });

  document.getElementById("total-questoes").textContent = questoes.length + " questões cadastradas";

  const lista = document.getElementById("questoes-lista");
  lista.innerHTML = "";

  questoes.forEach(q => {
    const item = document.createElement("div");
    item.classList.add("ranking-item");
    item.innerHTML = `
      <div style="flex:1;">
        <p style="font-size:11px;color:#AFA9EC;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">${q.materia} — ${q.conteudo}</p>
        <p style="font-size:14px;color:#ffffff;">${q.enunciado.slice(0, 80)}...</p>
      </div>
      <span style="font-size:12px;color:rgba(255,255,255,0.4);margin-right:16px;">${q.dificuldade}</span>
      <button onclick="deletarQuestao(${q.id})" style="background:rgba(255,77,106,0.15);border:1px solid rgba(255,77,106,0.3);border-radius:8px;padding:6px 12px;color:#ff4d6a;font-size:12px;cursor:pointer;">Deletar</button>
    `;
    lista.appendChild(item);
  });
}

carregarQuestoes();

// Adicionar questão
document.getElementById("btn-adicionar").addEventListener("click", async () => {
  const materia = document.getElementById("form-materia").value;
  const conteudo = document.getElementById("form-conteudo").value;
  const enunciado = document.getElementById("form-enunciado").value;
  const alt_a = document.getElementById("form-alt-a").value;
  const alt_b = document.getElementById("form-alt-b").value;
  const alt_c = document.getElementById("form-alt-c").value;
  const alt_d = document.getElementById("form-alt-d").value;
  const resposta = document.getElementById("form-resposta").value;
  const explicacao = document.getElementById("form-explicacao").value;
  const dificuldade = document.getElementById("form-dificuldade").value;

  if (!enunciado || !alt_a || !alt_b || !alt_c || !alt_d || !explicacao || !conteudo) {
    mostrarToast('Preencha todos os campos!', 'erro');
    return;
  }

  const { error } = await supabase
    .from("questoes")
    .insert({
      materia, conteudo, enunciado,
      alternativa_a: alt_a,
      alternativa_b: alt_b,
      alternativa_c: alt_c,
      alternativa_d: alt_d,
      resposta_correta: resposta,
      explicacao, dificuldade
    });

  if (error) {
    mostrarToast('Erro ao adicionar: ' + error.message, 'erro');
    return;
  }

  mostrarToast('Questão adicionada!', 'sucesso');

  // Limpa o formulário
  document.getElementById("form-conteudo").value = "";
  document.getElementById("form-enunciado").value = "";
  document.getElementById("form-alt-a").value = "";
  document.getElementById("form-alt-b").value = "";
  document.getElementById("form-alt-c").value = "";
  document.getElementById("form-alt-d").value = "";
  document.getElementById("form-explicacao").value = "";

  carregarQuestoes();
});

// Deletar questão
window.deletarQuestao = async (id) => {
  if (!confirm("Tem certeza que quer deletar essa questão?")) return;

  await supabase.from("questoes").delete().eq("id", id);
  carregarQuestoes();
};

// Logout
const btnLogout = document.getElementById("btn-logout");
if (btnLogout) {
  btnLogout.addEventListener("click", async () => {
    await supabase.auth.signOut();
    window.location.href = "index.html";
  });
}