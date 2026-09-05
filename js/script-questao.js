// Importa a conexão com o Supabase
import { supabase } from "./supabase.js";
import { sincronizarVidas, perderVida } from "./vidas.js";

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
const { data: perfil, error: erroPerfil } = await supabase
    .from("perfis")
    .select("vidas, vidas_atualizadas_em")
    .eq("id", userId)
    .single();

// === CORREÇÃO (causa raiz do bug "matéria não conecta" e "vidas erradas") ===
// Antes, se essa busca desse erro (por exemplo 400 Bad Request porque a
// coluna "vidas_atualizadas_em" não existe na tabela "perfis"), "perfil"
// vinha null e a linha "perfil.vidas" logo abaixo quebrava a página com
// "Cannot read properties of null (reading 'vidas')" — isso travava o
// script INTEIRO ali mesmo, antes de sequer chegar no código que busca
// as questões da matéria escolhida. Por isso parecia que "a matéria não
// conecta": na real a página nem chegava a tentar buscar as questões.
//
// Se você ver esse erro no console, rode no SQL Editor do Supabase:
//   alter table perfis add column if not exists vidas_atualizadas_em timestamptz default now();
//   update perfis set vidas_atualizadas_em = now() where vidas_atualizadas_em is null;
if (erroPerfil || !perfil) {
  console.error("Erro ao buscar perfil (provável coluna 'vidas_atualizadas_em' faltando na tabela perfis):", erroPerfil);
  alert("Erro ao carregar seu perfil. Avise o suporte: " + (erroPerfil?.message || "perfil não encontrado"));
  window.location.href = "dashboard.html";
} else {

// checa se alguma vida já regenerou sozinha desde a última vez que o aluno usou o site
vidas = await sincronizarVidas(supabase, userId, perfil.vidas, perfil.vidas_atualizadas_em);

// Atualiza os coração
document.getElementById("coracoes").textContent = "❤️".repeat(vidas) + "🖤".repeat(5 - vidas);

// Pega a matéria escolhida na tela de seleção
const materiaSelecionada = localStorage.getItem('materiaSelecionada');

// === CORREÇÃO (bug "matéria não conecta com as questões") ===
// Antes, esse select buscava as questões e nunca checava se veio erro
// nem se o resultado veio vazio. Duas causas comuns faziam a lista de
// questões ficar vazia sem nenhum aviso:
//   1) O valor salvo em "materia" no banco não é IDÊNTICO (acento,
//      maiúscula/minúscula, espaço) ao texto escolhido em selecao.html.
//   2) Falta uma policy de SELECT (RLS) na tabela "questoes" liberando
//      a leitura pra usuários logados — nesse caso o Supabase não dá
//      erro nenhum, só devolve uma lista vazia.
// Agora os dois casos aparecem: erro de policy vai pro console, e
// lista vazia mostra um aviso e manda o aluno de volta pra seleção
// (em vez da tela travar tentando mostrar uma questão que não existe).
const { data: questoesBanco, error: erroQuestoes } = await supabase
  .from("questoes")
  .select("*")
  .eq("materia", materiaSelecionada)
  .limit(10);

if (erroQuestoes) {
  console.error("Erro ao buscar questões (RLS da tabela questoes?):", erroQuestoes);
  alert("Erro ao carregar as questões. Tente novamente mais tarde.");
} else if (!questoesBanco || questoesBanco.length === 0) {
  console.warn(`Nenhuma questão encontrada para a matéria "${materiaSelecionada}". Confira se o valor salvo em "materia" no banco é idêntico a esse texto (acentos, maiúsculas, espaços) e se a policy de SELECT da tabela "questoes" permite leitura para o usuário logado.`);
  alert("Ainda não há questões cadastradas para essa matéria.");
  window.location.href = "selecao.html";
}

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

      // Salva a vida perdida IMEDIATAMENTE (antes era só salvo no fim da
      // lição — se o aluno zerasse as vidas no meio, a perda nunca era
      // gravada no banco). Isso também marca "agora" como o início da
      // contagem dos 5 minutos pra próxima vida regenerar.
      await perderVida(supabase, data.session.user.id, vidas);

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
} // fecha o "else" da checagem de perfil (correção do bug de crash)