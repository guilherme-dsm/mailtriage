import { Router, Request, Response } from 'express';
import { pool } from '../db';

const router = Router(); //como se fosse o BluePrint do Flask

router.post('/', async (req: Request, res: Response) => {
  const { nome, tipo, valores } = req.body;

  if (!nome || !tipo || !Array.isArray(valores) || valores.length === 0) {
    return res.status(400).json({ erro: 'nome, tipo e ao menos um valor são obrigatórios' });
  }

  const client = await pool.connect(); //para transacoes voce precisa rodar em uma conexao especifica

  try {
    await client.query('BEGIN');//inica transacao

    const resultadoTrigger = await client.query(
      'INSERT INTO triggers (nome, tipo) VALUES ($1, $2) RETURNING id',//pede ao Postgres pra devolver o id gerado pelo INSERT, que a gente precisa pra associar os valores ao trigger certo.
      [nome, tipo]
    );
    const triggerId = resultadoTrigger.rows[0].id;

    for (const valor of valores) {
      await client.query(
        'INSERT INTO trigger_valores (trigger_id, valor) VALUES ($1, $2)',
        [triggerId, valor]
      );
    }

    await client.query('COMMIT');//finaliza transacao

    res.status(201).json({ id: triggerId, nome, tipo, valores });//devolve resposta com tudo no formato json
  } catch (erro) {
    await client.query('ROLLBACK');
    console.error(erro);
    res.status(500).json({ erro: 'Erro ao criar trigger' });
  } finally {
    client.release();//devolve conexao pro pool
  }
});

export default router;