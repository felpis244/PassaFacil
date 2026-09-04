-- =====================================================================
-- CORREÇÕES DO BANCO (Supabase) — PassaFácil
-- Rode cada bloco no SQL Editor do Supabase, um de cada vez, e leia o
-- resultado antes de passar pro próximo.
-- =====================================================================


-- =====================================================================
-- PARTE 0 — ESSA É A CAUSA RAIZ DOS DOIS BUGS. RODE ISSO PRIMEIRO.
-- =====================================================================
-- O console mostrou: GET .../perfis?select=vidas,vidas_atualizadas_em
-- → 400 (Bad Request), seguido de "Cannot read properties of null
-- (reading 'vidas')". Um 400 nesse tipo de busca do Supabase significa
-- que a coluna pedida NÃO EXISTE na tabela. Sem essa coluna:
--   - script-questao.js quebrava ANTES de buscar as questões da
--     matéria escolhida — por isso parecia que "a matéria não conecta".
--   - o sistema de vidas não tem onde salvar quando a vida foi
--     atualizada, então a regeneração/atualização nunca funciona direito.
-- Rode isto (é seguro rodar mesmo se a coluna já existir, por causa do
-- "if not exists"):

alter table perfis
add column if not exists vidas_atualizadas_em timestamptz default now();

update perfis
set vidas_atualizadas_em = now()
where vidas_atualizadas_em is null;

-- Se depois de rodar isso você ainda ver no console o erro:
--   "Could not find the 'vidas_atualizadas_em' column of 'perfis' in
--   the schema cache" (código PGRST204)
-- significa que a coluna JÁ FOI criada certinho, mas a API do Supabase
-- (PostgREST) guardou uma versão antiga do formato da tabela em cache
-- e ainda não percebeu a coluna nova. Force ela a recarregar agora:

notify pgrst, 'reload schema';

-- Se mesmo assim persistir, espere ~1 minuto (o cache recarrega
-- sozinho periodicamente) e teste de novo.

-- Depois de rodar isso, teste de novo escolher uma matéria em
-- selecao.html — só esse comando já deve resolver as duas coisas.


-- =====================================================================
-- PARTE 1 — Vidas começando com 4 em vez de 5
-- =====================================================================
-- Causa: o código em js/script-login.js já cria o perfil com vidas: 5
-- corretamente, mas login com Google não passa por esse código — o
-- perfil nesse caso costuma ser criado por um trigger/valor padrão no
-- banco, que pode estar configurado como 4.

-- 1.1) Veja o valor padrão atual da coluna "vidas"
select column_name, column_default
from information_schema.columns
where table_name = 'perfis' and column_name = 'vidas';

-- 1.2) Se o resultado acima mostrar "4", corrija o padrão da coluna:
alter table perfis alter column vidas set default 5;

-- 1.3) Procure um trigger que cria a linha em "perfis" quando um
-- usuário novo se cadastra (comum se chamar handle_new_user, ligado a
-- um trigger on_auth_user_created em auth.users). Rode isto pra achar:
select trigger_name, event_object_table, action_statement
from information_schema.triggers
where event_object_schema = 'auth' or action_statement ilike '%perfis%';

-- Se aparecer uma função inserindo "vidas" com valor 4, abra essa
-- função em Database > Functions no painel do Supabase e troque o 4
-- por 5 manualmente (o SQL exato depende de como ela foi escrita).

-- 1.4) Corrige contas que já nasceram com vidas erradas e ainda não
-- jogaram (xp e sequencia zerados, pra não mexer em quem já perdeu
-- vidas jogando de verdade):
update perfis
set vidas = 5
where vidas = 4 and xp = 0 and sequencia = 0;


-- =====================================================================
-- PARTE 2 — Vidas "voltam pra 4" depois de navegar (RLS bloqueando UPDATE)
-- =====================================================================
-- ✅ JÁ CONFIRMADO NO SEU PRINT: as policies abaixo já existem
-- ("Usuário atualiza próprio perfil", "Usuário lê próprio perfil" etc.)
-- Não precisa rodar nada aqui — deixei só como referência. Se um dia
-- quiser conferir de novo:
--   select * from pg_policies where tablename = 'perfis';


-- =====================================================================
-- PARTE 3 — Matéria não conecta com as questões
-- =====================================================================

-- 3.1) Veja os valores reais salvos em "materia" hoje
select id, materia from questoes order by id desc;

-- 3.2) Ache quais NÃO batem com as 5 opções válidas usadas no site
-- (selecao.html e painel-questoes.html usam exatamente esses 5 textos)
select id, materia from questoes
where materia not in (
  'Interpretação de Texto',
  'Gramática',
  'Literatura',
  'Redação',
  'Figuras de Linguagem'
);

-- 3.3) Pra cada linha que aparecer acima, corrija com um update
-- pontual (troque o id e o texto certo pelo caso real), exemplo:
-- update questoes set materia = 'Gramática' where id = 12;

-- 3.4) Trava a coluna pra não deixar mais isso acontecer (útil agora
-- que as questões vão ser cadastradas direto pelo Supabase, sem o
-- <select> do painel do professor pra evitar erro de digitação):
alter table questoes
add constraint materia_valida
check (materia in (
  'Interpretação de Texto',
  'Gramática',
  'Literatura',
  'Redação',
  'Figuras de Linguagem'
));

-- 3.5) ✅ JÁ CONFIRMADO NO SEU PRINT: existe a policy "Qualquer um pode
-- ler questoes" (select, using true) — não precisa criar de novo.
-- Se quiser conferir:
--   select * from pg_policies where tablename = 'questoes';

-- 3.6) Como o cadastro de questões agora é feito direto no Supabase
-- (Table Editor / SQL Editor), que usa a chave de serviço e ignora
-- RLS, NÃO é preciso criar uma policy de INSERT pra "questoes" — só a
-- de SELECT acima, pra o aluno conseguir ler.
