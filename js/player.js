import { teclaPressionada, TECLAS } from './input.js';
import { NUM_FAIXAS, getPosFaixa } from './pista.js';


// Constantes de movimento
const TAMX = 24;
const TAMY = 16;
const VEL_LATERAL = 0.2;

//Constantes de empinada
const EMPINADA_MAX = 0.5;
const EMPINADA_MIN = -0.25;
const VEL_EMPINADA = 0.03;
const EMPINADA_RETONRO = 0.05;
const TEMPO_EMPINADA_MAX = 90;
const DURACAO_CAIDA = 150;

// Item Turbo
const DURACAO_TURBO = 180;
const MULTIPLICADOR_TURBO = 1.8;
const EMPINADA_TURBO = 0.4;
const VEL_EMPINADA_TURBO = 0.04;


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
        teclaFaixaAtiva: false,
        empinada: 0,
        tempoEmpinada: 0,
        caido: false,
        tempoCaida: 0,
        turboCarregado: false,
        turboAtivo: false,
        tempoDuracao: 0,
        teclaTurboAtiva: false,

    };
}

export function iniciarFaixa(player, alturaPista){
    player.y = getPosFaixa(player.faixaAtual, alturaPista) - player.altura/2;
    player.yDestino = player.y;
}

export function atualizarPlayer(player, larguraTela, alturaPista, velocidadeGlobal){  
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

    player.yDestino = getPosFaixa(player.faixaAtual, alturaPista) - player.altura/2; //atualiza yDestino com base na faixa atual
    player.y += (player.yDestino - player.y) * VEL_LATERAL; //animação de transição

    if(player.caido){
        player.tempoCaida--;
        player.empinada = Math.max(player.empinada - EMPINADA_RETONRO * 2, 0);
        if(player.tempoCaida <= 0){
            player.caido = false;
            player.velocidade = 0;
        }
        return;
    }

    if (!teclaPressionada(TECLAS.TURBO)) {
        player.teclaTurboAtiva = false;
    }

    if (teclaPressionada(TECLAS.TURBO) && !player.teclaTurboAtiva && player.turboCarregado) {
        player.turboAtivo      = true;
        player.turboCarregado  = false;
        player.teclaTurboAtiva = true;
        player.tempoDuracao    = DURACAO_TURBO;
    }

        if (player.turboAtivo) {
        player.tempoDuracao--;
        player.velocidade = velocidadeGlobal * MULTIPLICADOR_TURBO;
        player.empinada = Math.min(player.empinada + VEL_EMPINADA_TURBO, EMPINADA_TURBO);
 
        if (player.tempoDuracao <= 0) {
            player.turboAtivo = false;
        }
        return;
    }

    player.velocidade = velocidadeGlobal;

    //Empinada
    if(teclaPressionada(TECLAS.ESQUERDA)){
        player.empinada = Math.min(player.empinada + VEL_EMPINADA, EMPINADA_MAX);
        if(player.empinada >=  EMPINADA_MAX * 0.7){
            player.tempoEmpinada++;
        }

        if(player.tempoEmpinada >= TEMPO_EMPINADA_MAX){
            player.caido = true;
            player.tempoCaida = DURACAO_CAIDA;
            player.tempoEmpinada = 0;
            player.velocidade = 0;
            return;
        }

    } else if( teclaPressionada(TECLAS.DIREITA)){
        player.empinada = Math.max(player.empinada - VEL_EMPINADA, EMPINADA_MIN);
        player.tempoEmpinada = Math.max(player.tempoEmpinada - 2, 0);
    } else{
        if(player.empinada > 0){
            player.empinada = Math.max(player.empinada - EMPINADA_RETONRO, 0);
        } else if(player.empinada < 0){
            player.empinada = Math.min(player.empinada + EMPINADA_RETONRO, 0)
        }
        player.tempoEmpinada = Math.max(player.tempoEmpinada - 1, 0);
    }
}


export function desenharPlayer(ctx, player) {
    const pivotX = player.x + player.largura * 0.25;
    const pivotY = player.y + player.altura;

    ctx.save();
    ctx.translate(pivotX, pivotY);
    ctx.rotate(-player.empinada);
    ctx.translate(-pivotX, -pivotY)

    if(player.turboAtivo){
        ctx.fillStyle = '#00e5ff';
         ctx.shadowBlur  = 12;
    } else if(player.caido){
        ctx.fillStyle = '#ffff00'
    }else{
        ctx.fillStyle = player.cor;
    }
    ctx.fillRect(player.x, player.y, player.largura, player.altura);
 
    // Ponto de referência (roda dianteira) — só para debug visual
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(player.x + player.largura - 4, player.y + player.altura - 4, 4, 4);

    ctx.restore();
}

export function getEmpinada(player) {
    return {
        tempoAtual: player.tempoEmpinada,
        tempoMax: TEMPO_EMPINADA_MAX,
        caido: player.caido,
    };
}
 
export function getTurbo(player) {
    return {
        carregado: player.turboCarregado,
        ativo: player.turboAtivo,
        tempoAtual: player.tempoDuracao,
        tempoMax: DURACAO_TURBO,
    };
}


//export function getEmpinada(player){return{ tempoAtual: player.tempoEmpinada, tempoMax: TEMPO_EMPINADA_MAX, caido: player.caido,}}