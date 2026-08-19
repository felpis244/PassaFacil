describe('Teste de proteção das páginas', () => {

  it('não permite acessar dashboard sem login', () => {
    cy.visit('https://passafacilapp.vercel.app/dashboard.html')
    cy.url({ timeout: 10000 }).should('include', 'login.html')
  })

  it('não permite acessar perfil sem login', () => {
    cy.visit('https://passafacilapp.vercel.app/perfil.html')
    cy.url({ timeout: 10000 }).should('include', 'login.html')
  })

  it('não permite acessar ranking sem login', () => {
    cy.visit('https://passafacilapp.vercel.app/ranking.html')
    cy.url({ timeout: 10000 }).should('include', 'login.html')
  })

  it('não permite acessar seleção sem login', () => {
  cy.visit('https://passafacilapp.vercel.app/selecao.html')

  cy.url({ timeout: 10000 }).should('include', 'login.html')
})

})