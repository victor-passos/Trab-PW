import express from "express";
import dotenv from "dotenv"
import { engine } from "express-handlebars"

dotenv.config(); // Carrega as variáveis de ambiente

const app = express();
const PORT = process.env.PORT ?? 3000

//Configuração das views (handlebars)
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', `${process.cwd()}/src/views`);


app.use(express.static(`${process.cwd()}/public`));
app.use('/game', express.static(`${process.cwd()}/game`));
app.get('/', (req, res) => {
    res.send('Servidor Bike Runner rodando! Acesse /about ou /game');
});

app.get('/about', (req, res) => {
    res.render('about');
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta http://localhost:${PORT}/`);
});