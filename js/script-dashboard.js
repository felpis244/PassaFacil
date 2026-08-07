
// Importa a conexão com o Supabase
import { supabase } from "./supabase.js";

// Verifica se o usuário está logado
const { data } = await supabase.auth.getSession();

// Se você estive sem login volta pra tela de logar  
if (!data.session) {
  window.location.href = "login.html";
}

// Pega o id da pessoa que fez o login para buscar o perfil dentro do banco 
const userId = data.session.user.id;

// Busca o perfil do usuário na tabela perfis
const { data: perfil } = await supabase
  .from("perfis")
  .select("*")
  .eq("id", userId)
  .single();

// Atualiza o nome na a dashboard com o xp a vida e saquencia que a pessoa tava antes de sair do site 
document.querySelectorAll(".mlateral-nome").forEach(el => {
  el.textContent = perfil.nome;
});

// Atualiza os avatares com as iniciais
const iniciais = perfil.nome.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
document.querySelectorAll(".avatar").forEach(el => {
  el.textContent = iniciais;
});

// Atualiza XP
document.querySelector(".resumo-card.amarelo h2").textContent = perfil.xp;

// Atualiza Vidas
document.querySelector(".resumo-card.vermelho h2").textContent = perfil.vidas;

// Atualiza Sequência
document.querySelector(".resumo-card.verde h2").textContent = perfil.sequencia + " dias";

// ignorar esse ultimo removi do site 
document.querySelector(".xp-valor") && (document.querySelector(".xp-valor").textContent = perfil.xp + " XP");

// Busca o histórico de respostas do usuário
const { data: respostas } = await supabase
  .from("respostas")
  .select("materia, acertou")
  .eq("usuario_id", userId);

if (respostas && respostas.length > 0) {
  // Agrupa por matéria
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

  // Atualiza o card
  document.querySelector(".info-cards .info-card:nth-child(2) h3").textContent = melhorMateria || "Nenhuma ainda";
  document.querySelector(".info-cards .info-card:nth-child(2) .info-sub").textContent = melhorTaxa + "% de acerto";
}

// Busca todos os perfis ordenados por XP pra calcular posição
const { data: todosPerfis } = await supabase
  .from("perfis")
  .select("id, xp")
  .order("xp", { ascending: false });

// Acha a posição do usuário
const minhaPosicao = todosPerfis.findIndex(p => p.id === userId) + 1;

// Atualiza o card de ranking
document.querySelector(".resumo-card.roxo h2").textContent = "#" + minhaPosicao;

//logout 
document.getElementById("logout-btn").addEventListener("click", async () => {
  await supabase.auth.signOut();
  window.location.href = "login.html";
});