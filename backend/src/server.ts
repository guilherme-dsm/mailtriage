//arq que define as rotas da API
import express, { Request, Response } from 'express';
import triggersRouter from './routes/triggers';

const app = express(); //app é o objeto que se usa daqui pra frente pra registrar rotas, middlewares, etc.
const PORT = 3000;

app.use(express.json()); //Registra um middleware: uma função que roda em toda requisição antes de chegar na rota. express.json() é um middleware pronto do próprio Express que faz o parse do corpo (body) da requisição quando ele vem em JSON, e disponibiliza isso em req.body. Sem essa linha, se alguém mandar um POST com JSON, req.body viria undefined.
app.use('/triggers', triggersRouter);

app.get('/health', (req: Request, res: Response) => { //app.get(...) — registra uma rota que responde a requisições HTTP GET, na URL /health
  res.json({ status: 'ok' }); //req (a requisição recebida, com headers, body, query params, etc.)
});                           //res (o objeto usado pra construir a resposta).  
                              //aqui você não usa return pra enviar a resposta, o próprio res.json(...) já dispara o envio.

app.listen(PORT, () => { //inicia o servidor de verdade, fazendo ele "escutar" (ficar esperando requisições) na porta definida.segundo argumento é outra função callback, que roda uma única vez, assim que o servidor sobe com sucesso — geralmente usada só pra imprimir uma mensagem de confirmação no terminal.
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});

