// Importa a conexão com o Supabase
import { supabase } from "./supabase.js";

// Verifica se o usuário está logado
const { data } = await supabase.auth.getSession();
if (!data.session) {
  window.location.href = "login.html";
}

// Variáveis da licoes
let questoes = [];
let questaoAtual = 0;
let vidas = 5;
let xpGanho = 0;
let historico = [];
// Erro de vidas arrumado 
// Busca as vidas no banco 
const userId = data.session.user.id;
const { data: perfil } = await supabase
    .from("perfis")
    .select("vidas")
    .eq("id", userId)
    .single();

vidas = perfil.vidas;

// Atualiza os coração
document.getElementById("coracoes").textContent = "❤️".repeat(vidas) + "🖤".repeat(5 - vidas);

// Pega a matéria escolhida na tela de seleção
const materiaSelecionada = localStorage.getItem('materiaSelecionada');

// Busca 10 questões da matéria escolhida
const { data: questoesBanco } = await supabase
  .from("questoes")
  .select("*")
  .eq("materia", materiaSelecionada)
  .limit(10);

questoes = questoesBanco;

// Mostra a primeira questão
mostrarQuestao();

function mostrarQuestao() {

  const q = questoes[questaoAtual];

  document.getElementById("contador").textContent = (questaoAtual + 1) + "/10";
  document.getElementById("questao-conteudo").textContent = q.conteudo;
  document.getElementById("questao-enunciado").textContent = q.enunciado;

  const img = document.getElementById("questao-imagem");
  if (q.imagem_url) {
    img.src = q.imagem_url;
    img.style.display = "block";
  } else {
    img.style.display = "none";
  }
  // As alternativas assim e ele consulta qual é a certinha
  document.getElementById("alt-a").textContent = "A) " + q.alternativa_a;
  document.getElementById("alt-b").textContent = "B) " + q.alternativa_b;
  document.getElementById("alt-c").textContent = "C) " + q.alternativa_c;
  document.getElementById("alt-d").textContent = "D) " + q.alternativa_d;

  document.querySelectorAll(".alternativa").forEach(btn => {
    btn.classList.remove("correta", "errada");
    btn.disabled = false;
  });

  document.getElementById("feedback-box").style.display = "none";
}

// Quando o aluno clicar em uma alternativa
document.querySelectorAll(".alternativa").forEach(btn => {
  btn.addEventListener("click", async (e) => {

    const letraClicada = e.target.id.replace("alt-", "");
    const q = questoes[questaoAtual];

    document.querySelectorAll(".alternativa").forEach(b => b.disabled = true);

    if (letraClicada === q.resposta_correta) {
      e.target.classList.add("correta");
      xpGanho += 10;
      document.getElementById("feedback-texto").textContent = "✅ Correto! " + q.explicacao;
      historico.push({ enunciado: q.enunciado, acertou: true });

      // Salva a resposta no banco
      await supabase.from("respostas").insert({
        usuario_id: data.session.user.id,
        questao_id: q.id,
        materia: q.materia,
        acertou: true
      });

    } else {
      e.target.classList.add("errada");
      vidas--;
      document.getElementById("coracoes").textContent = "❤️".repeat(vidas) + "🖤".repeat(5 - vidas);
      document.getElementById("alt-" + q.resposta_correta).classList.add("correta");
      document.getElementById("feedback-texto").textContent = "❌ Errou! " + q.explicacao;
      historico.push({ enunciado: q.enunciado, acertou: false });

      // Salva a resposta no banco
      await supabase.from("respostas").insert({
        usuario_id: data.session.user.id,
        questao_id: q.id,
        materia: q.materia,
        acertou: false
      });

      if (vidas <= 0) {
        alert("Você perdeu todas as vidas! Tente novamente.");
        window.location.href = "dashboard.html";
        return;
      }
    }

    document.getElementById("feedback-box").style.display = "flex";
  });
});

// Botão próxima questão
document.getElementById("btn-proxima").addEventListener("click", async () => {
  questaoAtual++;

  if (questaoAtual >= questoes.length) {
    const userId = data.session.user.id;

    // Busca os dados atuais do usuário
    const { data: perfil } = await supabase
      .from("perfis")
      .select("xp, vidas, sequencia, ultimo_estudo")
      .eq("id", userId)
      .single();

    // Calcula a sequência
    const hoje = new Date().toISOString().split("T")[0];
    const ontem = new Date(Date.now() - 86400000).toISOString().split("T")[0];

    let novaSequencia = perfil.sequencia;

    if (perfil.ultimo_estudo === hoje) {
      // Já estudou hoje mantém
      novaSequencia = perfil.sequencia;
    } else if (perfil.ultimo_estudo === ontem) {
      // Estudou ontem aumenta
      novaSequencia = perfil.sequencia + 1;
    } else {
      // Não estudou ontem reseta
      novaSequencia = 1;
    }

    // Atualiza tudo no banco quando ele termina a liçao 
    await supabase
      .from("perfis")
      .update({
        xp: perfil.xp + xpGanho,
        vidas: vidas,
        sequencia: novaSequencia,
        ultimo_estudo: hoje
      })
      .eq("id", userId);
     // Depois que ele termina mostra na tela quantidade de XP que ele ganhou e volta para o dashboard vulgo pagina principal
    // Salva o resultado no localStorage
    localStorage.setItem('resultado', JSON.stringify({
      historico: historico,
      xpGanho: xpGanho,
      materia: materiaSelecionada
    }));

    
    window.location.href = "resultado.html";

  }

  mostrarQuestao();
});