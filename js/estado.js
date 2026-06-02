export const ESTADOS ={
    INICIO:'inicio',
    JOGANDO:'jogando',
    PAUSA:'pausa',
    FIM:'fim',
};

let estadoAtual = ESTADOS.INICIO;
 
export function getEstado() {
    return estadoAtual;
}
 
export function definirEstado(novoEstado) {
    if (!Object.values(ESTADOS).includes(novoEstado)) {
        console.warn(`Estado desconhecido: ${novoEstado}`);
        return;
    }
    console.log(`Estado: ${estadoAtual} -> ${novoEstado}`);
    estadoAtual = novoEstado;
}
