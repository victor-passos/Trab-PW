import { teclaPressionada, TECLAS } from './input.js';


// Constantes de movimento
const TAMX = 24;
const TAMY = 16;
const VEL_MIN = 0;
const VEL_MAX_NORMAL = 5;
const VEL_MAX_TURBO = 8;
const ACELERACAO_NORMAL = 0.15;
const ACELERACAO_TURBO = 0.25;
const FRENAGEM = 0.12;
const VEL_LATERAL = 2.5;

//Constantes de temperatura do motor

const TEMP_MAX = 100;
const TEMP_LIMITE_NORMAL = 50;
const CALOR_NORMAL = 0.3;
const CALOR_TURBO = 0.8;
const RESFRIAMENTO = 0.4;
const DURACAO_COOLDOWN = 180;

export function criarPlayer(larguraTela, alturaTela){
    return {
        x: 100,
        y: alturaTela/2,
        largura: TAMX,
        altura: TAMY,
        velocidade: 0,
        cor: '#00ff00',
        vidas: 3,
        pontuacao: 0,
        temperatura: 0,
        superaquecido: false,
        tempoCoolDown: 0,

    };
}

export function atualizarPlayer(player, larguraTela, alturaPista){  
    const margemTopo  = alturaPista.topo;
    const margemBase  = alturaPista.base - player.altura;
    
    if (player.y < margemTopo)  player.y = margemTopo;
    if (player.y > margemBase)  player.y = margemBase;

    if (teclaPressionada(TECLAS.BAIXO)){
        player.y += VEL_LATERAL;
    }

     if (teclaPressionada(TECLAS.CIMA)){
        player.y -= VEL_LATERAL;
    }

    const turboAtivo = teclaPressionada(TECLAS.TURBO);
    const normalAtivo = teclaPressionada(TECLAS.NORMAL);

    if(turboAtivo){
        player.velocidade = Math.min(player.velocidade + ACELERACAO_TURBO, VEL_MAX_TURBO);
        player.temperatura = Math.min(player.temperatura + CALOR_TURBO, TEMP_MAX);
    } else if(normalAtivo) {
        player.velocidade = Math.min(player.velocidade + ACELERACAO_NORMAL, VEL_MAX_NORMAL);
        player.temperatura = Math.min(player.temperatura + CALOR_NORMAL, TEMP_LIMITE_NORMAL);

    } else{
        player.velocidade = Math.max(player.velocidade - FRENAGEM, VEL_MIN);
        player.temperatura = Math.max(player.temperatura - RESFRIAMENTO, 0);
    }

    if(player.temperatura >= TEMP_MAX){
        player.superaquecido = true;
        player.tempoCoolDown = DURACAO_COOLDOWN;
        player.velocidade = 0;
    }

    if (player.superaquecido){
        player.tempoCoolDown--;
        player.temperatura = Math.max(0, player.temperatura - RESFRIAMENTO * 2);

        if (player.tempoCoolDown <= 0){
            player.superaquecido = false;
        }
        return;
    }
}


export function desenharPlayer(ctx, player) {

    if(player.superaquecido){
        ctx.fillStyle = '#ff0000';
    } else{
        ctx.fillStyle = player.cor;
    }
    ctx.fillRect(player.x, player.y, player.largura, player.altura);
 
    // Ponto de referência (roda dianteira) — só para debug visual
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(player.x + player.largura - 4, player.y + player.altura - 4, 4, 4);
}

export function getTemperatura(player) {
    return {
        valor:         player.temperatura,
        max:           TEMP_MAX,
        limiteNormal:  TEMP_LIMITE_NORMAL,
        superaquecido: player.superaquecido,
    };
}
