import { supabase } from './supabase.js'

const form = document.getElementById('form-cadastro')

form.addEventListener('submit', async (e) => {
  e.preventDefault()

  const nome = document.getElementById('nome').value.trim()
  const email = document.getElementById('email').value.trim()
  const senha = document.getElementById('senha').value

  // validação do nome
  if (nome.length < 3) {
    mostrarToast('❌ O nome precisa ter pelo menos 3 caracteres!', 'erro')
    return
  }

  // validação da senha forte
  if (senha.length < 6) {
    mostrarToast('❌ A senha precisa ter pelo menos 6 caracteres!', 'erro')
    return
  }
  // validação de letra maiuscula
  if (!/[A-Z]/.test(senha)) {
    mostrarToast('❌ A senha precisa ter pelo menos uma letra maiúscula!', 'erro')
    return
  }
  //validação de numeros 
  if (!/[0-9]/.test(senha)) {
    mostrarToast('❌ A senha precisa ter pelo menos um número!', 'erro')
    return
  }

  // cadastra no Supa
  const { data, error } = await supabase.auth.signUp({
    email,
    password: senha,
    options: {
      data: { nome }
    }
  })

  // mensagens se der erro
  if (error) {
    mostrarToast('❌ Erro ao cadastrar: ' + error.message, 'erro')
    return
  }

  // sucesso
  //vai um email do supa para a pessoa confirmar se realmente existe o email
  mostrarToast('✅ Cadastro realizado! Confirme seu email para continuar.', 'sucesso')
  setTimeout(() => {
    window.location.href = 'login.html'
  }, 2000)
})

// cadastro com Google
document.getElementById("btn-google").addEventListener("click", async () => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: window.location.origin + "/dashboard.html"
    }
  });

  if (error) {
    mostrarToast('❌ Erro ao cadastrar com Google: ' + error.message, 'erro')
  }
});