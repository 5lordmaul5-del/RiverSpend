-- RiverSpaceGalaxyGames core schema. Apply through Supabase SQL editor/migrations.
-- Real-money amounts are kept separate from virtual game credits.
create extension if not exists pgcrypto;

create table if not exists public.rsgg_players (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique references auth.users(id) on delete set null,
  display_name text,
  status text not null default 'active' check (status in ('active','suspended','deleted')),
  created_at timestamptz not null default now(),
  last_seen_at timestamptz
);

create table if not exists public.rsgg_worlds (
  id text primary key,
  name text not null,
  biome text not null,
  description text not null,
  access_state text not null default 'planned' check (access_state in ('available','planned','locked')),
  created_at timestamptz not null default now()
);

create table if not exists public.rsgg_creatures (
  id text primary key,
  name text not null,
  faction text not null check (faction in ('guardian','raider','neutral','mythic','undead','demon','celestial','alien')),
  species text not null,
  rarity text not null default 'common',
  powers jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.rsgg_catalog (
  id text primary key,
  title text not null,
  category text not null,
  description text not null default '',
  virtual_credit_price bigint,
  real_price_minor bigint,
  real_currency text,
  active boolean not null default false,
  created_at timestamptz not null default now(),
  constraint rsgg_catalog_price_check check (
    (real_price_minor is null and real_currency is null) or
    (real_price_minor >= 0 and real_currency in ('EUR','USD','GBP','JPY'))
  )
);

create table if not exists public.rsgg_wallets (
  player_id uuid primary key references public.rsgg_players(id) on delete cascade,
  virtual_credits bigint not null default 0 check (virtual_credits >= 0),
  updated_at timestamptz not null default now()
);

create table if not exists public.rsgg_transactions (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references public.rsgg_players(id),
  transaction_type text not null check (transaction_type in ('credit_earn','credit_spend','real_payment','refund','admin_adjustment')),
  amount_minor bigint not null,
  currency text not null,
  provider text,
  provider_reference text unique,
  status text not null default 'pending' check (status in ('pending','paid','failed','refunded','cancelled')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.rsgg_purchases (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references public.rsgg_players(id),
  catalog_item_id text not null references public.rsgg_catalog(id),
  quantity integer not null default 1 check (quantity between 1 and 10000),
  total_minor bigint,
  currency text,
  payment_status text not null default 'not_started' check (payment_status in ('not_started','pending','paid','failed','refunded','cancelled')),
  fulfillment_status text not null default 'not_granted' check (fulfillment_status in ('not_granted','granted','revoked')),
  provider_reference text unique,
  created_at timestamptz not null default now()
);

create table if not exists public.rsgg_game_events (
  id bigint generated always as identity primary key,
  player_id uuid references public.rsgg_players(id) on delete set null,
  event_type text not null,
  world_id text references public.rsgg_worlds(id),
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists rsgg_players_last_seen_idx on public.rsgg_players(last_seen_at desc);
create index if not exists rsgg_purchases_created_idx on public.rsgg_purchases(created_at desc);
create index if not exists rsgg_transactions_created_idx on public.rsgg_transactions(created_at desc);
create index if not exists rsgg_events_created_idx on public.rsgg_game_events(created_at desc);

alter table public.rsgg_players enable row level security;
alter table public.rsgg_worlds enable row level security;
alter table public.rsgg_creatures enable row level security;
alter table public.rsgg_catalog enable row level security;
alter table public.rsgg_wallets enable row level security;
alter table public.rsgg_transactions enable row level security;
alter table public.rsgg_purchases enable row level security;
alter table public.rsgg_game_events enable row level security;

-- No client policies are intentionally granted yet. Access is server-side only,
-- after validating the signed-in user against river_ai_owner_access.

insert into public.rsgg_worlds (id,name,biome,description,access_state) values
('E-01','Planet E-01','temperate','Primo mondo dimostrativo per esplorazione e raccolta cristalli.','available'),
('AQUA-02','Pelagia','ocean','Mondi marini, città sommerse e creature abissali.','planned'),
('CELEST-03','Aetherion','cloud','Mondi celesti, isole sospese, nubi e tempeste.','planned'),
('IGNIS-04','Ignis','fire','Pianeti vulcanici, lava, minerali e deserti incandescenti.','planned'),
('VERDE-05','Viridia','vegetal','Foreste, paludi, piante carnivore, predatori e prede.','planned'),
('NEBULA-06','Nebulon','nebula','Mondi di nebbia, gas e fenomeni cosmici.','planned'),
('ROGUE-07','Rogue Haven','outlaw','Pianeti di furfanti, contrabbandieri e carichi contesi.','planned'),
('SANCT-08','Sanctuary','celestial','Regni prosperi, ordini di guardiani e alleanze.','planned')
on conflict (id) do nothing;

insert into public.rsgg_creatures (id,name,faction,species,rarity,powers) values
('ALIEN-GREY','Grigio','alien','Alieno grigio','uncommon','["telepatia narrativa"]'),
('ALIEN-RED','Rosso','alien','Alieno rosso','rare','["scudo energetico"]'),
('ALIEN-GREEN','Verde','alien','Alieno verde','uncommon','["mimetismo"]'),
('ALIEN-BLUE','Blu','alien','Alieno blu','rare','["impulso luminoso"]'),
('MOTH-KING','Re delle Falene','mythic','Falena gigante','mythic','["polvere di luce"]'),
('ORC-RAIDER','Orco predone','raider','Orco','common','["carica"]'),
('DRAGON-EMBER','Drago di brace','mythic','Drago','legendary','["soffio di fuoco"]'),
('KRAMPUS-SHADOW','Krampus d''ombra','undead','Creatura leggendaria','legendary','["paura scenica"]'),
('ARCHANGEL-AUREL','Arcangelo Aurel','celestial','Arcangelo','mythic','["barriera protettiva"]'),
('DEMON-VOID','Demone del Vuoto','demon','Demone','mythic','["campo di distorsione"]')
on conflict (id) do nothing;
