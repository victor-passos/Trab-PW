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
    vida1:         document.getElementById('vida-1'),
    vida2:         document.getElementById('vida-2'),
    vida3:         document.getElementById('vida-3'),
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
    selecao:       document.getElementById('tela-selecao'),
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

function tocarSFX(audioElement) {
    if (!audioElement) return;
    audioElement.currentTime = 0;
    audioElement.play().catch(() => {});
}

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
    som.contagem.pause(); 
}

// ── Estado global do loop ─────────────────────────────────────────────────
let velocidadeGlobal = VEL_INICIAL;
let deslocamento     = 0;
let ultimoTempo      = 0;
let player           = null;
let resumoFinal      = null;
let tempoContagem    = 0;

// ── Seleção de Personagem ─────────────────────────────────────────────────
const MOTOS = {
    1: { normal: 'assets/imagens/moto1.png', lama: 'assets/imagens/moto1lama.png' },
    2: { normal: 'assets/imagens/moto2.png', lama: 'assets/imagens/moto2lama.png' },
};
let motoSelecionada = 1;

function atualizarCards() {
    document.querySelectorAll('.card-personagem').forEach(card => {
        card.classList.toggle('selecionado', parseInt(card.dataset.moto) === motoSelecionada);
    });
}

function iniciarSelecaoMouse() {
    document.querySelectorAll('.card-personagem').forEach(card => {
        card.addEventListener('click', () => {
            motoSelecionada = parseInt(card.dataset.moto);
            atualizarCards();
        });
        card.addEventListener('dblclick', () => {
            motoSelecionada = parseInt(card.dataset.moto);
            atualizarCards();
            novoJogo();
        });
    });
}

function iniciar() {
    iniciarInput();
    initPistaDOM(els, ALTURA_TELA);
    els.inicioRec.innerText = getRecorde();
    definirEstado(ESTADOS.INICIO, els);
    iniciarSelecaoMouse();

    // Volumes de áudio
    som.menu.volume = 0.50;      
    som.gameplay.volume = 0.40;  
    som.gameover.volume = 0.60;  
    som.contagem.volume = 0.75;  
    som.start.volume = 0.80;     
    som.moeda.volume = 0.70;     
    som.turbo.volume = 0.85;     
    som.agua.volume = 0.90;      
    som.dano.volume = 0.80;      
    
    player = criarPlayer(LARGURA_TELA, ALTURA_TELA);
    iniciarFaixa(player, getLimitesPista(ALTURA_TELA));
    
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
    const moto = MOTOS[motoSelecionada];
    player = criarPlayer(LARGURA_TELA, ALTURA_TELA, moto.normal, moto.lama);
    iniciarFaixa(player, getLimitesPista(ALTURA_TELA));
    velocidadeGlobal = VEL_INICIAL;
    deslocamento     = 0;
    resumoFinal      = null;
    tempoContagem    = 3999; 

    resetarObstaculos();
    resetarItens();
    resetarPlacar();
    
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
            definirEstado(ESTADOS.SELECAO, els);
            atualizarCards();
        }
        return;
    }

    if (estado === ESTADOS.SELECAO) {
        if (teclaPressionadaAgora(TECLAS.ESQUERDA)) {
            motoSelecionada = motoSelecionada === 1 ? 2 : 1;
            atualizarCards();
        }
        if (teclaPressionadaAgora(TECLAS.DIREITA)) {
            motoSelecionada = motoSelecionada === 2 ? 1 : 2;
            atualizarCards();
        }
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
            som.gameplay.pause(); 
            definirEstado(ESTADOS.PAUSA, els); 
            return; 
        }

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
                tocarSFX(som.dano); 
                verificarFimDeJogo();
            },
            onMoeda: () => {
                registrarMoeda();
                tocarSFX(som.moeda); 
            },
            onTurbo: () => {
                tocarSFX(som.turbo); 
            },
            onAgua:  () => { 
                player.vidas = 0; 
                tocarSFX(som.agua); 
                verificarFimDeJogo(); 
            },
        });

        deslocamento += velocidadeGlobal * delta;
        atualizarPontuacao(velocidadeGlobal * delta);
        return;
    }

    if (estado === ESTADOS.PAUSA) {
        if (teclaPressionadaAgora(TECLAS.ESC) || teclaPressionadaAgora(TECLAS.ENTER)) {
            som.gameplay.play().catch(() => {}); 
            definirEstado(ESTADOS.JOGANDO, els);
        }
        return;
    }

    if (estado === ESTADOS.FIM) {
        if (teclaPressionadaAgora(TECLAS.ENTER) || teclaPressionadaAgora(TECLAS.ESPACO)) {
            els.inicioRec.innerText = getRecorde(); 
            tocarMusica(som.menu); 
            definirEstado(ESTADOS.INICIO, els);
        }
        return;
    }}

function verificarFimDeJogo() {
    if (player.vidas > 0) return;
    
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

    // Sistema de corações usando imagens dinâmicas
    els.vida1.src = player.vidas >= 1 ? 'assets/imagens/coracaocheio.png' : 'assets/imagens/coracaovazio.png';
    els.vida2.src = player.vidas >= 2 ? 'assets/imagens/coracaocheio.png' : 'assets/imagens/coracaovazio.png';
    els.vida3.src = player.vidas >= 3 ? 'assets/imagens/coracaocheio.png' : 'assets/imagens/coracaovazio.png';

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