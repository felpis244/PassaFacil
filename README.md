// Simulação local do Supabase usando localStorage
window.supabase = {
  createClient: function() {
    return {
      from: function(tableName) {
        return {
          select: async function(fields = '*') {
            const data = JSON.parse(localStorage.getItem(tableName)) || [];
            return { data, error: null };
          },
          insert: async function(rows) {
            const currentData = JSON.parse(localStorage.getItem(tableName)) || [];
            const newRows = rows.map(row => ({ id: Date.now() + Math.random(), ...row }));
            const updatedData = [...currentData, ...newRows];
            localStorage.setItem(tableName, JSON.stringify(updatedData));
            return { data: newRows, error: null };
          },
          update: async function(updates) {
            return {
              eq: async function(column, value) {
                let currentData = JSON.parse(localStorage.getItem(tableName)) || [];
                currentData = currentData.map(item => {
                  if (item[column] === value) {
                    return { ...item, ...updates };
                  }
                  return item;
                });
                localStorage.setItem(tableName, JSON.stringify(currentData));
                return { data: updates, error: null };
              }
            };
          },
          delete: async function() {
            return {
              eq: async function(column, value) {
                let currentData = JSON.parse(localStorage.getItem(tableName)) || [];
                currentData = currentData.filter(item => item[column] !== value);
                localStorage.setItem(tableName, JSON.stringify(currentData));
                return { data: null, error: null };
              }
            };
          }
        };
      }
    };
  }
};

