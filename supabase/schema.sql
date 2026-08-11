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
  raça.           text,
  dono_id   bigint references dono(id) on delete restrict
);