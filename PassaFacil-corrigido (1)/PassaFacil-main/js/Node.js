
app.set('trust proxy', true); // Confia no proxy da hospedagem para pegar o IP certo do cliente

app.post('/auth/login', async (req, res) => {
    const clientIp = req.ip; // Pega o IP do usuário que o Express preparou para a gente

    const { data, error } = await supabase.auth.admin.signInWithPassword({
        email: req.body.email,
        password: req.body.password,
    }, {
        // É esse cabeçalho aqui que salva a nossa pele contra bloqueios em massa:
        headers: { 'Sb-Forwarded-For': clientIp } 
    });
    
    // ... o resto do código de vocês segue aqui embaixo
});
