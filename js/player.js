import { teclaPressionada, TECLAS } from './input.js';

const TAMX = 24;
const TAMY = 16;
const VEL_BASE = 3;
const ACELERACAO = 0.2;
const FRENAGEM = 0.15;
const VEL_MAX = 8;
const VEL_LATERAL = 2.5;

export function criarPlayer(larguraTela, alturaTela){
    return {
        x: 100,
        y: alturaTela/2,
        largura: TAMX,
        altura: TAMY,
        velocidade: VEL_BASE,
        cor: '#00ff00',
        vidas: 3,
        pontuacao: 0,
    };
}

export function atualizarPlayer(player, larguraTela, alturaPista){
    if (teclaPressionada(TECLAS.BAIXO)){
        player.y += VEL_LATERAL;
    }

     if (teclaPressionada(TECLAS.CIMA)){
        player.y -= VEL_LATERAL;
    }

    if (teclaPressionada(TECLAS.DIREITA)){
        player.velocidade = Math.min( player.velocidade + ACELERACAO, VEL_MAX);
    } 
    else if (teclaPressionada (TECLAS.ESQUERDA)){
        player.velocidade = Math.max( player.velocidade - FRENAGEM, 0);
    }

    const margemTopo  = alturaPista.topo;
    const margemBase  = alturaPista.base - player.altura;
    
    if (player.y < margemTopo)  player.y = margemTopo;
    if (player.y > margemBase)  player.y = margemBase;
}


export function desenharPlayer(ctx, player) {
    ctx.fillStyle = player.cor;
    ctx.fillRect(player.x, player.y, player.largura, player.altura);
 
    // Ponto de referência (roda dianteira) — só para debug visual
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(player.x + player.largura - 4, player.y + player.altura - 4, 4, 4);
}

