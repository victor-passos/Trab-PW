const teclasPressionadas = {};
 
export function iniciarInput() {
    window.addEventListener('keydown', (e) => {
        teclasPressionadas[e.code] = true;
    });
    window.addEventListener('keyup', (e) => {
        teclasPressionadas[e.code] = false;
    });
}
 
export function teclaPressionada(codigo) {
    return !!teclasPressionadas[codigo];
}
 
export const TECLAS = {
    CIMA: 'ArrowUp',
    BAIXO:'ArrowDown',
    ESQUERDA:'ArrowLeft',
    DIREITA:'ArrowRight',
    ESPACO:'Space',
    ENTER:'Enter',
    ESC:'Escape',
};
