// cria o overlay de carregamento uma única vez e reaproveita
function getLoaderOverlay() {
  let overlay = document.getElementById("loader-overlay");

  if (!overlay) {
    overlay = document.createElement("div");
    overlay.id = "loader-overlay";
    overlay.classList.add("loader-overlay");
    overlay.innerHTML = `
      <div class="loader-caixa">
        <div class="loader-spinner"></div>
        <span class="loader-texto" id="loader-texto">Carregando...</span>
      </div>
    `;
    document.body.appendChild(overlay);
  }

  return overlay;
}

// mostra a tela de carregamento em tela cheia
function mostrarLoading(mensagem = "Carregando...") {
  const overlay = getLoaderOverlay();
  document.getElementById("loader-texto").textContent = mensagem;
  overlay.classList.add("ativo");
}

// esconde a tela de carregamento
function esconderLoading() {
  const overlay = document.getElementById("loader-overlay");
  if (overlay) overlay.classList.remove("ativo");
}

// coloca um botão específico em estado de "carregando" (spinner dentro do próprio botão)
function iniciarBotaoCarregando(botao) {
  if (!botao) return;
  botao.dataset.textoOriginal = botao.textContent;
  botao.classList.add("btn-carregando");
  botao.disabled = true;
}

// tira o botão do estado de "carregando"
function pararBotaoCarregando(botao) {
  if (!botao) return;
  botao.classList.remove("btn-carregando");
  botao.disabled = false;
  if (botao.dataset.textoOriginal) {
    botao.textContent = botao.dataset.textoOriginal;
  }
}
