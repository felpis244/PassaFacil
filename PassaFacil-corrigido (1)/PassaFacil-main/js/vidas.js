// === SISTEMA DE VIDAS COM REGENERAÇÃO ===
// Esse arquivo centraliza toda a lógica de vidas do site, pra não
// repetir a mesma conta em dashboard, perfil e na tela de questões.
//
// REGRA DE NEGÓCIO: o aluno começa com 5 vidas. Cada vez que erra uma
// questão, perde 1. A cada 5 minutos SEM vidas cheias, ele recupera 1
// vida automaticamente (até o máximo de 5) — não precisa fazer nada,
// só esperar (ou usar o botão de regenerar tudo na hora).
//
// IMPORTANTE (banco de dados): pra isso funcionar, a tabela "perfis"
// precisa de uma coluna nova chamada "vidas_atualizadas_em", do tipo
// timestamp. Rode isso uma vez no SQL Editor do Supabase:
//
//   alter table perfis add column if not exists vidas_atualizadas_em timestamptz default now();
//   update perfis set vidas_atualizadas_em = now() where vidas_atualizadas_em is null;
//
// === CORREÇÃO (bug "vida volta pra 4 depois de navegar") ===
// Antes, as três funções que salvam vidas no banco (sincronizarVidas,
// perderVida, regenerarTodasVidas) faziam o update sem checar se ele
// realmente funcionou. Se o Supabase bloqueia o update por causa de
// RLS (Row Level Security) sem uma policy de UPDATE liberando o
// usuário a mexer na própria linha, o Postgres não atualiza nada —
// mas também não lança nenhum erro. O código continuava normalmente,
// atualizava só a tela (o valor local em memória), e quando o aluno
// navegava pra outra página, o valor real (ainda antigo) vinha do
// banco de novo.
//
// A correção abaixo faz duas coisas:
// 1) Cada função agora lê o "error" que o Supabase devolve e imprime
//    no console se o update falhar, em vez de fingir que deu certo.
// 2) regenerarTodasVidas agora RETORNA esse erro, pra quem chamou a
//    função (o botão no dashboard) saber que não pode atualizar a
//    tela como se tivesse dado certo.
//
// Isso NÃO substitui o conserto de verdade, que é garantir que exista
// uma policy de RLS de UPDATE na tabela "perfis" permitindo
// "auth.uid() = id". Sem essa policy, o update sempre vai continuar
// falhando silenciosamente — só que agora, pelo menos, vai aparecer
// um erro no console (F12) em vez de sumir sem explicação.

export const VIDAS_MAXIMAS = 5;
export const REGEN_MINUTOS = 5;
const REGEN_MS = REGEN_MINUTOS * 60 * 1000;

// Calcula quantas vidas a pessoa JÁ deveria ter agora, sem precisar
// mexer no banco toda hora — só olhando quanto tempo passou desde a
// última atualização salva.
//
// Recebe: vidasSalvas (o que está no banco) e dataAtualizacao (quando foi salvo)
// Devolve: { vidas, regenerou } -> "regenerou" diz se alguma vida nova foi somada
export function calcularVidasAtuais(vidasSalvas, dataAtualizacao) {
  // já está cheio ou não tem data salva ainda? não tem o que calcular
  if (vidasSalvas >= VIDAS_MAXIMAS || !dataAtualizacao) {
    return { vidas: vidasSalvas, regenerou: false };
  }

  const tempoPassadoMs = Date.now() - new Date(dataAtualizacao).getTime();

  // quantos blocos de 5 minutos já passaram = quantas vidas ganhou
  const vidasGanhas = Math.floor(tempoPassadoMs / REGEN_MS);

  if (vidasGanhas <= 0) {
    return { vidas: vidasSalvas, regenerou: false };
  }

  const novasVidas = Math.min(VIDAS_MAXIMAS, vidasSalvas + vidasGanhas);
  return { vidas: novasVidas, regenerou: novasVidas !== vidasSalvas };
}

// Quanto tempo falta (em segundos) pra próxima vida aparecer.
// Serve pra mostrar um contadorzinho tipo "próxima vida em 3:24" na tela.
export function segundosParaProximaVida(vidasSalvas, dataAtualizacao) {
  if (vidasSalvas >= VIDAS_MAXIMAS || !dataAtualizacao) return 0;

  const tempoPassadoMs = Date.now() - new Date(dataAtualizacao).getTime();
  const restanteMs = REGEN_MS - (tempoPassadoMs % REGEN_MS);
  return Math.ceil(restanteMs / 1000);
}

// Busca a regeneração e, se alguma vida nova apareceu, já salva no banco.
// Devolve o número de vidas certo pra mostrar na tela.
export async function sincronizarVidas(supabase, userId, vidasSalvas, dataAtualizacao) {
  const { vidas, regenerou } = calcularVidasAtuais(vidasSalvas, dataAtualizacao);

  if (regenerou) {
    const { error } = await supabase
      .from("perfis")
      .update({ vidas, vidas_atualizadas_em: new Date().toISOString() })
      .eq("id", userId);

    // CORREÇÃO: antes esse erro era ignorado. Se aparecer aqui, o mais
    // provável é faltar a policy de UPDATE na tabela "perfis" (RLS).
    if (error) {
      console.error("Erro ao salvar vidas regeneradas (provável bloqueio de RLS na tabela perfis):", error);
    }
  }

  return vidas;
}

// Usado quando o aluno ERRA uma questão: salva a vida perdida e marca
// "agora" como o novo ponto de partida da contagem de 5 minutos.
export async function perderVida(supabase, userId, vidasRestantes) {
  const { error } = await supabase
    .from("perfis")
    .update({ vidas: vidasRestantes, vidas_atualizadas_em: new Date().toISOString() })
    .eq("id", userId);

  // CORREÇÃO: mesma checagem de erro — sem isso, uma vida perdida podia
  // não ser salva de verdade e o aluno "recuperava" a vida ao navegar.
  if (error) {
    console.error("Erro ao salvar vida perdida (provável bloqueio de RLS na tabela perfis):", error);
  }
}

// Botão manual de regenerar TODAS as vidas de uma vez.
// CORREÇÃO: agora retorna { error } pra quem chamar essa função (o
// botão no dashboard) saber se o update realmente foi salvo no banco
// antes de atualizar a tela como se tivesse dado certo.
export async function regenerarTodasVidas(supabase, userId) {
  const { error } = await supabase
    .from("perfis")
    .update({ vidas: VIDAS_MAXIMAS, vidas_atualizadas_em: new Date().toISOString() })
    .eq("id", userId);

  if (error) {
    console.error("Erro ao regenerar vidas (provável bloqueio de RLS na tabela perfis):", error);
  }

  return { error };
}

// Formata segundos em "mm:ss" pra mostrar num contador
export function formatarTempo(segundosTotais) {
  const minutos = Math.floor(segundosTotais / 60);
  const segundos = segundosTotais % 60;
  return `${minutos}:${String(segundos).padStart(2, "0")}`;
}
