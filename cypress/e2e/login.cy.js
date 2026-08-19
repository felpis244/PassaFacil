describe('teste de login', () => {
  it('login com sucesso', () => {
    cy.visit('https://passafacilapp.vercel.app/login.html')
    cy.get('#email').type('felipe37977bsb@gmail.com')
    cy.get('#senha').type('Fe300609')
    cy.get('#entrar').click()

    cy.url({ timeout: 10000 }).should('include', 'dashboard.html')
  })

  it('login com falha', () => {
    cy.visit('https://passafacilapp.vercel.app/login.html')
    cy.get('#email').type('felipe37977bsb@gmail.com')
    cy.get('#senha').type('12345678')
    cy.get('#entrar').click()
  })

  it('login com campos vazios', () => {
    cy.visit('https://passafacilapp.vercel.app/login.html')
    cy.get('#entrar').click()
  })
})
