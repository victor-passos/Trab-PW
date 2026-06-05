const CHAVE_RECORDE = 'excitebike_recorde';
const PONTOS_MOEDA = 150;
 
let pontuacao = 0;
let distancia = 0;
let recorde = carregarRecorde();

function carregarRecorde() {
    const salvo = localStorage.getItem(CHAVE_RECORDE);
    return salvo ? parseInt(salvo, 10) : 0;
}
 
function salvarRecorde() {
    if (pontuacao > recorde) {
        recorde = pontuacao;
        localStorage.setItem(CHAVE_RECORDE, recorde);
        return true; // indica que é novo recorde
    }
    return false;
}
 
export function atualizarPontuacao(deltaDistancia) {
    distancia += deltaDistancia;
    pontuacao = Math.floor(distancia) + getPontosMoedas();
}
 
let totalMoedas = 0;
 
export function registrarMoeda() {
    totalMoedas++;
}
 
function getPontosMoedas() {
    return totalMoedas * PONTOS_MOEDA;
}

export function resetarPlacar() {
    pontuacao = 0;
    distancia = 0;
    totalMoedas = 0;
}

export function getPontuacao()  { return pontuacao; }
export function getDistancia()  { return Math.floor(distancia); }
export function getRecorde()    { return recorde; }
export function getMoedas()     { return totalMoedas; }

export function finalizarPlacar() {
    const novoRecorde = salvarRecorde();
    return { pontuacao, distancia: Math.floor(distancia), moedas: totalMoedas, novoRecorde, recorde };
}

