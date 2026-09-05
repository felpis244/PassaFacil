// conexão com o Supabase
import { supabase } from "./supabase.js";
import { sincronizarVidas } from "./vidas.js";

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
// checa se alguma vida já regenerou sozinha desde a última visita
perfil.vidas = await sincronizarVidas(supabase, userId, perfil.vidas, perfil.vidas_atualizadas_em);
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
  const botaoSalvar = document.getElementById("btn-salvar-perfil");
  const novoNome = document.getElementById("edit-nome").value.trim();
  const novaBio = document.getElementById("edit-bio").value.trim();
  const corSelecionada = document.querySelector(".cor-opcao.selecionada")?.dataset.cor || corAvatar;

  if (novoNome.length < 3) {
    mostrarToast(" O nome precisa ter pelo menos 3 caracteres!", "erro");
    return;
  }

  iniciarBotaoCarregando(botaoSalvar);

  const { error } = await supabase
    .from("perfis")
    .update({ nome: novoNome, bio: novaBio, avatar_cor: corSelecionada })
    .eq("id", userId);

  pararBotaoCarregando(botaoSalvar);

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

// === VALIDAÇÃO DE SENHA ===
// Função que recebe a nova senha e devolve uma LISTA de erros encontrados.
// Se a lista voltar vazia, quer dizer que a senha passou em todas as regras.
// Fazer assim (em vez de vários "if" separados no botão) deixa fácil
// adicionar/remover regras no futuro sem bagunçar o código do clique.
function validarSenha(senha, confirmarSenha, senhaAtual) {
  const erros = [];

  // campo vazio
  if (!senha || !confirmarSenha) {
    erros.push("Preencha os dois campos de senha!");
    return erros; // não faz sentido checar mais nada se está vazio
  }

  // tamanho mínimo
  if (senha.length < 8) {
    erros.push("A senha precisa ter pelo menos 8 caracteres!");
  }

  // não pode começar/terminar com espaço (erro comum de digitação)
  if (senha !== senha.trim()) {
    erros.push("A senha não pode começar ou terminar com espaço!");
  }

  // pelo menos 1 letra maiúscula
  if (!/[A-Z]/.test(senha)) {
    erros.push("A senha precisa ter pelo menos uma letra maiúscula!");
  }

  // pelo menos 1 letra minúscula
  if (!/[a-z]/.test(senha)) {
    erros.push("A senha precisa ter pelo menos uma letra minúscula!");
  }

  // pelo menos 1 número
  if (!/[0-9]/.test(senha)) {
    erros.push("A senha precisa ter pelo menos um número!");
  }

  // pelo menos 1 caractere especial
  if (!/[!@#$%^&*()_\-+=[\]{};:,.?]/.test(senha)) {
    erros.push("A senha precisa ter pelo menos um caractere especial (ex: ! @ # $ %)!");
  }

  // não pode ser igual ao e-mail nem ao nome do usuário (senha "óbvia")
  const senhaMinuscula = senha.toLowerCase();
  if (email && senhaMinuscula.includes(email.split("@")[0].toLowerCase())) {
    erros.push("A senha não pode conter o seu e-mail!");
  }
  if (perfil.nome && senhaMinuscula.includes(perfil.nome.toLowerCase())) {
    erros.push("A senha não pode conter o seu nome!");
  }

  // a nova senha não pode ser igual à senha atual
  if (senhaAtual && senha === senhaAtual) {
    erros.push("A nova senha não pode ser igual à senha atual!");
  }

  // as duas senhas digitadas precisam ser iguais
  if (senha !== confirmarSenha) {
    erros.push("As senhas não coincidem!");
  }

  return erros;
}

// alterar senha
document.getElementById("btn-alterar-senha").addEventListener("click", async () => {
  const botaoSenha = document.getElementById("btn-alterar-senha");
  const senhaAtual = document.getElementById("senha-atual").value;
  const novaSenha = document.getElementById("nova-senha").value;
  const confirmarSenha = document.getElementById("confirmar-senha").value;

  // primeiro, garante que a senha atual foi preenchida
  if (!senhaAtual) {
    mostrarToast(" Digite sua senha atual!", "erro");
    return;
  }

  // roda todas as regras de validação da nova senha de uma vez só
  const erros = validarSenha(novaSenha, confirmarSenha, senhaAtual);

  if (erros.length > 0) {
    // mostra só o primeiro erro, pra não sobrecarregar o usuário de avisos
    mostrarToast(" " + erros[0], "erro");
    return;
  }

  iniciarBotaoCarregando(botaoSenha);

  // O Supabase não tem um jeito direto de "checar senha sem logar", então
  // a forma de confirmar que a senha atual está certa é tentando fazer
  // login de novo com ela. Se der erro, é porque a senha atual está errada.
  const { error: erroSenhaAtual } = await supabase.auth.signInWithPassword({
    email: email,
    password: senhaAtual
  });

  if (erroSenhaAtual) {
    pararBotaoCarregando(botaoSenha);
    mostrarToast(" Senha atual incorreta!", "erro");
    return;
  }

  // senha atual confirmada, agora sim troca pela nova
  const { error } = await supabase.auth.updateUser({ password: novaSenha });

  pararBotaoCarregando(botaoSenha);

  if (error) {
    mostrarToast(" Erro ao alterar senha: " + error.message, "erro");
    return;
  }

  mostrarToast(" Senha alterada com sucesso!", "sucesso");
  document.getElementById("senha-atual").value = "";
  document.getElementById("nova-senha").value = "";
  document.getElementById("confirmar-senha").value = "";
});

//logout 
document.getElementById("logout-btn").addEventListener("click", async (e) => {
  // impede que o link navegue direto pra "index.html" antes da confirmação
  e.preventDefault();

  const confirmou = await confirmarAcao("Tem certeza que deseja sair da sua conta?");
  if (!confirmou) return;

  await supabase.auth.signOut();
  window.location.href = "login.html";
});