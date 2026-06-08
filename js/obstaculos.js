import { NUM_FAIXAS, getPosFaixa, getLimitesPista } from './pista.js';

export const TIPO_OBSTACULO = {
    LAMA: 'lama',
    AGUA: 'agua',
    VEICULO: 'veiculo',
    BALA: 'bala',
};

// Tamanho do Veículo atualizado para comportar a imagem 'obstaculocarro.png'
const CONFIG = {
    lama: {largura: 80, altura: 12, velocidade: 0},
    agua: {largura: 120, altura: 60, velocidade: 0},
    veiculo: {largura: 64, altura: 32, velocidade: 4}, // Tamanho da imagem do carro
    bala: {largura: 16, altura: 8, velocidade: 7},
};

const INTERVALO_SPAWN_MIN = 60;   
const INTERVALO_SPAWN_MAX = 120;  

let obstaculosAtivos = [];
let frameProxSpawn   = INTERVALO_SPAWN_MIN;
let contadorFrames   = 0;

export function resetarObstaculos() {
    obstaculosAtivos.forEach(obs => {
        if (obs.element) obs.element.remove();
    });
    obstaculosAtivos = [];
    contadorFrames   = 0;
    frameProxSpawn   = INTERVALO_SPAWN_MIN;
}

function criarObstaculo(velocidadeGlobal, larguraTela, alturaTela, els) {
    const rolagem = Math.random();
    let tipo = TIPO_OBSTACULO.BALA;
    if (rolagem < 0.25)      tipo = TIPO_OBSTACULO.LAMA;
    else if (rolagem < 0.50) tipo = TIPO_OBSTACULO.AGUA;
    else if (rolagem < 0.75) tipo = TIPO_OBSTACULO.VEICULO;
 
    const config  = CONFIG[tipo];
    const faixa   = Math.floor(Math.random() * NUM_FAIXAS);
    const limites = getLimitesPista(alturaTela);
    const y       = getPosFaixa(faixa, limites) - config.altura / 2;
    const x       = larguraTela + 20;
    const velExtra = (tipo === TIPO_OBSTACULO.VEICULO || tipo === TIPO_OBSTACULO.BALA)
        ? config.velocidade : 0;
 
    const obs = {
        tipo, faixa, x, y,
        largura:   config.largura,
        altura:    config.altura,
        velocidade: velocidadeGlobal + velExtra,
    };
 
    const el = document.createElement('div');
    el.className    = `obstaculo obs-${tipo}`;
    el.style.width  = obs.largura + 'px';
    el.style.height = obs.altura  + 'px';
    el.style.top    = obs.y       + 'px';
 
    if (tipo === TIPO_OBSTACULO.LAMA) {
        el.innerHTML = '<div class="dot" style="left:12px"></div>'
                     + '<div class="dot" style="left:36px"></div>'
                     + '<div class="dot" style="left:60px"></div>';
    }
    // Veículo não precisa mais de manipulação de string HTML por dentro, o CSS faz o trabalho com a imagem!
 
    els.entidades.appendChild(el);
    obs.element = el;
    return obs;
}

export function atualizarObstaculos(velocidadeGlobal, delta, larguraTela, alturaTela, els) {
    contadorFrames++;
    if (contadorFrames >= frameProxSpawn) {
        obstaculosAtivos.push(criarObstaculo(velocidadeGlobal, larguraTela, alturaTela, els));
        contadorFrames = 0;
        frameProxSpawn = INTERVALO_SPAWN_MIN +
            Math.floor(Math.random() * (INTERVALO_SPAWN_MAX - INTERVALO_SPAWN_MIN));
    }
 
    obstaculosAtivos = obstaculosAtivos.filter(obs => {
        obs.x -= obs.velocidade * delta;
        if (obs.x + obs.largura > 0) return true;
        
        if (obs.element) obs.element.remove(); 
        return false;
    });
}
 
export function getObstaculos() {
    return obstaculosAtivos;
}