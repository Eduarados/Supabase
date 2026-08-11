-- ==========================================================
-- Schema: proprietario (1) -> carros (N)
-- Execute isto no SQL Editor do seu projeto Supabase
-- ==========================================================

create table if not exists dono (
  id        bigint generated always as identity primary key,
  nome      text not null,
  telefone  text,
  endereco  text
);

create table if not exists pet (
  id             bigint generated always as identity primary key,
  nome            text not null,
  especie             text,
  dono_id   bigint references dono(id) on delete restrict
);

-- "on delete restrict" impede a exclusão de um proprietario que ainda
-- tenha carros vinculados diretamente no banco -- uma segunda camada de
-- proteção além da checagem feita no app antes de chamar o delete.

-- Este projeto acessa a API do Supabase diretamente, sem login/JWT.
-- Por padrão, tabelas novas no Supabase já nascem com RLS desativado.
-- Confirme em Authentication > Policies (ou Table Editor > sua tabela)
-- que RLS está OFF em "proprietario" e "carros" antes de rodar o app.

-- Dados de exemplo (opcional, para testar rapidamente)
insert into proprietario (nome, telefone, endereco) values
  ('Ana Souza', '(11) 91234-5678', 'Rua das Flores, 123 - São Paulo/SP'),
  ('Bruno Lima', '(21) 99876-5432', 'Av. Atlântica, 500 - Rio de Janeiro/RJ');

insert into carros (placa, modelo, marca, proprietario_id) values
  ('ABC1D23', 'Onix', 'Chevrolet', 1),
  ('XYZ9K88', 'Gol', 'Volkswagen', 1),
  ('JJK4L56', 'Corolla', 'Toyota', 2);
