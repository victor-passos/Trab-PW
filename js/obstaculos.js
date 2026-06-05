import { NUM_FAIXAS, getPosFaixa, getLimitesPista } from './pista.js';

export const TIPO_OBSTACULO = {
    LAMA: 'lama',
    AGUA: 'agua',
    VEICULO: 'veiculo',
    BALA: 'bala',
};

const CONFIG = {
    lama: {
        largura: 80,
        altura: 12,
        cor:'#6b3d0f',
        corBorda:'#4a2a08',
        velocidade:0,          // estático na pista
    },
    agua: {
        largura: 120,
        altura: 60,            // Aumentado de 12 para 60 (preenche a faixa inteira)
        cor: '#1a6bbf',
        corBorda:'#0d4a8a',
        velocidade: 0,          // estático na pista
    },
    veiculo: {
        largura: 28,
        altura: 16,
        cor: '#e03030',
        corBorda: '#991010',
        velocidade: 4,          // velocidade própria (vem em direção ao player)
    },
    bala: {
        largura: 12,
        altura: 6,
        cor: '#ffee00',
        corBorda: '#cc9900',
        velocidade: 7,          // mais rápida que o veículo
    },
};

const INTERVALO_SPAWN_MIN = 60;   // frames mínimos entre spawns
const INTERVALO_SPAWN_MAX = 120;  // frames máximos entre spawns


//Estado
let obstaculosAtivos = [];
let frameProxSpawn   = INTERVALO_SPAWN_MIN;
let contadorFrames   = 0;

//Reset
export function resetarObstaculos() {
    obstaculosAtivos = [];
    contadorFrames   = 0;
    frameProxSpawn   = INTERVALO_SPAWN_MIN;
}


//Spaewn de obstaculo
function sortearTipo() {
    const rolagem = Math.random();
    if (rolagem < 0.25) return TIPO_OBSTACULO.LAMA;
    if (rolagem < 0.50) return TIPO_OBSTACULO.AGUA;
    if (rolagem < 0.75) return TIPO_OBSTACULO.VEICULO;
    return TIPO_OBSTACULO.BALA;
}

function criarObstaculo(larguraTela, alturaTela, velocidadeGlobal) {
    const tipo     = sortearTipo();
    const config   = CONFIG[tipo];
    const faixa    = Math.floor(Math.random() * NUM_FAIXAS);
    const limites  = getLimitesPista(alturaTela);
    const centroY  = getPosFaixa(faixa, limites);
    const velExtra = tipo === TIPO_OBSTACULO.VEICULO || tipo === TIPO_OBSTACULO.BALA ? config.velocidade: 0;
 
    return {
        tipo,
        faixa,
        x: larguraTela + 20,        // surge fora da tela à direita
        y: centroY - config.altura / 2,
        largura:config.largura,
        altura: config.altura,
        cor: config.cor,
        corBorda: config.corBorda,
        // velocidade total = global + própria (móveis vêm mais rápido)
        velocidade: velocidadeGlobal + velExtra,
    };
}

export function atualizarObstaculos(larguraTela, alturaTela, velocidadeGlobal, delta) {
    contadorFrames++;
    // Spawn de novo obstáculo
    if (contadorFrames >= frameProxSpawn) {
        obstaculosAtivos.push(criarObstaculo(larguraTela, alturaTela, velocidadeGlobal));
        contadorFrames  = 0;
        frameProxSpawn  = INTERVALO_SPAWN_MIN +
            Math.floor(Math.random() * (INTERVALO_SPAWN_MAX - INTERVALO_SPAWN_MIN));
    }
 
    // Move e remove obstáculos fora da tela
    for (const obs of obstaculosAtivos) {
        obs.x -= obs.velocidade * delta;
    }
 
    obstaculosAtivos = obstaculosAtivos.filter(obs => obs.x + obs.largura > 0);
}

export function desenharObstaculos(ctx, alturaTela) {
    for (const obs of obstaculosAtivos) {
        // Sombra sutil
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.fillRect(obs.x + 2, obs.y + 2, obs.largura, obs.altura);
 
        // Corpo
        ctx.fillStyle = obs.cor;
        ctx.fillRect(obs.x, obs.y, obs.largura, obs.altura);
 
        // Borda
        ctx.strokeStyle = obs.corBorda;
        ctx.lineWidth   = 1.5;
        ctx.strokeRect(obs.x, obs.y, obs.largura, obs.altura);
 
        // Detalhe visual por tipo
        desenharDetalhe(ctx, obs);
    }
}
 
function desenharDetalhe(ctx, obs) {
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
 
    if (obs.tipo === TIPO_OBSTACULO.LAMA) {
        // bolinhas simulando lama
        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.arc(
                obs.x + 12 + i * 24,
                obs.y + obs.altura / 2,
                3, 0, Math.PI * 2
            );
            ctx.fill();
        }
    } else if (obs.tipo === TIPO_OBSTACULO.AGUA) {
        // ondinhas espalhadas por toda a faixa
        ctx.strokeStyle = 'rgba(255,255,255,0.3)';
        ctx.lineWidth   = 1;
        ctx.beginPath();
        
        // Desenha 3 fileiras de ondas para preencher a poça maior
        for (let linha = 1; linha <= 3; linha++) {
            const yOnda = obs.y + (obs.altura / 4) * linha;
            for (let x = obs.x + 8; x < obs.x + obs.largura - 8; x += 16) {
                ctx.moveTo(x,      yOnda);
                ctx.lineTo(x + 8,  yOnda - 3);
                ctx.lineTo(x + 16, yOnda);
            }
        }
        ctx.stroke();
    } else if (obs.tipo === TIPO_OBSTACULO.VEICULO) {
        // janela
        ctx.fillStyle = '#88ccff';
        ctx.fillRect(obs.x + 4, obs.y + 3, obs.largura - 8, obs.altura - 8);
    } else if (obs.tipo === TIPO_OBSTACULO.BALA) {
        // ponta da bala
        ctx.fillStyle = obs.corBorda;
        ctx.beginPath();
        ctx.moveTo(obs.x,              obs.y + obs.altura / 2);
        ctx.lineTo(obs.x + obs.largura * 0.3, obs.y);
        ctx.lineTo(obs.x + obs.largura * 0.3, obs.y + obs.altura);
        ctx.closePath();
        ctx.fill();
    }
}
 
// Getter para colisão 
export function getObstaculos() {
    return obstaculosAtivos;
}