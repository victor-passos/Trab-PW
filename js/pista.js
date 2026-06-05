export const NUM_FAIXAS = 4;

export function getLimitesPista(alturaTela) {
    const topo = Math.floor(alturaTela * 0.2);
    const base = Math.floor(alturaTela * 0.8);
    return { topo, base };
}

export function getPosFaixa(faixa, limites) {
    const alturaPista  = limites.base - limites.topo;
    const alturaFaixa = alturaPista/NUM_FAIXAS;
    return limites.topo + faixa * alturaFaixa + alturaFaixa/2;
}

export function initPistaDOM(els) {
    els.faixas.innerHTML = '';
    const alturaFaixa = 240 / NUM_FAIXAS;
    for (let i = 1; i < NUM_FAIXAS; i++) {
        const linha = document.createElement('div');
        linha.className = 'faixa-linha';
        linha.style.top = (i * alturaFaixa) + 'px';
        els.faixas.appendChild(linha);
    }
}

// Atualiza o deslocamento visual das marcações verticais via background-position.
export function atualizarPista(deslocamento, els) {
    els.marcacoes.style.backgroundPositionX = `-${deslocamento}px`;
}
