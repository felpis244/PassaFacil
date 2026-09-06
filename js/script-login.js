// conexão com o Supabase
import { supabase } from "./supabase.js";

// procura o formulário de login
const form = document.getElementById("form-login");

// espera o usuário clicar em entrar
form.addEventListener("submit", async (e) => {

  // impede o formulário de dar f5 na página
  e.preventDefault();

  // pega o e-mail digitado
  const email = document.getElementById("email").value;

  // pega a senha digitada
  const senha = document.getElementById("senha").value;

  // faz login no Supabase

  const lembrar = document.getElementById("lembrar").checked;

  // mostra a tela de carregamento enquanto verifica o login
  mostrarLoading("Entrando...");

  const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: senha,
      options: {
          persistSession: lembrar
      }
  });

  // se der erro mostra a mensagem e para
    if (error) {
      esconderLoading();
      mostrarToast(' Erro ao entrar, caso persista, entre em contato com o suporte.', 'erro');
      return;
    }

  // verifica se o perfil do usuário já existe na tabela
  const { data: perfil } = await supabase
    .from("perfis")
    .select("id, ultimo_estudo")
    .eq("id", data.user.id)
    .maybeSingle();

  // se não existir cria o perfil automaticamente
    if (!perfil) {
        await supabase
            .from("perfis")
            .insert({
                id: data.user.id,
                nome: data.user.user_metadata.nome || "Usuário",
                xp: 0,
                vidas: 5,
                sequencia: 0
            });
    }
    
    // ANTES: aqui resetava as vidas pra 5 toda vez que passava um dia.
    // Isso foi REMOVIDO porque agora as vidas regeneram sozinhas a cada
    // 5 minutos (ver js/vidas.js), então não faz mais sentido depender
    // de "virou o dia" — o cálculo de regeneração já cuida disso
    // automaticamente sempre que o dashboard, o perfil ou a tela de
    // questões são abertos.

  // busca o cargo da pessoa
  const { data: perfilRole } = await supabase
    .from("perfis")
    .select("role")
    .eq("id", data.user.id)
    .single();

    console.log("role:", perfilRole.role);

  // manda pra pagina de cada um 
  if (perfilRole.role === "professor") {
    window.location.href = "painel.html";
  } else {
    mostrarToast("Bem-vindo ao PassaFácil! 🎓");
    window.location.href = "dashboard.html";
  }

});

document.getElementById("esqueci-senha").addEventListener("click", async (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value;
  
  if (!email) {
    mostrarToast(" Digite seu email primeiro!", "erro");
    return;
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: window.location.origin + "/perfil.html"
  });

  if (error) {
    mostrarToast(" Erro: " + error.message, "erro");
    return;
  }

  mostrarToast(" Email de redefinição enviado!", "sucesso");
});

// login com Google
document.getElementById("btn-google").addEventListener("click", async () => {
  mostrarLoading("Conectando com o Google...");

  // monta a URL de destino com base na pasta atual (funciona em subpastas e em produção)
  const urlDashboard = new URL("dashboard.html", window.location.href).href;

  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: urlDashboard
    }
  });

  if (error) {
    esconderLoading();
    mostrarToast(' Erro ao entrar com Google, caso persista, entre em contato com o suporte.', 'erro')
  }
});