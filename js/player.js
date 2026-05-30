import { teclaPressionada, TECLAS } from './input.js';
import { NUM_FAIXAS, obterPosFaixa } from './pista.js';


// Constantes de movimento
const TAMX = 24;
const TAMY = 16;
const VEL_MIN = 0;
const VEL_MAX_NORMAL = 5;
const VEL_MAX_TURBO = 8;
const ACELERACAO_NORMAL = 0.15;
const ACELERACAO_TURBO = 0.25;
const FRENAGEM = 0.12;
const VEL_LATERAL = 0.2;

//Constantes de temperatura do motor

const TEMP_MAX = 100;
const TEMP_LIMITE_NORMAL = 50;
const CALOR_NORMAL = 0.3;
const CALOR_TURBO = 0.8;
const RESFRIAMENTO = 0.4;
const DURACAO_COOLDOWN = 180;

const EMPINADA_MAX = 0.5;
const EMPINADA_MIN = -0.25;
const VEL_EMPINADA = 0.03;
const EMPINADA_RETONRO = 0.05;

export function criarPlayer(larguraTela, alturaTela){
    return {
        x: 100,
        y: 0,
        largura: TAMX,
        altura: TAMY,
        velocidade: 0,
        cor: '#00ff00',
        vidas: 3,
        pontuacao: 0,
        faixaAtual: 3,
        yDestino: 0,
        temperatura: 0,
        superaquecido: false,
        tempoCoolDown: 0,
        teclaFaixaAtiva: false,
        empinada: 0,

    };
}

export function iniciarFaixa(player, alturaPista){
    player.y = obterPosFaixa(player.faixaAtual, alturaPista) - player.altura/2;
    player.yDestino = player.y;
}

export function atualizarPlayer(player, larguraTela, alturaPista){  
    const margemTopo  = alturaPista.topo;
    const margemBase  = alturaPista.base - player.altura;
    if (player.y < margemTopo)  player.y = margemTopo;
    if (player.y > margemBase)  player.y = margemBase;

    if(!teclaPressionada(TECLAS.BAIXO) && !teclaPressionada(TECLAS.CIMA)){
        player.teclaFaixaAtiva = false;
    }

    if(!player.teclaFaixaAtiva){
        if(teclaPressionada(TECLAS.CIMA) && player.faixaAtual > 0){
            player.faixaAtual--;
            player.teclaFaixaAtiva = true;
        } else if(teclaPressionada(TECLAS.BAIXO) && player.faixaAtual < NUM_FAIXAS - 1){
            player.faixaAtual++;
            player.teclaFaixaAtiva = true;
        }
    }

    player.yDestino = obterPosFaixa(player.faixaAtual, alturaPista) - player.altura/2; //atualiza yDestino com base na faixa atual
    player.y += (player.yDestino - player.y) * VEL_LATERAL; //animação de transição

    if (player.superaquecido){
        player.tempoCoolDown--;
        player.temperatura = Math.max(0, player.temperatura - RESFRIAMENTO * 2);

        if (player.tempoCoolDown <= 0){
            player.superaquecido = false;
        }
        return;
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

    //Empinada
    if(teclaPressionada(TECLAS.ESQUERDA)){
        player.empinada = Math.min(player.empinada + VEL_EMPINADA, EMPINADA_MAX);
    } else if( teclaPressionada(TECLAS.DIREITA)){
        player.empinada = Math.max(player.empinada - VEL_EMPINADA, EMPINADA_MIN);
    } else{
        if(player.empinada > 0){
            player.empinada = Math.max(player.empinada - EMPINADA_RETONRO, 0);
        } else if(player.empinada < 0){
            player.empinada = Math.min(player.empinada + EMPINADA_RETONRO, 0)
        }
    }


}


export function desenharPlayer(ctx, player) {
    const pivotX = player.x + player.largura * 0.25;
    const pivotY = player.y + player.altura;

    ctx.save();
    ctx.translate(pivotX, pivotY);
    ctx.rotate(-player.empinada);
    ctx.translate(-pivotX, -pivotY)

    if(player.superaquecido){
        ctx.fillStyle = '#ff0000';
    } else{
        ctx.fillStyle = player.cor;
    }
    ctx.fillRect(player.x, player.y, player.largura, player.altura);
 
    // Ponto de referência (roda dianteira) — só para debug visual
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(player.x + player.largura - 4, player.y + player.altura - 4, 4, 4);

    ctx.restore();
}

export function getTemperatura(player) {
    return {
        valor:         player.temperatura,
        max:           TEMP_MAX,
        limiteNormal:  TEMP_LIMITE_NORMAL,
        superaquecido: player.superaquecido,
    };
}
