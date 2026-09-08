// Simulação local do Supabase (para tabelas e login)
window.supabase = {
  createClient: function() {
    return {
      // Simula a parte de Login / Cadastro (Auth)
      auth: {
        signUp: async function({ email, password, options }) {
          const users = JSON.parse(localStorage.getItem('mock_users')) || [];
          const newUser = { id: Date.now().toString(), email, ...options?.data };
          users.push({ ...newUser, password });
          localStorage.setItem('mock_users', JSON.stringify(users));
          localStorage.setItem('mock_session_user', JSON.stringify(newUser));
          return { data: { user: newUser, session: {} }, error: null };
        },
        signInWithPassword: async function({ email, password }) {
          const users = JSON.parse(localStorage.getItem('mock_users')) || [];
          const user = users.find(u => u.email === email && u.password === password);
          if (!user) {
            return { data: { user: null, session: null }, error: { message: "Usuário ou senha inválidos" } };
          }
          localStorage.setItem('mock_session_user', JSON.stringify(user));
          return { data: { user, session: {} }, error: null };
        },
        getUser: async function() {
          const user = JSON.parse(localStorage.getItem('mock_session_user'));
          return { data: { user }, error: null };
        },
        signOut: async function() {
          localStorage.removeItem('mock_session_user');
          return { error: null };
        }
      },

      // Simula a parte de Banco de Dados (Tabelas)
      from: function(tableName) {
        return {
          select: function(fields = '*') {
            const data = JSON.parse(localStorage.getItem(tableName)) || [];
            return {
              eq: function(column, value) {
                const filtered = data.filter(item => item[column] === value);
                return Promise.resolve({ data: filtered, error: null });
              },
              then: function(callback) {
                return Promise.resolve({ data, error: null }).then(callback);
              }
            };
          },
          insert: async function(rows) {
            const currentData = JSON.parse(localStorage.getItem(tableName)) || [];
            const newRows = rows.map(row => ({ id: Date.now() + Math.random(), ...row }));
            const updatedData = [...currentData, ...newRows];
            localStorage.setItem(tableName, JSON.stringify(updatedData));
            return { data: newRows, error: null };
          }
        };
      }
    };
  }
};


