// game.js — ponto de entrada e loop principal do jogo

import { ESTADOS, obterEstado, definirEstado } from './estado.js';
import { iniciarInput, teclaPressionada, TECLAS } from './input.js';
import { criarPlayer, atualizarPlayer, desenharPlayer } from './player.js';
import { desenharPista, obterLimitesPista } from './pista.js';

// ─── Configuração do Canvas ────────────────────────────────────────────────
const tela    = document.getElementById('tela');
const ctx     = tela.getContext('2d');

const LARGURA_TELA  = 800;
const ALTURA_TELA   = 400;

tela.width  = LARGURA_TELA;
tela.height = ALTURA_TELA;

// ─── Estado global de jogo ─────────────────────────────────────────────────
let player       = null;
let deslocamento  = 0;   // quanto a pista já rolou (px)
let ultimoTempo   = 0;

// ─── Inicialização ─────────────────────────────────────────────────────────
function iniciar() {
    iniciarInput();

    const limitesPista = obterLimitesPista(ALTURA_TELA);
    player = criarPlayer(LARGURA_TELA, ALTURA_TELA);

    // Posiciona o player verticalmente no centro da pista
    player.y = limitesPista.topo + (limitesPista.base - limitesPista.topo) / 2 - player.altura / 2;

    definirEstado(ESTADOS.INICIO);
    requestAnimationFrame(loop);
}

// ─── Loop principal ────────────────────────────────────────────────────────
function loop(timestamp) {
    const deltaMs = timestamp - ultimoTempo;
    ultimoTempo   = timestamp;

    // Limita delta para evitar saltos grandes (ex: aba em segundo plano)
    const delta = Math.min(deltaMs / 16.67, 3);

    processar(delta);
    desenhar();

    requestAnimationFrame(loop);
}

// ─── Processamento por estado ──────────────────────────────────────────────
function processar(delta) {
    const estado = obterEstado();

    if (estado === ESTADOS.INICIO) {
        if (teclaPressionada(TECLAS.ENTER) || teclaPressionada(TECLAS.ESPACO)) {
        definirEstado(ESTADOS.JOGANDO);
        }
        return;
    }

    if (estado === ESTADOS.JOGANDO) {
        if (teclaPressionada(TECLAS.ESC)) {
        definirEstado(ESTADOS.PAUSA);
        return;
        }

        const limitesPista = obterLimitesPista(ALTURA_TELA);
        atualizarPlayer(player, LARGURA_TELA, limitesPista);

        // Avança o deslocamento da pista com base na velocidade do player
        deslocamento += player.velocidade * delta;
        return;
    }

    if (estado === ESTADOS.PAUSA) {
        if (teclaPressionada(TECLAS.ESC) || teclaPressionada(TECLAS.ENTER)) {
        definirEstado(ESTADOS.JOGANDO);
        }
        return;
    }
}

// ─── Renderização ──────────────────────────────────────────────────────────
function desenhar() {
    // Limpa o canvas
    ctx.clearRect(0, 0, LARGURA_TELA, ALTURA_TELA);

    // Fundo
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, LARGURA_TELA, ALTURA_TELA);

    const estado = obterEstado();

    if (estado === ESTADOS.INICIO) {
        desenharTelaInicio();
        return;
    }

    // Pista e player aparecem em todos os outros estados
    desenharPista(ctx, LARGURA_TELA, ALTURA_TELA, deslocamento);
    desenharPlayer(ctx, player);

    // HUD básico
    desenharHUD();

    if (estado === ESTADOS.PAUSA) {
        desenharTelaPausa();
    }
}

// ─── HUD ───────────────────────────────────────────────────────────────────
function desenharHUD() {
    ctx.fillStyle    = '#ffffff';
    ctx.font         = '14px monospace';
    ctx.textAlign    = 'left';
    ctx.fillText(`Vidas: ${player.vidas}`, 10, 20);
    ctx.fillText(`Pontos: ${player.pontuacao}`, 10, 38);

    ctx.textAlign = 'right';
    ctx.fillText(`Vel: ${player.velocidade.toFixed(1)}`, LARGURA_TELA - 10, 20);
    ctx.fillText(`Dist: ${Math.floor(deslocamento)}m`, LARGURA_TELA - 10, 38);
}

// ─── Telas de estado ───────────────────────────────────────────────────────
function desenharTelaInicio() {
    ctx.fillStyle = '#00e5ff';
    ctx.font      = 'bold 36px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('EXCITEBIKE JS', LARGURA_TELA / 2, ALTURA_TELA / 2 - 30);

    ctx.fillStyle = '#ffffff';
    ctx.font      = '18px monospace';
    ctx.fillText('Pressione ENTER ou ESPAÇO para iniciar', LARGURA_TELA / 2, ALTURA_TELA / 2 + 20);

    ctx.fillStyle = '#aaaaaa';
    ctx.font      = '13px monospace';
    ctx.fillText('↑ Acelerar  ↓ Frear  ← → Mudar posição', LARGURA_TELA / 2, ALTURA_TELA / 2 + 55);
    }

    function desenharTelaPausa() {
    // Overlay semitransparente
    ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
    ctx.fillRect(0, 0, LARGURA_TELA, ALTURA_TELA);

    ctx.fillStyle = '#e8c840';
    ctx.font      = 'bold 32px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('PAUSA', LARGURA_TELA / 2, ALTURA_TELA / 2 - 10);

    ctx.fillStyle = '#ffffff';
    ctx.font      = '16px monospace';
    ctx.fillText('ESC ou ENTER para continuar', LARGURA_TELA / 2, ALTURA_TELA / 2 + 30);
}

// ─── Arranque ─────────────────────────────────────────────────────────────
iniciar();