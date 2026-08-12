
// Importa a conexão com o Supabase
import { supabase } from "./supabase.js";

// Verifica se o usuário está logado
const { data } = await supabase.auth.getSession();
if (!data.session) {
  window.location.href = "login.html";
}

const userId = data.session.user.id;

// Busca o perfil do usuário logado
const { data: meuPerfil } = await supabase
  .from("perfis")
  .select("nome, xp")
  .eq("id", userId)
  .single();

// Atualiza a sidebar
const iniciais = meuPerfil.nome.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
document.getElementById("avatar-mlateral").textContent = iniciais;


// Busca todos os perfis fazendo ranking por XP
const { data: perfis } = await supabase
  .from("perfis")
  .select("nome, xp")
  .order("xp", { ascending: false })
  .limit(20);

// Monta o ranking
const lista = document.getElementById("ranking-lista");
let minhaPosicao = 0;

perfis.forEach((perfil, index) => {
  const posicao = index + 1;
  const ehVoce = perfil.nome === meuPerfil.nome && perfil.xp === meuPerfil.xp;

  if (ehVoce) minhaPosicao = posicao;

  const iniciais = perfil.nome.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

  // Define a medalha
  let medalha = posicao;
  let classePos = "";
  if (posicao === 1) { medalha = "🥇"; classePos = "ouro"; }
  if (posicao === 2) { medalha = "🥈"; classePos = "prata"; }
  if (posicao === 3) { medalha = "🥉"; classePos = "bronze"; }

  const item = document.createElement("div");
  item.classList.add("ranking-item");
  if (ehVoce) item.classList.add("destaque");

  item.innerHTML = `
    <span class="ranking-posicao ${classePos}">${medalha}</span>
    <div class="ranking-avatar">${iniciais}</div>
    <span class="ranking-nome">${perfil.nome} ${ehVoce ? "<strong>(você)</strong>" : ""}</span>
    <span class="ranking-xp">${perfil.xp} XP</span>
  `;

  lista.appendChild(item);
});

// Mostra a posição do usuário embaixo
// esse acento ( ` ) sempre é usado para fazer texto que tenha variavel dentro dele. ( estamos usando para o html) {ignorar comentario é questão de estudos} pode ser escrito com aspas e + nas variaveis, so que fica mais trabalhoso 
const rankingVoce = document.getElementById("ranking-voce");
rankingVoce.innerHTML = `
  <span class="ranking-posicao">#${minhaPosicao}</span>
  <div class="ranking-avatar">${iniciais}</div>
  <span class="ranking-nome">Sua posição no rank</span>
  <span class="ranking-xp">${meuPerfil.xp} XP</span>
`;

//logout 
document.getElementById("logout-btn").addEventListener("click", async () => {
  await supabase.auth.signOut();
  window.location.href = "login.html";
});