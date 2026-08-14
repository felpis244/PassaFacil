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

  const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: senha,
      options: {
          persistSession: lembrar
      }
  });

  // se der erro mostra a mensagem e para
    if (error) {
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

// login com Google
document.getElementById("btn-google").addEventListener("click", async () => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: window.location.origin + "/dashboard.html"
    }
  });

  if (error) {
    mostrarToast(' Erro ao entrar com Google, caso persista, entre em contato com o suporte.', 'erro')
  }
});