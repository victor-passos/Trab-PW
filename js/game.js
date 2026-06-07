import { ESTADOS, getEstado, definirEstado } from './estado.js';
import { iniciarInput, teclaPressionadaAgora, TECLAS } from './input.js';
import { criarPlayer, atualizarPlayer, desenharPlayer, getTurbo, iniciarFaixa } from './player.js';
import { initPistaDOM, atualizarPista, getLimitesPista } from './pista.js';
import { atualizarObstaculos, resetarObstaculos, getObstaculos } from './obstaculos.js';
import { atualizarItens, resetarItens, getItens } from './itens.js';
import { verificarColisoes, aplicarColisoes } from './colisao.js';
import { atualizarPontuacao, registrarMoeda, resetarPlacar, getPontuacao, getDistancia, getRecorde, getMoedas, finalizarPlacar } from './placar.js';

// ── Constantes Gerais ─────────────────────────────────────────────────────
const LARGURA_TELA = 800;
const ALTURA_TELA  = 400;
const VEL_INICIAL = 5;
const VEL_MAXIMA = 14;
const INCREMENTO_VEL = 0.0005;

// ── Elementos DOM Cache ───────────────────────────────────────────────────
const els = {
    marcacoes:     document.getElementById('marcacoes'),
    faixas:        document.getElementById('faixas'),
    entidades:     document.getElementById('entidades'),
    player:        document.getElementById('player'),
    playerInd:     document.getElementById('player-indicador'),
    vidas:         document.getElementById('hud-vidas'),
    pontos:        document.getElementById('hud-pontos'),
    moedas:        document.getElementById('hud-moedas'),
    vel:           document.getElementById('hud-vel'),
    dist:          document.getElementById('hud-dist'),
    rec:           document.getElementById('hud-rec'),
    turboFill:     document.getElementById('hud-turbo-fill'),
    turboText:     document.getElementById('hud-turbo-text'),
    zInd:          document.getElementById('hud-z-indicator'),
    zKey:          document.querySelector('.z-key'),
    telas:         document.querySelectorAll('.tela'),
    inicio:        document.getElementById('tela-inicio'),
    contagem:      document.getElementById('tela-contagem'), // Adicionado
    textoContagem: document.getElementById('texto-contagem'), // Adicionado
    pausa:         document.getElementById('tela-pausa'),
    fim:           document.getElementById('tela-fim'),
    inicioRec:     document.getElementById('inicio-recorde'),
    fimRecMsg:     document.getElementById('fim-recorde-msg'),
    fimStats:      document.getElementById('fim-stats-container')
};

// ── Estado global do loop ─────────────────────────────────────────────────
let velocidadeGlobal = VEL_INICIAL;
let deslocamento     = 0;
let ultimoTempo      = 0;
let player           = null;
let resumoFinal      = null;
let tempoContagem    = 0; // Controla o tempo da contagem de início

function iniciar() {
    iniciarInput();
    initPistaDOM(els, ALTURA_TELA);
    els.inicioRec.innerText = getRecorde();
    definirEstado(ESTADOS.INICIO, els);
    
    // Inicializa uma instância provisória do jogador para os menus não quebrarem
    player = criarPlayer(LARGURA_TELA, ALTURA_TELA);
    iniciarFaixa(player, getLimitesPista(ALTURA_TELA));
    
    requestAnimationFrame(loop);
}

function novoJogo() {
    player           = criarPlayer(LARGURA_TELA, ALTURA_TELA); 
    iniciarFaixa(player, getLimitesPista(ALTURA_TELA));
    velocidadeGlobal = VEL_INICIAL;
    deslocamento     = 0;
    resumoFinal      = null;
    tempoContagem    = 3999; // Cerca de 4 segundos (3, 2, 1, VAI!)

    resetarObstaculos();
    resetarItens();
    resetarPlacar();
    
    // Muda para o estado de Preparação antes de Jogar!
    definirEstado(ESTADOS.PREPARANDO, els);
}

function loop(timestamp) {
    if (!ultimoTempo) ultimoTempo = timestamp;
    const deltaMs = timestamp - ultimoTempo;
    ultimoTempo   = timestamp;
    const delta   = Math.min(deltaMs / 16.67, 3); // Limita saltos de tempo (lag spike protection)

    processar(delta, deltaMs);
    desenharDOM();
    requestAnimationFrame(loop);
}

function processar(delta, deltaMs) {
    const estado = getEstado();

    if (estado === ESTADOS.INICIO) {
        if (teclaPressionadaAgora(TECLAS.ENTER) || teclaPressionadaAgora(TECLAS.ESPACO)) {
            novoJogo();
        }
        return;
    }

    // --- LÓGICA DE CONTAGEM REGRESSIVA ---
    if (estado === ESTADOS.PREPARANDO) {
        tempoContagem -= deltaMs;

        if (tempoContagem > 3000) {
            els.textoContagem.innerText = "3";
        } else if (tempoContagem > 2000) {
            els.textoContagem.innerText = "2";
        } else if (tempoContagem > 1000) {
            els.textoContagem.innerText = "1";
        } else if (tempoContagem > 0) {
            els.textoContagem.innerText = "VAI!";
        } else {
            // Terminou a contagem, a corrida começa!
            definirEstado(ESTADOS.JOGANDO, els);
        }
        return; // Não atualiza pista nem obstáculos enquanto estiver contando
    }

    if (estado === ESTADOS.JOGANDO) {
        if (teclaPressionadaAgora(TECLAS.ESC)) { 
            definirEstado(ESTADOS.PAUSA, els); 
            return; 
        }

        velocidadeGlobal = Math.min(velocidadeGlobal + INCREMENTO_VEL, VEL_MAXIMA);

        // Atualização de lógicas de entidades usando os parâmetros corretos
        atualizarPlayer(player, getLimitesPista(ALTURA_TELA), velocidadeGlobal);
        atualizarObstaculos(velocidadeGlobal, delta, LARGURA_TELA, ALTURA_TELA, els);
        atualizarItens(velocidadeGlobal, delta, LARGURA_TELA, ALTURA_TELA, els);

        // Resolução de Colisões
        const resultados = verificarColisoes(player, getObstaculos(), getItens());
        aplicarColisoes(player, resultados, {
            onDano:  () => verificarFimDeJogo(),
            onMoeda: () => registrarMoeda(),
            onAgua:  () => { player.vidas = 0; verificarFimDeJogo(); },
        });

        deslocamento += velocidadeGlobal * delta;
        atualizarPontuacao(velocidadeGlobal * delta);
        return;
    }

    if (estado === ESTADOS.PAUSA) {
        if (teclaPressionadaAgora(TECLAS.ESC) || teclaPressionadaAgora(TECLAS.ENTER)) {
            definirEstado(ESTADOS.JOGANDO, els);
        }
        return;
    }

    if (estado === ESTADOS.FIM) {
        if (teclaPressionadaAgora(TECLAS.ENTER) || teclaPressionadaAgora(TECLAS.ESPACO)) {
            els.inicioRec.innerText = getRecorde(); 
            definirEstado(ESTADOS.INICIO, els);
        }
        return;
    }
}

function verificarFimDeJogo() {
    if (player.vidas > 0) return;
    
    resumoFinal = finalizarPlacar();

    if (resumoFinal.novoRecorde) {
        els.fimRecMsg.innerText    = `🏆 NOVO RECORDE: ${resumoFinal.pontuacao} pts!`;
        els.fimRecMsg.style.color  = '#ffd700';
    } else {
        els.fimRecMsg.innerText    = `Pontuação obtida: ${resumoFinal.pontuacao} pts`;
        els.fimRecMsg.style.color  = '#ffffff';
    }

    els.fimStats.innerHTML = `
        Distância alcançada: ${resumoFinal.distancia}m<br>
        Moedas recolhidas: ${resumoFinal.moedas}<br>
        <span style="color:#aaaaaa; font-size:12px; margin-top:10px; display:inline-block;">
            ${!resumoFinal.novoRecorde ? `Recorde anterior: ${resumoFinal.recorde} pts` : ''}
        </span>
    `;

    definirEstado(ESTADOS.FIM, els);
}

// Manipulação puramente visual da Árvore HTML/CSS do documento
function desenharDOM() {
    const estado = getEstado();
    // A tela vai renderizar a pista e o player também durante o PREPARANDO
    if (estado !== ESTADOS.JOGANDO && estado !== ESTADOS.PAUSA && estado !== ESTADOS.PREPARANDO) return;

    // Deslocar as faixas da pista
    atualizarPista(deslocamento, els);

    // Atualizar números de HUD
    els.vidas.innerText  = player.vidas;
    els.pontos.innerText = getPontuacao();
    els.moedas.innerText = getMoedas();
    els.vel.innerText    = velocidadeGlobal.toFixed(1);
    els.dist.innerText   = getDistancia();
    els.rec.innerText    = getRecorde();

    // Interface Visual do Power-up
    const turbo = getTurbo(player);
    if (turbo.ativo) {
        const tProp = turbo.tempoAtual / turbo.tempoMax;
        els.turboFill.style.width           = (tProp * 100) + '%';
        els.turboFill.style.backgroundColor = Math.floor(Date.now() / 100) % 2 === 0 ? '#00e5ff' : '#ffffff';
        els.turboText.innerText             = 'TURBO ATIVO!';
        els.turboText.style.color           = '#ffffff';
        els.zInd.style.display              = 'none';
    } else if (turbo.carregado) {
        els.turboFill.style.width           = '100%';
        els.turboFill.style.backgroundColor = '#00e5ff';
        els.turboText.innerText             = 'TURBO PRONTO';
        els.turboText.style.color           = '#00e5ff';
        els.zInd.style.display              = 'block';
        els.zKey.style.backgroundColor      = Math.floor(Date.now() / 200) % 2 === 0 ? '#ffeb3b' : '#ffffff';
    } else {
        els.turboFill.style.width  = '0%';
        els.turboText.innerText    = 'SEM TURBO';
        els.turboText.style.color  = '#ffffff';
        els.zInd.style.display     = 'none';
    }

    // Traduzir posições X e Y para propriedades style CSS (movimento dos elementos)
    const obstaculosAtivos = getObstaculos();
    for (const obs of obstaculosAtivos) {
        if (obs.element) obs.element.style.left = obs.x + 'px';
    }

    const itensAtivos = getItens();
    for (const item of itensAtivos) {
        if (item.element) {
            item.element.style.left = item.x + 'px';
            const scale = 1 + Math.sin(item.pulsacao) * 0.15;
            item.element.style.transform = `scale(${scale})`;
        }
    }

    // Invoca propriedades visuais do jogador (brilhos, vibrações, etc)
    desenharPlayer(player, els); 
}

// ── Iniciar Aplicação ────────────────────────────────────────────────────────
iniciar();