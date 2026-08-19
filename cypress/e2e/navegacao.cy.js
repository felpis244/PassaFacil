describe('Teste de navegação', () => {

  it.only('acessar perfil pelo dashboard', () => {
    cy.visit('https://passafacilapp.vercel.app/login.html')
    cy.get('#email').type('felipe37977bsb@gmail.com')
    cy.get('#senha').type('Fe300609')
    cy.get('#entrar').click()
    cy.url({ timeout: 10000 }).should('include', 'dashboard.html')
    cy.get('a[href="perfil.html"]').first().click()
    cy.url({ timeout: 10000 }).should('include', 'perfil.html')
  })

    it.only('acessar ranking pelo dashboard', () => {
    cy.visit('https://passafacilapp.vercel.app/login.html')
    cy.get('#email').type('felipe37977bsb@gmail.com')
    cy.get('#senha').type('Fe300609')
    cy.get('#entrar').click()
    cy.url({ timeout: 10000 }).should('include', 'dashboard.html')
    cy.get('.mlateral-link[href="ranking.html"]').click()
    cy.url({ timeout: 10000 }).should('include', 'ranking.html')
  })

    it.only('acessar seleção pelo dashboard', () => {
    cy.visit('https://passafacilapp.vercel.app/login.html')
    cy.get('#email').type('felipe37977bsb@gmail.com')
    cy.get('#senha').type('Fe300609')
    cy.get('#entrar').click()
    cy.url({ timeout: 10000 }).should('include', 'dashboard.html')
    cy.get('.rapido-item[href="selecao.html"]').click()
    cy.url({ timeout: 10000 }).should('include', 'selecao.html')
  })


})