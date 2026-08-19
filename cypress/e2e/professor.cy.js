describe('Teste do painel do professor', () => {

  it.only('acessar painel de alunos', () => {

    cy.visit('https://passafacilapp.vercel.app/login.html')

    cy.get('#email').type('felipekoizumipaschoal@gmail.com')
    cy.get('#senha').type('Fe300609')
    cy.get('#entrar').click()
    cy.url({ timeout: 10000 }).should('include', 'painel.html')
    cy.get('.mlateral-link[title="alunos"]').click()
    cy.url({ timeout: 10000 }).should('include', 'painel-alunos.html')
  })

})

describe('Teste do painel do professor', () => {

  it.only('acessar painel de questões', () => {

    cy.visit('https://passafacilapp.vercel.app/login.html')
    cy.get('#email').type('felipekoizumipaschoal@gmail.com')
    cy.get('#senha').type('Fe300609')
    cy.get('#entrar').click()
    cy.url({ timeout: 10000 }).should('include', 'painel.html')
    cy.get('.mlateral-link[title="questoes"]').click()
    cy.url({ timeout: 10000 }).should('include', 'painel-questoes.html')
  })

})

describe('Teste do painel do professor', () => {

  it.only('cadastrar uma questão', () => {
    cy.visit('https://passafacilapp.vercel.app/login.html')
    cy.get('#email').type('felipekoizumipaschoal@gmail.com')
    cy.get('#senha').type('Fe300609')
    cy.get('#entrar').click()
    cy.url({ timeout: 10000 }).should('include', 'painel.html')
    cy.visit('https://passafacilapp.vercel.app/painel-questoes.html')
    cy.url({ timeout: 10000 }).should('include', 'painel-questoes.html')

    cy.get('#form-materia').select('Gramática')

    cy.get('#form-conteudo')
      .type('Concordância verbal')

    cy.get('#form-enunciado')
      .type('Assinale a alternativa que apresenta a concordância verbal correta.')

    cy.get('#form-alt-a')
      .type('Os alunos estudou para a prova.')

    cy.get('#form-alt-b')
      .type('Os alunos estudaram para a prova.')

    cy.get('#form-alt-c')
      .type('Os alunos estudava para a prova.')

    cy.get('#form-alt-d')
      .type('Os alunos estudará para a prova.')

    cy.get('#form-resposta').select('b')

    cy.get('#form-explicacao')
      .type('O verbo deve concordar com o sujeito plural "os alunos", portanto a forma correta é "estudaram".')

    cy.get('#form-dificuldade').select('intermediario')

    cy.get('#btn-adicionar').click()
  })

})