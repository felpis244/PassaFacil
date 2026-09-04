function mostrarToast(mensagem, tipo = "sucesso") {
  const icone = tipo === "sucesso" ? "✅" : "❌";

  const toast = document.createElement("div");
  toast.classList.add("toast", tipo);
  toast.innerHTML = `<span>${icone}</span><span>${mensagem}</span>`;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = "sair 0.3s ease forwards";
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}