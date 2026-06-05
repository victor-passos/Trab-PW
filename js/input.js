const teclasPressionadas = {};
const teclasRecemPress    = {};
 
export function iniciarInput() {
    window.addEventListener('keydown', (e) => {
        if (!teclasPressionadas[e.code]) {
            teclasRecemPress[e.code] = true;
        }
        teclasPressionadas[e.code] = true;
    });
    window.addEventListener('keyup', (e) => {
        teclasPressionadas[e.code] = false;
        teclasRecemPress[e.code]   = false;
    });
}
 
export function teclaPressionada(codigo) {
    return !!teclasPressionadas[codigo];
}
 
export function teclaPressionadaAgora(codigo) {
    const resultado = !!teclasRecemPress[codigo];
    teclasRecemPress[codigo] = false; // consome o evento
    return resultado;
}
 
export const TECLAS = {
    CIMA: 'ArrowUp',
    BAIXO:'ArrowDown',
    ESQUERDA:'ArrowLeft',
    DIREITA:'ArrowRight',
    NORMAL:'KeyX',   
    TURBO:'KeyZ', 
    ESPACO:'Space',
    ENTER:'Enter',
    ESC:'Escape',
};