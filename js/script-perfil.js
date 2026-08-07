
// conexão com o Supabase
import { supabase } from "./supabase.js";

// Verifica se o usuário está logado
const { data } = await supabase.auth.getSession();
if (!data.session) {
  window.location.href = "login.html";
}

const userId = data.session.user.id;
const email = data.session.user.email;

// Busca o perfil do usuário
const { data: perfil } = await supabase
  .from("perfis")
  .select("*")
  .eq("id", userId)
  .single();

// Calcula as iniciais
const iniciais = perfil.nome.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

// Atualiza o topo
document.getElementById("avatar-grande").textContent = iniciais;
document.getElementById("avatar-sidebar").textContent = iniciais;
document.getElementById("nome-sidebar").textContent = perfil.nome;
document.getElementById("perfil-nome").textContent = perfil.nome;
document.getElementById("perfil-email").textContent = email;
document.getElementById("perfil-xp").textContent = perfil.xp;
document.getElementById("perfil-vidas").textContent = perfil.vidas;
document.getElementById("perfil-sequencia").textContent = perfil.sequencia + " dias";

//logout 
document.getElementById("logout-btn").addEventListener("click", async () => {
  await supabase.auth.signOut();
  window.location.href = "login.html";
});