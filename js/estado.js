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
 
export function definirEstado(novoEstado, els) {
    estadoAtual = novoEstado;
    if (els) {
        els.telas.forEach(t => t.style.display = 'none');
        if (novoEstado === ESTADOS.INICIO)  els.inicio.style.display = 'flex';
        if (novoEstado === ESTADOS.PAUSA)   els.pausa.style.display  = 'flex';
        if (novoEstado === ESTADOS.FIM)     els.fim.style.display    = 'flex';
    }
}