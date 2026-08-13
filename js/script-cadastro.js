import { supabase } from './supabase.js'

const form = document.getElementById('form-cadastro')

form.addEventListener('submit', async (e) => {
  e.preventDefault()
  // Pega o que o usuario digitou 
  const nome = document.getElementById('nome').value
  const email = document.getElementById('email').value
  const senha = document.getElementById('senha').value

  // passa por um pequena validação  
  const { data, error } = await supabase.auth.signUp({
  email,
  password: senha,
  options: {
    data: { nome }
  }
})
// mensagens de erro se o cadastro der errado 
if (error) {
  mostrarToast(' Erro ao cadastrar a conta:' + error.message)
}

  const { error: erroP } = await supabase
    .from('perfis')
    .insert({ id: data.user.id, nome: nome })

  if (erroP) {
    mostrarToast('Erro ao salvar perfil: ' + erroP.message)
    return
  }
  // se der tudo certo aparece essa mensagem e vai pra tela principal
  mostrarToast("Cadastro realizado com sucesso! Bem-vindo ao PassaFácil! 🎓");
  window.location.href = 'dashboard.html'
})

// Cadastro com Google
document.getElementById("btn-google").addEventListener("click", async () => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: window.location.origin + "/dashboard.html"
    }
  });

  if (error) {
    mostrarToast("Erro ao cadastrar com Google: " + error.message);
  }
});
