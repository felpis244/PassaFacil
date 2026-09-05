const respostas = {
  // Gramática
  "crase": "A crase é o acento grave (`) usado antes de palavras femininas quando há fusão da preposição 'a' com o artigo 'a'. Ex: 'Fui à escola' = a (preposição) + a (artigo) escola.",
  "concordância": "Concordância verbal é a relação entre o verbo e o sujeito. O verbo deve concordar em número e pessoa com o sujeito. Ex: 'Os alunos estudam' (plural).",
  "regência": "Regência verbal é a relação entre o verbo e seus complementos. Ex: 'assistir a um filme' (assistir exige preposição 'a').",
  "pontuação": "A vírgula separa termos de mesma função, orações coordenadas e elementos explicativos. O ponto final encerra períodos. O ponto e vírgula separa orações com sentido completo.",
  "sujeito": "Sujeito é o termo da oração sobre o qual o predicado declara algo. Pode ser simples, composto, oculto ou indeterminado.",
  "predicado": "Predicado é tudo que se declara sobre o sujeito. Pode ser verbal (tem verbo de ação), nominal (tem verbo de ligação) ou verbo-nominal.",
  "adjunto": "Adjunto adnominal é o termo que modifica um substantivo. Ex: 'O livro azul' — 'azul' é adjunto adnominal de 'livro'.",
  "pronome": "Pronomes substituem ou acompanham substantivos. Podem ser pessoais (eu, tu, ele), possessivos (meu, seu), demonstrativos (este, esse, aquele), entre outros.",
  "adverbio": "Advérbio modifica verbo, adjetivo ou outro advérbio. Indica circunstâncias de tempo, lugar, modo, intensidade, etc.",
  "substantivo": "Substantivo é a palavra que nomeia seres, objetos, lugares, sentimentos e ações. Pode ser comum, próprio, concreto, abstrato, coletivo.",
  "adjetivo": "Adjetivo é a palavra que caracteriza ou qualifica o substantivo. Ex: 'menino inteligente' — 'inteligente' é adjetivo.",
  "verbo": "Verbo é a palavra que indica ação, estado ou fenômeno. Possui conjugações de tempo, modo, número e pessoa.",

  // Figuras de linguagem
  "metáfora": "Metáfora é uma comparação implícita entre dois elementos sem usar conectivos. Ex: 'Ele é uma pedra' (comparando a pessoa com uma pedra sem usar 'como').",
  "comparação": "Comparação (ou símile) é uma figura de linguagem que compara dois elementos usando conectivos como 'como', 'tal qual', 'assim como'. Ex: 'Ele é forte como um touro'.",
  "ironia": "Ironia é dizer o contrário do que se pensa, geralmente com intenção crítica ou humorística. Ex: 'Que ótimo!' dito em situação ruim.",
  "hipérbole": "Hipérbole é o exagero intencional para dar ênfase. Ex: 'Estou morrendo de fome', 'Já te falei um milhão de vezes'.",
  "metonímia": "Metonímia é a substituição de uma palavra por outra com relação de proximidade. Ex: 'Ler Machado de Assis' (lendo obras, não o autor).",
  "eufemismo": "Eufemismo é suavizar uma expressão para torná-la menos impactante. Ex: 'Ele passou desta para melhor' (ao invés de 'morreu').",
  "antítese": "Antítese é a aproximação de ideias opostas. Ex: 'O amor é fogo que arde sem se ver' (amor x fogo, dois opostos).",
  "paradoxo": "Paradoxo é uma contradição aparente que contém uma verdade. Ex: 'Morro porque não morro' (de Camões).",
  "personificação": "Personificação (ou prosopopeia) atribui características humanas a seres não humanos. Ex: 'O vento sussurrava segredos'.",
  "anáfora": "Anáfora é a repetição de palavras no início de frases ou versos para dar ênfase. Ex: 'Quero paz. Quero amor. Quero felicidade'.",
  "aliteração": "Aliteração é a repetição de sons consonantais. Ex: 'O rato roeu a roupa do rei de Roma'.",

  // Interpretação de texto
  "interpretação": "Interpretação de texto é a habilidade de compreender o significado explícito e implícito de um texto. Preste atenção ao contexto, às palavras e à ideia central.",
  "inferência": "Inferência é a capacidade de deduzir informações que não estão explícitas no texto, mas que podem ser compreendidas pelo contexto.",
  "coesão": "Coesão textual é a ligação harmoniosa entre as partes do texto usando conectivos, pronomes e outros recursos. Ex: 'mas', 'porém', 'entretanto'.",
  "coerência": "Coerência textual é a lógica e unidade de sentido do texto. Um texto coerente tem ideias que se complementam sem contradições.",
  "intertextualidade": "Intertextualidade é quando um texto faz referência a outro texto, autor ou obra. Ex: uma música que cita um poema famoso.",
  "contexto": "Contexto é o conjunto de circunstâncias que envolvem um texto e ajudam a entender seu significado.",

  // Literatura
  "modernismo": "O Modernismo brasileiro começou em 1922 com a Semana de Arte Moderna. Buscou romper com o passado e valorizar a cultura brasileira. Autores: Oswald de Andrade, Mário de Andrade.",
  "romantismo": "O Romantismo (1836-1881) valorizava sentimentos, natureza e nacionalismo. Autores: José de Alencar, Gonçalves Dias, Castro Alves.",
  "realismo": "O Realismo (1881-1902) retratava a realidade de forma objetiva e crítica. Principal autor: Machado de Assis.",
  "naturalismo": "O Naturalismo retratava a sociedade de forma determinista, focando nos instintos humanos. Autor: Aluísio Azevedo ('O Cortiço').",
  "parnasianismo": "O Parnasianismo valorizava a forma perfeita do poema, com rimas ricas e vocabulário erudito. Autores: Olavo Bilac, Raimundo Correia.",
  "simbolismo": "O Simbolismo usava símbolos e musicalidade para expressar o mundo interior. Autor: Cruz e Sousa.",
  "machado": "Machado de Assis é o maior nome do Realismo brasileiro. Obras: 'Dom Casmurro', 'Memórias Póstumas de Brás Cubas', 'Quincas Borba'.",

  // Redação
  "redação": "A redação do ENEM é dissertativa-argumentativa. Deve ter introdução, dois parágrafos de desenvolvimento com argumentos e conclusão com proposta de intervenção.",
  "dissertação": "Dissertação é um texto que defende um ponto de vista sobre um tema usando argumentos. É o tipo de redação cobrado no ENEM.",
  "argumentação": "Argumentação é o conjunto de razões usadas para defender uma ideia. Bons argumentos usam dados, exemplos e citações.",
  "introdução": "A introdução da redação deve apresentar o tema e a tese (seu ponto de vista). Pode começar com um dado, citação ou contextualização.",
  "conclusão": "A conclusão da redação deve retomar a tese e apresentar uma proposta de intervenção detalhada com agente, ação, meio e finalidade.",
  "conectivos": "Conectivos ligam ideias no texto. Adição: 'além disso', 'também'. Oposição: 'porém', 'entretanto'. Conclusão: 'portanto', 'logo'. Causa: 'porque', 'pois'.",

  // Saudações
  "oi": "Olá! Como posso te ajudar com português hoje? 😊",
  "olá": "Olá! Pode me perguntar sobre gramática, figuras de linguagem, interpretação, literatura ou redação!",
  "bom dia": "Bom dia! Pronto para estudar português? Me faz uma pergunta! 📚",
  "boa tarde": "Boa tarde! Me faz uma pergunta sobre português!",
  "boa noite": "Boa noite! Estudando até tarde? Me pergunte o que precisar!",
  "obrigado": "De nada! Se tiver mais dúvidas é só perguntar! 😊",
  "valeu": "Disponha! Bons estudos! 🎓",
  "tchau": "Tchau! Bons estudos e boa sorte no ENEM! 🚀"
};

// tira os acentos de um texto, pra poder comparar palavras
// mesmo que o usuário digite sem acentuação (ex: "concordancia" vs "concordância")
//
// como funciona: o .normalize("NFD") separa a letra do acento
// (ex: "â" vira "a" + um caractere invisível de acento "^")
// e o replace() com essa regex remove só esses acentos separados,
// deixando a letra base sozinha.
function removerAcentos(texto) {
  return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

const chatBox = document.getElementById("chat-box");
const userInput = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");

sendBtn.addEventListener("click", enviarMensagem);
userInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") enviarMensagem();
});

function enviarMensagem() {
  const texto = userInput.value.trim();
  if (texto === "") return;

  // Mostra a mensagem 
  adicionarMensagem(texto, "user");
  userInput.value = "";

  // Busca a resposta
  const resposta = buscarResposta(texto.toLowerCase());

  adicionarMensagem(resposta, "bot");
  
}

function adicionarMensagem(texto, tipo) {
  const div = document.createElement("div");
  div.classList.add("mensagem", tipo);
  div.textContent = texto;
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function buscarResposta(mensagem) {
  // remove os acentos da mensagem do usuário uma única vez
  const mensagemSemAcento = removerAcentos(mensagem);

  for (const chave in respostas) {
    // remove os acentos da palavra-chave também, pra comparar "igual com igual"
    const chaveSemAcento = removerAcentos(chave);

    if (mensagemSemAcento.includes(chaveSemAcento)) {
      return respostas[chave];
    }
  }
  return "Hmm, não encontrei essa dúvida. Tente perguntar sobre: gramática, crase, concordância, metáfora, ironia, interpretação de texto, modernismo, redação, entre outros! 📚";
}