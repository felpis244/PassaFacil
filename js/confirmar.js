// Componente de confirmação genérico.
// Uso: const ok = await confirmarAcao("Tem certeza que deseja sair?");
// Se a pessoa clicar em "Confirmar", a Promise resolve com true.
// Se clicar em "Cancelar" (ou fora da caixa), resolve com false.
//
// Por que uma Promise? Porque assim dá pra escrever o código de quem
// usa isso de um jeito bem parecido com um "if" comum, usando await:
//
//   const confirmou = await confirmarAcao("Sair?");
//   if (!confirmou) return;
//   // ...continua a ação normalmente
function confirmarAcao(mensagem) {
  return new Promise((resolve) => {
    // cria a estrutura do modal na hora que ele é chamado
    const overlay = document.createElement("div");
    overlay.classList.add("confirmar-overlay");
    overlay.innerHTML = `
      <div class="confirmar-caixa">
        <p class="confirmar-mensagem">${mensagem}</p>
        <div class="confirmar-botoes">
          <button class="confirmar-btn cancelar">Cancelar</button>
          <button class="confirmar-btn confirmar">Confirmar</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    // pequeno delay pra garantir que a transição do CSS rode (efeito de aparecer)
    requestAnimationFrame(() => overlay.classList.add("ativo"));

    // função que fecha o modal e resolve a Promise com o resultado escolhido
    function fechar(resultado) {
      overlay.classList.remove("ativo");
      setTimeout(() => overlay.remove(), 200); // espera a transição terminar antes de tirar do DOM
      resolve(resultado);
    }

    overlay.querySelector(".cancelar").addEventListener("click", () => fechar(false));
    overlay.querySelector(".confirmar").addEventListener("click", () => fechar(true));

    // clicar no fundo escuro (fora da caixa) também cancela
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) fechar(false);
    });
  });
}
