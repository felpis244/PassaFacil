// Pega o resultado salvo no localStorage
const dados = JSON.parse(localStorage.getItem('resultado'));

// Se não tiver dados, volta pra dashboard
if (!dados) {
  window.location.href = 'dashboard.html';
}

// Pega os dados
const { historico, xpGanho, materia } = dados;

// Calcula acertos e erros
const acertos = historico.filter(q => q.acertou).length;
const erros = historico.filter(q => !q.acertou).length;
const taxa = Math.round((acertos / historico.length) * 100);

// Atualiza os cards de stats
document.getElementById('resultado-materia').textContent = materia;
document.getElementById('acertos').textContent = acertos;
document.getElementById('erros').textContent = erros;
document.getElementById('xp-ganho').textContent = xpGanho + ' XP';
document.getElementById('taxa').textContent = taxa + '%';

// Monta o gabarito
const lista = document.getElementById('gabarito-lista');

historico.forEach((q, index) => {
  const item = document.createElement('div');
  item.classList.add('gabarito-item');

  item.innerHTML = `
    <span class="gabarito-icone">${q.acertou ? '✅' : '❌'}</span>
    <span class="gabarito-texto"><strong>Questão ${index + 1}:</strong> ${q.enunciado}</span>
  `;

  lista.appendChild(item);
});

// Limpa o localStorage após mostrar
localStorage.removeItem('resultado');