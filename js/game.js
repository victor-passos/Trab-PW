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
    contagem:      document.getElementById('tela-contagem'),
    textoContagem: document.getElementById('texto-contagem'),
    pausa:         document.getElementById('tela-pausa'),
    fim:           document.getElementById('tela-fim'),
    inicioRec:     document.getElementById('inicio-recorde'),
    fimRecMsg:     document.getElementById('fim-recorde-msg'),
    fimStats:      document.getElementById('fim-stats-container')
};

// ── Cache de Áudios ───────────────────────────────────────────────────────
const som = {
    menu:         document.getElementById('snd-menu'),
    gameplay:     document.getElementById('snd-gameplay'),
    gameover:     document.getElementById('snd-gameover'),
    start:        document.getElementById('snd-start'),
    contagem:     document.getElementById('snd-contagem'),
    moeda:        document.getElementById('snd-moeda'),
    turbo:        document.getElementById('snd-turbo'),
    agua:         document.getElementById('snd-agua'),
    dano:         document.getElementById('snd-dano')
};

// Helper para tocar SFX resetando o tempo atual (permite sons rápidos sobrepostos)
function tocarSFX(audioElement) {
    if (!audioElement) return;
    audioElement.currentTime = 0;
    audioElement.play().catch(() => {});
}

// Helper para gerenciar músicas de fundo de forma limpa
function tocarMusica(musicaElement) {
    pararTodasMusicas();
    if (musicaElement) {
        musicaElement.currentTime = 0;
        musicaElement.play().catch(() => {});
    }
}

function pararTodasMusicas() {
    som.menu.pause();
    som.gameplay.pause();
    som.gameover.pause();
    som.contagem.pause(); // Garante que a contagem pare quando outra música for tocada
}

// ── Estado global do loop ─────────────────────────────────────────────────
let velocidadeGlobal = VEL_INICIAL;
let deslocamento     = 0;
let ultimoTempo      = 0;
let player           = null;
let resumoFinal      = null;
let tempoContagem    = 0;

function iniciar() {
    iniciarInput();
    initPistaDOM(els, ALTURA_TELA);
    els.inicioRec.innerText = getRecorde();
    definirEstado(ESTADOS.INICIO, els);

    // Ajuste fino dos volumes de áudio (escala de 0.0 a 1.0)
    som.menu.volume = 0.50;      // Trilha de menu moderada (50%)
    som.gameplay.volume = 0.40;  // Trilha de gameplay mais baixa (40%) para destacar efeitos
    som.gameover.volume = 0.60;  // Trilha de gameover equilibrada (60%)
    som.contagem.volume = 0.75;  // Música de contagem envolvente (75%)
    som.start.volume = 0.80;     // Som de início destacado (80%)
    som.moeda.volume = 0.70;     // Brilho do som de moeda (70%)
    som.turbo.volume = 0.85;     // Efeito sonoro do turbo marcante (85%)
    som.agua.volume = 0.70;      // Efeito de mergulho bem nítido (90%)
    som.dano.volume = 0.80;      // Som de dano/colisão limpo e impactante (80%)
    
    player = criarPlayer(LARGURA_TELA, ALTURA_TELA);
    iniciarFaixa(player, getLimitesPista(ALTURA_TELA));
    
    // Tenta iniciar a música do menu na primeira interação do usuário com a página
    const iniciarMusicaMenu = () => {
        if (getEstado() === ESTADOS.INICIO && som.menu.paused) {
            som.menu.play().catch(() => {});
        }
        window.removeEventListener('click', iniciarMusicaMenu);
        window.removeEventListener('keydown', iniciarMusicaMenu);
    };
    window.addEventListener('click', iniciarMusicaMenu);
    window.addEventListener('keydown', iniciarMusicaMenu);

    requestAnimationFrame(loop);
}

function novoJogo() {
    player           = criarPlayer(LARGURA_TELA, ALTURA_TELA); 
    iniciarFaixa(player, getLimitesPista(ALTURA_TELA));
    velocidadeGlobal = VEL_INICIAL;
    deslocamento     = 0;
    resumoFinal      = null;
    tempoContagem    = 3999; 

    resetarObstaculos();
    resetarItens();
    resetarPlacar();
    
    // Para músicas anteriores, emite o bleep de start e engaja a música de contagem
    pararTodasMusicas();
    tocarSFX(som.start);
    tocarMusica(som.contagem);
    
    definirEstado(ESTADOS.PREPARANDO, els);
}

function loop(timestamp) {
    if (!ultimoTempo) ultimoTempo = timestamp;
    const deltaMs = timestamp - ultimoTempo;
    ultimoTempo   = timestamp;
    const delta   = Math.min(deltaMs / 16.67, 3);

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
            tocarMusica(som.gameplay);
            definirEstado(ESTADOS.JOGANDO, els);
            return;
        }
        return;
    }

    if (estado === ESTADOS.JOGANDO) {
        if (teclaPressionadaAgora(TECLAS.ESC)) { 
            som.gameplay.pause(); // Pausa a música de fundo temporariamente
            definirEstado(ESTADOS.PAUSA, els); 
            return; 
        }

        // Toca o som do turbo se o botão for pressionado e o turbo estiver carregado
        if (teclaPressionadaAgora(TECLAS.TURBO) && player.turboCarregado && !player.turboAtivo) {
            tocarSFX(som.turbo);
        }

        velocidadeGlobal = Math.min(velocidadeGlobal + INCREMENTO_VEL, VEL_MAXIMA);

        atualizarPlayer(player, getLimitesPista(ALTURA_TELA), velocidadeGlobal);
        atualizarObstaculos(velocidadeGlobal, delta, LARGURA_TELA, ALTURA_TELA, els);
        atualizarItens(velocidadeGlobal, delta, LARGURA_TELA, ALTURA_TELA, els);

        const resultados = verificarColisoes(player, getObstaculos(), getItens());
        aplicarColisoes(player, resultados, {
            onDano:  () => {
                tocarSFX(som.dano); // Executa o SFX de colisão/dano
                verificarFimDeJogo();
            },
            onMoeda: () => {
                registrarMoeda();
                tocarSFX(som.moeda); // SFX de coletar moeda
            },
            onTurbo: () => {
                tocarSFX(som.turbo); // SFX ao coletar o item turbo da pista
            },
            onAgua:  () => { 
                player.vidas = 0; 
                tocarSFX(som.agua); // SFX específico de queda na água
                verificarFimDeJogo(); 
            },
        });

        deslocamento += velocidadeGlobal * delta;
        atualizarPontuacao(velocidadeGlobal * delta);
        return;
    }

    if (estado === ESTADOS.PAUSA) {
        if (teclaPressionadaAgora(TECLAS.ESC) || teclaPressionadaAgora(TECLAS.ENTER)) {
            som.gameplay.play().catch(() => {}); // Retoma a música da corrida
            definirEstado(ESTADOS.JOGANDO, els);
        }
        return;
    }

    if (estado === ESTADOS.FIM) {
        if (teclaPressionadaAgora(TECLAS.ENTER) || teclaPressionadaAgora(TECLAS.ESPACO)) {
            els.inicioRec.innerText = getRecorde(); 
            tocarMusica(som.menu); // Retoma a música do menu inicial
            definirEstado(ESTADOS.INICIO, els);
        }
        return;
    }
}

function verificarFimDeJogo() {
    if (player.vidas > 0) return;
    
    // Toca a trilha de gameover quando as vidas acabam
    tocarMusica(som.gameover);
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

function desenharDOM() {
    const estado = getEstado();
    if (estado !== ESTADOS.JOGANDO && estado !== ESTADOS.PAUSA && estado !== ESTADOS.PREPARANDO) return;

    atualizarPista(deslocamento, els);

    els.vidas.innerText  = player.vidas;
    els.pontos.innerText = getPontuacao();
    els.moedas.innerText = getMoedas();
    els.vel.innerText    = velocidadeGlobal.toFixed(1);
    els.dist.innerText   = getDistancia();
    els.rec.innerText    = getRecorde();

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

    desenharPlayer(player, els); 
}

iniciar();