// game.js — ponto de entrada e loop principal do jogo

import { ESTADOS, getEstado, definirEstado } from './estado.js';
import { iniciarInput, teclaPressionada, teclaPressionadaAgora, TECLAS } from './input.js';
import { criarPlayer, atualizarPlayer, desenharPlayer, getTurbo, iniciarFaixa } from './player.js';
import { desenharPista, getLimitesPista } from './pista.js';
import { atualizarObstaculos, desenharObstaculos, resetarObstaculos } from './obstaculos.js';
import { atualizarItens, desenharItens, resetarItens } from './itens.js';
import { getItens } from './itens.js';
import { getObstaculos } from './obstaculos.js';
import { verificarColisoes, aplicarColisoes } from './colisao.js';
import { atualizarPontuacao, registrarMoeda, resetarPlacar, getPontuacao, getDistancia, getRecorde, getMoedas, finalizarPlacar } from './placar.js';

// ─── Configuração do Canvas ────────────────────────────────────────────────
const tela = document.getElementById('tela');
const ctx = tela.getContext('2d');

const LARGURA_TELA = 800;
const ALTURA_TELA  = 400;

tela.width  = LARGURA_TELA;
tela.height = ALTURA_TELA;

// ─── Dificuldade (velocidade global) ──────────────────────────────────────
const VEL_INICIAL      = 4; 
const VEL_MAXIMA       = 14; 
const INCREMENTO_VEL   = 0.0005; // incremento por frame

let velocidadeGlobal   = VEL_INICIAL;

// ─── Estado global ─────────────────────────────────────────────────────────
let player       = null;
let deslocamento = 0;
let ultimoTempo  = 0;
let resumoFinal  = null;  // dados ao fim de jogo

// ─── Inicialização ─────────────────────────────────────────────────────────
function iniciar() {
    iniciarInput();
    requestAnimationFrame(loop);
}

function novoJogo() {
    const limitesPista = getLimitesPista(ALTURA_TELA);
    player             = criarPlayer(LARGURA_TELA, ALTURA_TELA);
    iniciarFaixa(player, limitesPista);

    velocidadeGlobal = VEL_INICIAL;
    deslocamento     = 0;
    resumoFinal      = null;

    resetarObstaculos();
    resetarItens();
    resetarPlacar();

    definirEstado(ESTADOS.JOGANDO);
}

// ─── Loop principal ────────────────────────────────────────────────────────
function loop(timestamp) {
    const deltaMs = timestamp - ultimoTempo;
    ultimoTempo   = timestamp;
    const delta   = Math.min(deltaMs / 16.67, 3);

    processar(delta);
    desenhar();

    requestAnimationFrame(loop);
}

// ─── Processamento por estado ──────────────────────────────────────────────
function processar(delta) {
    const estado = getEstado();

    if (estado === ESTADOS.INICIO) {
        if (teclaPressionada(TECLAS.ENTER) || teclaPressionada(TECLAS.ESPACO)) {
            novoJogo();
        }
        return;
    }

    if (estado === ESTADOS.JOGANDO) {
        if (teclaPressionadaAgora(TECLAS.ESC)) {
            definirEstado(ESTADOS.PAUSA);
            return;
        }

        // Aumenta velocidade gradualmente
        velocidadeGlobal = Math.min(velocidadeGlobal + INCREMENTO_VEL, VEL_MAXIMA);

        const limitesPista = getLimitesPista(ALTURA_TELA);

        // Atualiza módulos
        atualizarPlayer(player, LARGURA_TELA, limitesPista, velocidadeGlobal);
        atualizarObstaculos(LARGURA_TELA, ALTURA_TELA, velocidadeGlobal, delta);
        atualizarItens(LARGURA_TELA, ALTURA_TELA, velocidadeGlobal, delta);

        // Colisões
        const resultados = verificarColisoes(player, getObstaculos(), getItens());
        aplicarColisoes(player, resultados, {
            onDano:  () => verificarFimDeJogo(),
            onMoeda: () => registrarMoeda(),
            onLama:  () => verificarFimDeJogo(),  // Lama agora também pode matar o jogador (reduzir a vida a 0)
            onAgua:  () => {    // água = fim de jogo imediato
                player.vidas = 0;
                verificarFimDeJogo();
            },
            onTurbo: () => {},
        });

        // Pontuação e deslocamento
        deslocamento += velocidadeGlobal * delta;
        atualizarPontuacao(velocidadeGlobal * delta);

        return;
    }

    if (estado === ESTADOS.PAUSA) {
        if (teclaPressionadaAgora(TECLAS.ESC) || teclaPressionadaAgora(TECLAS.ENTER)) {
            definirEstado(ESTADOS.JOGANDO);
        }
        return;
    }

    if (estado === ESTADOS.FIM) {
        if (teclaPressionada(TECLAS.ENTER) || teclaPressionada(TECLAS.ESPACO)) {
            definirEstado(ESTADOS.INICIO);
        }
        return;
    }
}

function verificarFimDeJogo() {
    if (player.vidas <= 0) {
        resumoFinal = finalizarPlacar();
        definirEstado(ESTADOS.FIM);
    }
}

// ─── Renderização ──────────────────────────────────────────────────────────
function desenhar() {
    ctx.clearRect(0, 0, LARGURA_TELA, ALTURA_TELA);
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, LARGURA_TELA, ALTURA_TELA);

    const estado = getEstado();

    if (estado === ESTADOS.INICIO) {
        desenharTelaInicio();
        return;
    }

    if (estado === ESTADOS.FIM) {
        desenharTelaFim();
        return;
    }

    // Jogo e pausa
    desenharPista(ctx, LARGURA_TELA, ALTURA_TELA, deslocamento);
    desenharObstaculos(ctx, ALTURA_TELA);
    desenharItens(ctx);
    desenharPlayer(ctx, player);
    desenharHUD();

    if (estado === ESTADOS.PAUSA) {
        desenharTelaPausa();
    }
}

// ─── HUD ───────────────────────────────────────────────────────────────────
function desenharHUD() {
    const barAltura = 12;
    const barY      = ALTURA_TELA - 24;

    // Topo esquerdo — vidas e pontos
    ctx.fillStyle = '#ffffff';
    ctx.font      = '14px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`Vidas: ${player.vidas}`, 10, 20);
    ctx.fillText(`Pontos: ${getPontuacao()}`, 10, 38);
    ctx.fillText(`Moedas: ${getMoedas()}`, 10, 56);

    // Topo direito — velocidade e distância
    ctx.textAlign = 'right';
    ctx.fillText(`Vel: ${velocidadeGlobal.toFixed(1)}`, LARGURA_TELA - 10, 20);
    ctx.fillText(`Dist: ${getDistancia()}m`, LARGURA_TELA - 10, 38);
    ctx.fillText(`Rec: ${getRecorde()}`, LARGURA_TELA - 10, 56);

    // Barra de wheelie removida

    // ── Barra de turbo (centro) ───────────────────────────────────────────
    const turbo    = getTurbo(player);
    const tLargura = 160; // Aumentei um pouco a barra de turbo já que é a única no centro
    const tX       = (LARGURA_TELA / 2) - (tLargura / 2); // Centrada perfeitamente

    ctx.fillStyle = '#333';
    ctx.fillRect(tX, barY, tLargura, barAltura);

    ctx.fillStyle = '#333';
    ctx.fillRect(tX, barY, tLargura, barAltura);

    if (turbo.ativo) {
        const tProp   = turbo.tempoAtual / turbo.tempoMax;
        ctx.fillStyle = Math.floor(Date.now() / 100) % 2 === 0 ? '#00e5ff' : '#ffffff';
        ctx.fillRect(tX, barY, tLargura * tProp, barAltura);
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.fillText('TURBO ATIVO!', LARGURA_TELA / 2, barY - 3);
    } else if (turbo.carregado) {
        ctx.fillStyle = '#00e5ff';
        ctx.fillRect(tX, barY, tLargura, barAltura);
        
        // -- INDICADOR VISUAL TECLA Z NO CENTRO --
        const piscando = Math.floor(Date.now() / 200) % 2 === 0;
        const indTam = 22;
        const indX = (LARGURA_TELA / 2) - (indTam / 2);
        const indY = barY - 30; // Posicionado acima do texto "TURBO PRONTO"

        // Fundo da tecla
        ctx.fillStyle = piscando ? '#ffeb3b' : '#ffffff';
        ctx.fillRect(indX, indY, indTam, indTam);
        
        // Borda da tecla
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.strokeRect(indX, indY, indTam, indTam);

        // Letra Z
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 16px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('Z', indX + indTam / 2, indY + 16);

        // Texto principal
        ctx.fillStyle = '#00e5ff';
        ctx.font = '12px monospace';
        ctx.fillText('TURBO PRONTO', LARGURA_TELA / 2, barY - 6);

    } else {
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.fillText('SEM TURBO', LARGURA_TELA / 2, barY - 3);
    }
}

// ─── Telas de estado ───────────────────────────────────────────────────────
function desenharTelaInicio() {
    ctx.fillStyle = '#00e5ff';
    ctx.font      = 'bold 36px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('EXCITEBIKE JS', LARGURA_TELA / 2, ALTURA_TELA / 2 - 50);

    ctx.fillStyle = '#ffffff';
    ctx.font      = '16px monospace';
    ctx.fillText('Pressione ENTER ou ESPAÇO para iniciar', LARGURA_TELA / 2, ALTURA_TELA / 2 + 0);

    ctx.fillStyle = '#aaaaaa';
    ctx.font      = '12px monospace';
    ctx.fillText('↑ ↓  Mudar faixa', LARGURA_TELA / 2, ALTURA_TELA / 2 + 30);
    ctx.fillText('Z    Ativar turbo (quando carregado)', LARGURA_TELA / 2, ALTURA_TELA / 2 + 48);
    ctx.fillText('ESC  Pausar', LARGURA_TELA / 2, ALTURA_TELA / 2 + 66);

    ctx.fillStyle = '#555';
    ctx.font      = '12px monospace';
    ctx.fillText(`Recorde: ${getRecorde()} pts`, LARGURA_TELA / 2, ALTURA_TELA / 2 + 104);
}

function desenharTelaPausa() {
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.fillRect(0, 0, LARGURA_TELA, ALTURA_TELA);

    ctx.fillStyle = '#e8c840';
    ctx.font      = 'bold 32px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('PAUSA', LARGURA_TELA / 2, ALTURA_TELA / 2 - 10);

    ctx.fillStyle = '#ffffff';
    ctx.font      = '16px monospace';
    ctx.fillText('ESC ou ENTER para continuar', LARGURA_TELA / 2, ALTURA_TELA / 2 + 30);
}

function desenharTelaFim() {
    ctx.fillStyle = 'rgba(0,0,0,0.85)';
    ctx.fillRect(0, 0, LARGURA_TELA, ALTURA_TELA);

    ctx.fillStyle = '#ff4444';
    ctx.font      = 'bold 36px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('FIM DE JOGO', LARGURA_TELA / 2, ALTURA_TELA / 2 - 70);

    if (resumoFinal) {
        ctx.fillStyle = resumoFinal.novoRecorde ? '#ffd700' : '#ffffff';
        ctx.font      = resumoFinal.novoRecorde ? 'bold 18px monospace' : '16px monospace';
        ctx.fillText(
            resumoFinal.novoRecorde ? `🏆 NOVO RECORDE: ${resumoFinal.pontuacao} pts!` : `Pontuação: ${resumoFinal.pontuacao} pts`,
            LARGURA_TELA / 2, ALTURA_TELA / 2 - 20
        );

        ctx.fillStyle = '#ffffff';
        ctx.font      = '14px monospace';
        ctx.fillText(`Distância: ${resumoFinal.distancia}m`, LARGURA_TELA / 2, ALTURA_TELA / 2 + 10);
        ctx.fillText(`Moedas: ${resumoFinal.moedas}`, LARGURA_TELA / 2, ALTURA_TELA / 2 + 32);

        if (!resumoFinal.novoRecorde) {
            ctx.fillStyle = '#aaaaaa';
            ctx.fillText(`Recorde: ${resumoFinal.recorde} pts`, LARGURA_TELA / 2, ALTURA_TELA / 2 + 54);
        }
    }

    ctx.fillStyle = '#aaaaaa';
    ctx.font      = '14px monospace';
    ctx.fillText('ENTER ou ESPAÇO para voltar ao menu', LARGURA_TELA / 2, ALTURA_TELA / 2 + 90);
}

// ─── Arranque ──────────────────────────────────────────────────────────────
iniciar();