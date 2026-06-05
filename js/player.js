import { teclaPressionada, TECLAS } from './input.js';
import { NUM_FAIXAS, getPosFaixa } from './pista.js';

// Constantes de movimento
const TAMX = 24;
const TAMY = 16;
const VEL_LATERAL = 0.2;

// Item Turbo
const DURACAO_TURBO = 210;
const MULTIPLICADOR_TURBO = 1.8;
const EMPINADA_TURBO = 0.4;
const VEL_EMPINADA_TURBO = 0.04;
const EMPINADA_RETORNO = 0.05;

// Constantes de invulnerabilidade pós-dano
const DURACAO_INVULNERABILIDADE = 90; // Cerca de 1.5 segundos a 60 FPS

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
        empinada: 0, // Mantido apenas para efeito visual do turbo
        turboCarregado: false,
        turboAtivo: false,
        tempoDuracao: 0,
        teclaTurboAtiva: false,
        invulneravelPosDano: false,
        tempoInvulnerabilidade: 0
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

    // Atualiza o temporizador de invulnerabilidade pós-dano
    if (player.invulneravelPosDano) {
        player.tempoInvulnerabilidade--;
        if (player.tempoInvulnerabilidade <= 0) {
            player.invulneravelPosDano = false;
        }
    }

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

    player.yDestino = getPosFaixa(player.faixaAtual, alturaPista) - player.altura/2; 
    player.y += (player.yDestino - player.y) * VEL_LATERAL; 

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
        // Efeito visual de empinar ao ativar o turbo
        player.empinada = Math.min(player.empinada + VEL_EMPINADA_TURBO, EMPINADA_TURBO);
 
        if (player.tempoDuracao <= 0) {
            player.turboAtivo = false;
        }
        return;
    }

    player.velocidade = velocidadeGlobal;

    // Retorno suave da empinada visual quando o turbo acaba
    if(player.empinada > 0){
        player.empinada = Math.max(player.empinada - EMPINADA_RETORNO, 0);
    }
}

// Ativa o estado de invulnerabilidade do jogador
export function ativarInvulnerabilidadePosDano(player) {
    player.invulneravelPosDano = true;
    player.tempoInvulnerabilidade = DURACAO_INVULNERABILIDADE;
}

export function desenharPlayer(ctx, player) {
    if (player.invulneravelPosDano && Math.floor(Date.now() / 50) % 2 === 0) {
        return;
    }

    // --- ANIMAÇÃO DE VIBRAÇÃO DO MOTOR ---
    // Se o turbo estiver ativo, a vibração é mais rápida e agressiva
    const velocidadeVibracao = player.turboAtivo ? 8 : 15; 
    const amplitudeVibracao = player.turboAtivo ? 2.0 : 1.0; // Amplitude em pixels
    
    // Calcula um pequeno deslocamento vertical usando uma onda senoidal baseada no tempo atual
    const vibracaoY = Math.sin(Date.now() / velocidadeVibracao) * amplitudeVibracao;

    const pivotX = player.x + player.largura * 0.25;
    const pivotY = player.y + player.altura;

    ctx.save();
    
    // Aplica a vibração deslocando todo o contexto levemente no eixo Y
    ctx.translate(0, vibracaoY);

    ctx.translate(pivotX, pivotY);
    ctx.rotate(-player.empinada);
    ctx.translate(-pivotX, -pivotY);

    if(player.turboAtivo){
        ctx.fillStyle = '#00e5ff';
        ctx.shadowBlur  = 12;
    } else {
        ctx.fillStyle = player.cor;
    }
    ctx.fillRect(player.x, player.y, player.largura, player.altura);
 
    // Ponto de referência (roda dianteira)
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(player.x + player.largura - 4, player.y + player.altura - 4, 4, 4);

    ctx.restore();
}
 
export function getTurbo(player) {
    return {
        carregado: player.turboCarregado,
        ativo: player.turboAtivo,
        tempoAtual: player.tempoDuracao,
        tempoMax: DURACAO_TURBO,
    };
}