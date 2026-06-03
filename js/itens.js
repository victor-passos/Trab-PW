import { NUM_FAIXAS, getPosFaixa, getLimitesPista } from "./pista.js";

export const TIPO_ITEM = {
    MOEDA: 'moeda',
    TURBO: 'turbo',
};

const CONFIG_ITEM = {
    moeda: {
        largura: 12,
        altura: 12,
        cor: '#ffd700',
        corBorda:'#cc9900',
    },
    turbo: {
        largura: 18,
        altura: 18,
        cor: '#00e5ff',
        corBorda: '#0099bb',
    },
};

const CHANCE_TURBO          = 0.10;
const INTERVALO_SPAWN_MIN   = 60;
const INTERVALO_SPAWN_MAX   = 120;
 
let itensAtivos    = [];
let contadorFrames = 0;
let frameProxSpawn = INTERVALO_SPAWN_MIN;

export function resetarItens() {
    itensAtivos    = [];
    contadorFrames = 0;
    frameProxSpawn = INTERVALO_SPAWN_MIN;
}

function criarItem(larguraTela, alturaTela, velocidadeGlobal) {
    const tipo    = Math.random() < CHANCE_TURBO ? TIPO_ITEM.TURBO : TIPO_ITEM.MOEDA;
    const config  = CONFIG_ITEM[tipo];
    const faixa   = Math.floor(Math.random() * NUM_FAIXAS);
    const limites = getLimitesPista(alturaTela);
    const centroY = getPosFaixa(faixa, limites);
 
    return {
        tipo,
        faixa,
        x:          larguraTela + 20,
        y:          centroY - config.altura / 2,
        largura:    config.largura,
        altura:     config.altura,
        cor:        config.cor,
        corBorda:   config.corBorda,
        coletado:   false,
        velocidade: velocidadeGlobal,
        // animação de pulso
        pulsacao:   0,
    };
}

export function atualizarItens(larguraTela, alturaTela, velocidadeGlobal, delta) {
    contadorFrames++;
 
    if (contadorFrames >= frameProxSpawn) {
        itensAtivos.push(criarItem(larguraTela, alturaTela, velocidadeGlobal));
        contadorFrames = 0;
        frameProxSpawn = INTERVALO_SPAWN_MIN +
            Math.floor(Math.random() * (INTERVALO_SPAWN_MAX - INTERVALO_SPAWN_MIN));
    }
 
    for (const item of itensAtivos) {
        item.x        -= item.velocidade * delta;
        item.pulsacao += 0.1; // incrementa ângulo de pulsação
    }
 
    // Remove itens coletados ou fora da tela
    itensAtivos = itensAtivos.filter(item => !item.coletado && item.x + item.largura > 0);
}

export function desenharItens(ctx) {
    for (const item of itensAtivos) {
        if (item.coletado) continue;
 
        // Pulso — oscila o tamanho levemente
        const pulso       = Math.sin(item.pulsacao) * 2;
        const larguraReal = item.largura + pulso;
        const alturaReal  = item.altura  + pulso;
        const offsetX     = (larguraReal - item.largura) / 2;
        const offsetY     = (alturaReal  - item.altura)  / 2;
 
        // Brilho externo
        ctx.shadowColor   = item.cor;
        ctx.shadowBlur    = 6;
 
        if (item.tipo === TIPO_ITEM.MOEDA) {
            desenharMoeda(ctx, item, larguraReal, alturaReal, offsetX, offsetY);
        } else {
            desenharItemTurbo(ctx, item, larguraReal, alturaReal, offsetX, offsetY);
        }
 
        ctx.shadowBlur = 0; // reseta o brilho
    }
}

function desenharMoeda(ctx, item, largura, altura, offsetX, offsetY) {
    // Círculo dourado
    ctx.fillStyle = item.cor;
    ctx.beginPath();
    ctx.ellipse(
        item.x + item.largura / 2,
        item.y + item.altura  / 2,
        largura / 2,
        altura  / 2,
        0, 0, Math.PI * 2
    );
    ctx.fill();
 
    // Borda
    ctx.strokeStyle = item.corBorda;
    ctx.lineWidth   = 1.5;
    ctx.stroke();
 
    // Cifra $
    ctx.fillStyle  = item.corBorda;
    ctx.font       = 'bold 8px monospace';
    ctx.textAlign  = 'center';
    ctx.fillText('$', item.x + item.largura / 2, item.y + item.altura / 2 + 3);
}

function desenharItemTurbo(ctx, item, largura, altura, offsetX, offsetY) {
    const cx = item.x + item.largura / 2;
    const cy = item.y + item.altura  / 2;
 
    // Hexágono ciano
    ctx.fillStyle = item.cor;
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
        const angulo = (Math.PI / 3) * i - Math.PI / 6;
        const px     = cx + (largura / 2) * Math.cos(angulo);
        const py     = cy + (altura  / 2) * Math.sin(angulo);
        i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
 
    // Borda
    ctx.strokeStyle = item.corBorda;
    ctx.lineWidth   = 1.5;
    ctx.stroke();
 
    // Letra T
    ctx.fillStyle = item.corBorda;
    ctx.font      = 'bold 10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('T', cx, cy + 4);
}

export function getItens() {
    return itensAtivos;
}

