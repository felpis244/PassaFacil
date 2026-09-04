// Importa a conexão com o Supabase
import { supabase } from "./supabase.js";

// Verifica se o usuário está logado
const { data } = await supabase.auth.getSession();

// Se não tiver login volta pra tela de logar
if (!data.session) {
  window.location.href = "login.html";
}

window.escolher = function(materia) {

    localStorage.setItem('materiaSelecionada', materia);

    window.location.href = 'questao.html';

};