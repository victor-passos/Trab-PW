import http from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const PORT = 3000;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RAIZ = path.join(__dirname, '..', '..'); 

const TIPOS = {
    ".html": "text/html;charset=utf-8",
    ".css":  "text/css",
    ".js":   "application/javascript",
    ".png":  "image/png",
    ".jpg":  "image/jpeg",
    ".mp3":  "audio/mpeg",
    ".wav":  "audio/wav",
};

const server = http.createServer((req, res) => {
    const urlPath  = req.url === "/" ? "/index.html" : req.url;
    const filePath = path.join(RAIZ, urlPath);
    const ext      = path.extname(filePath);
    const contentType = TIPOS[ext] ?? "application/octet-stream";

    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404);
            res.end("404 - Arquivo não encontrado: " + filePath);
            return;
        }
        res.writeHead(200, { "Content-Type": contentType });
        res.end(data);
    });
});

server.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});