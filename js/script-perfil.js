// conexão com o Supabase
import { supabase } from "./supabase.js";

// verifica se o usuário esta logado
const { data } = await supabase.auth.getSession();
if (!data.session) {
  window.location.href = "login.html";
}

const userId = data.session.user.id;
const email = data.session.user.email;

// busca o perfil do usuario
const { data: perfil } = await supabase
  .from("perfis")
  .select("*")
  .eq("id", userId)
  .single();

// calcula as iniciais
const iniciais = perfil.nome.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

// cor do avatar
const corAvatar = perfil.avatar_cor || "#4c2a96";

// atualiza o topo
document.getElementById("avatar-grande").textContent = iniciais;
document.getElementById("avatar-grande").style.backgroundColor = corAvatar;
document.getElementById("avatar-sidebar").textContent = iniciais;
document.getElementById("avatar-sidebar").style.backgroundColor = corAvatar;
document.getElementById("perfil-nome").textContent = perfil.nome;
document.getElementById("perfil-email").textContent = email;
document.getElementById("perfil-xp").textContent = perfil.xp;
document.getElementById("perfil-vidas").textContent = perfil.vidas;
document.getElementById("perfil-sequencia").textContent = perfil.sequencia + " dias";

//puxa a bio
const bioEl = document.getElementById("perfil-bio");
if (bioEl) bioEl.textContent = perfil.bio || "";

// preenche os campos de edição
document.getElementById("edit-nome").value = perfil.nome;
document.getElementById("edit-bio").value = perfil.bio || "";

// lembra a cor atual como a escolida 
document.querySelectorAll(".cor-opcao").forEach(cor => {
  if (cor.dataset.cor === corAvatar) {
    cor.classList.add("selecionada");
  }
  cor.addEventListener("click", () => {
    document.querySelectorAll(".cor-opcao").forEach(c => c.classList.remove("selecionada"));
    cor.classList.add("selecionada");
  });
});

// salva as mudanças do perfil
document.getElementById("btn-salvar-perfil").addEventListener("click", async () => {
  const novoNome = document.getElementById("edit-nome").value.trim();
  const novaBio = document.getElementById("edit-bio").value.trim();
  const corSelecionada = document.querySelector(".cor-opcao.selecionada")?.dataset.cor || corAvatar;

  if (novoNome.length < 3) {
    mostrarToast(" O nome precisa ter pelo menos 3 caracteres!", "erro");
    return;
  }

  const { error } = await supabase
    .from("perfis")
    .update({ nome: novoNome, bio: novaBio, avatar_cor: corSelecionada })
    .eq("id", userId);

  if (error) {
    mostrarToast(" Erro ao salvar: " + error.message, "erro");
    return;
  }

  mostrarToast(" Perfil atualizado com sucesso!", "sucesso");
  document.getElementById("perfil-nome").textContent = novoNome;
  document.getElementById("perfil-bio").textContent = novaBio;
  document.getElementById("avatar-grande").style.backgroundColor = corSelecionada;
  document.getElementById("avatar-sidebar").style.backgroundColor = corSelecionada;
});

// alterar senha
document.getElementById("btn-alterar-senha").addEventListener("click", async () => {
  const novaSenha = document.getElementById("nova-senha").value;
  const confirmarSenha = document.getElementById("confirmar-senha").value;

  if (novaSenha.length < 6) {
    mostrarToast(" A senha precisa ter pelo menos 6 caracteres!", "erro");
    return;
  }

  if (!/[A-Z]/.test(novaSenha)) {
    mostrarToast(" A senha precisa ter pelo menos uma letra maiúscula!", "erro");
    return;
  }

  if (!/[0-9]/.test(novaSenha)) {
    mostrarToast(" A senha precisa ter pelo menos um número!", "erro");
    return;
  }

  if (novaSenha !== confirmarSenha) {
    mostrarToast(" As senhas não coincidem!", "erro");
    return;
  }

  const { error } = await supabase.auth.updateUser({ password: novaSenha });

  if (error) {
    mostrarToast(" Erro ao alterar senha: " + error.message, "erro");
    return;
  }

  mostrarToast(" Senha alterada com sucesso!", "sucesso");
  document.getElementById("nova-senha").value = "";
  document.getElementById("confirmar-senha").value = "";
});

//logout 
document.getElementById("logout-btn").addEventListener("click", async () => {
  await supabase.auth.signOut();
  window.location.href = "login.html";
});