//nesse arq é centralizado a config da conexão com BdD
import { Pool } from 'pg'; //importa classe Pool do driver pg, que é uma ferramenta que conversa com Postgres //Pool gerencia múltiplas conexões reaproveitáveis com o banco, em vez de você abrir/fechar uma conexão nova a cada query.
import dotenv from 'dotenv';

dotenv.config();

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});