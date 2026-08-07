// conexão com o Supabase
import { supabase } from "./supabase.js";

// Procura o formulário de login
const form = document.getElementById("form-login");

// Espera o usuário clicar em Entrar
form.addEventListener("submit", async (e) => {

  // Impede o formulário de recarregar a página
  e.preventDefault();

  // Pega o e-mail digitado
  const email = document.getElementById("email").value;

  // Pega a senha digitada
  const senha = document.getElementById("senha").value;

  // Faz login no Supabase

  const lembrar = document.getElementById("lembrar").checked;

  const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: senha,
      options: {
          persistSession: lembrar
      }
  });

  // Se der erro, mostra a mensagem e para
    if (error) {
        alert("Erro ao entrar:\n" + error.message);
        return;
    }

  // Verifica se o perfil do usuário já existe na tabela
  const { data: perfil } = await supabase
    .from("perfis")
    .select("id, ultimo_estudo")
    .eq("id", data.user.id)
    .maybeSingle();

  // Se não existir, cria o perfil automaticamente
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
    
    //verificação de resetar vidas todo dia quando a pessao entrar reseta pra 5 corações dnv
    
    if (perfil) {
      const hoje = new Date().toISOString().split("T")[0];

      if (perfil.ultimo_estudo !== hoje) {
        await supabase
          .from("perfis")
          .update({ vidas: 5 })
          .eq("id", data.user.id);
      }
    }
  

  // Busca o cargo do usuário
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

// Login com Google
document.getElementById("btn-google").addEventListener("click", async () => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: window.location.origin + "/dashboard.html"
    }
  });

  if (error) {
    alert("Erro ao entrar com Google: " + error.message);
  }
});