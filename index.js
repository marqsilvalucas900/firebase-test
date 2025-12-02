// index.js (Atualizado para Realtime Database)

const express = require('express');
const admin = require('firebase-admin');

// 1. Inicializa o Firebase Admin SDK (Conexão ao RTDB)
try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_CREDENTIALS);
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        // A principal mudança: precisamos da URL base do seu RTDB
        databaseURL: "https://laravel-base-crud-default-rtdb.firebaseio.com" 
    });
    console.log("Firebase Admin (RTDB) inicializado com sucesso.");
} catch (error) {
    console.error("ERRO ao inicializar Firebase Admin:", error.message);
    process.exit(1);
}

const db = admin.database(); // Objeto para interagir com o RTDB
const app = express();
app.use(express.json());

// 2. Endpoint para ler mensagens do RTDB
app.get('/api/mensagens', async (req, res) => {
    try {
        // Busca todos os dados no nó 'mensagens'
        const ref = db.ref('mensagens');
        const snapshot = await ref.once('value'); // Lê os dados uma vez
        
        // O método val() retorna a árvore JSON inteira sob o nó
        const data = snapshot.val(); 

        // O RTDB retorna um objeto. Se for null, retorna um array vazio.
        const mensagensArray = data ? Object.values(data) : [];

        res.status(200).json({ status: 'ok', data: mensagensArray });
    } catch (error) {
        console.error("Erro ao buscar mensagens:", error);
        res.status(500).send("Erro interno do servidor.");
    }
});

// 3. Endpoint para criar uma mensagem no RTDB (Opcional, mas útil)
app.post('/api/mensagens', async (req, res) => {
    try {
        const { texto } = req.body;
        if (!texto) {
            return res.status(400).send("O campo 'texto' é obrigatório.");
        }

        // Usa 'push()' para gerar uma chave única (ID)
        await db.ref('mensagens').push({ 
            texto: texto,
            timestamp: new Date().toISOString()
        });

        res.status(201).json({ status: 'success', message: 'Mensagem criada com sucesso.' });
    } catch (error) {
        console.error("Erro ao criar mensagem:", error);
        res.status(500).send("Erro interno do servidor.");
    }
});

// 4. Inicia o Servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});