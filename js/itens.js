import { NUM_FAIXAS, getPosFaixa, getLimitesPista } from "./pista.js";
import { getObstaculos } from "./obstaculos.js"; 

export const TIPO_ITEM = {
    MOEDA: 'moeda',
    TURBO: 'turbo',
};

const CONFIG_ITEM = {
    moeda: {largura: 12, altura: 12, cssClass: 'item-moeda', char: '$'},
    turbo: {largura: 18, altura: 18, cssClass: 'item-turbo', char: 'T'},
};

const CHANCE_TURBO          = 0.02;
const INTERVALO_SPAWN_MIN   = 60;
const INTERVALO_SPAWN_MAX   = 120;
 
let itensAtivos    = [];
let contadorFrames = 0;
let frameProxSpawn = INTERVALO_SPAWN_MIN;

export function resetarItens() {
    itensAtivos.forEach(i => {
        if (i.element) i.element.remove();
    });
    itensAtivos    = [];
    contadorFrames = 0;
    frameProxSpawn = INTERVALO_SPAWN_MIN;
}

function criarItem(velocidadeGlobal, larguraTela, alturaTela, els) {
    const spawnX = larguraTela + 20;
    const obstaculos = getObstaculos();
    const faixasPossiveis = [];
 
    // Impede spawns sobrepostos em faixas com obstáculos adjacentes
    for (let i = 0; i < NUM_FAIXAS; i++) {
        let livre = true;
        for (const obs of obstaculos) {
            if (obs.faixa === i && Math.abs(obs.x - spawnX) < 140) { livre = false; break; }
        }
        if (livre) faixasPossiveis.push(i);
    }
    if (faixasPossiveis.length === 0) return null;
 
    const tipo = Math.random() < CHANCE_TURBO ? TIPO_ITEM.TURBO : TIPO_ITEM.MOEDA;
    const config = CONFIG_ITEM[tipo];
    const faixa = faixasPossiveis[Math.floor(Math.random() * faixasPossiveis.length)];
    const y = getPosFaixa(faixa, getLimitesPista(alturaTela)) - config.altura / 2;
 
    const item = {
        tipo, faixa, x: spawnX, y,
        largura:   config.largura,
        altura:    config.altura,
        velocidade: velocidadeGlobal,
        pulsacao:  0,
        coletado:  false,
    };
 
    // CRIAÇÃO DINÂMICA NA ÁRVORE DOM
    const el = document.createElement('div');
    el.className    = `item ${config.cssClass}`;
    el.style.width  = item.largura + 'px';
    el.style.height = item.altura  + 'px';
    el.style.top    = item.y       + 'px';
    el.innerHTML    = config.char;
 
    els.entidades.appendChild(el);
    item.element = el;
    return item;
}
 
export function atualizarItens(velocidadeGlobal, delta, larguraTela, alturaTela, els) {
    // CORREÇÃO: As variáveis de temporização usavam nomes inexistentes
    contadorFrames++;
    if (contadorFrames >= frameProxSpawn) {
        const nItem = criarItem(velocidadeGlobal, larguraTela, alturaTela, els);
        if (nItem) {
            itensAtivos.push(nItem);
            contadorFrames = 0;
            frameProxSpawn = INTERVALO_SPAWN_MIN +
                Math.floor(Math.random() * (INTERVALO_SPAWN_MAX - INTERVALO_SPAWN_MIN));
        }
    }
 
    itensAtivos = itensAtivos.filter(item => {
        if (item.coletado) {
            if (item.element) item.element.remove(); // REMOÇÃO IMEDIATA AO COLETAR
            return false;
        }
        item.x        -= item.velocidade * delta;
        item.pulsacao += 0.1;
 
        if (item.x + item.largura > 0) return true;
        
        if (item.element) item.element.remove(); // REMOÇÃO FORA DA TELA
        return false;
    });
}

export function getItens() {
    return itensAtivos;
}