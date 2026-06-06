import { teclaPressionada, TECLAS } from './input.js';
import { NUM_FAIXAS, getPosFaixa } from './pista.js';

const TAMX = 24;
const TAMY = 16;
const VEL_LATERAL = 0.2;
const DURACAO_TURBO = 180;
const MULTIPLICADOR_TURBO = 1.8;
const EMPINADA_TURBO = 0.4;
const VEL_EMPINADA_TURBO = 0.04;
const EMPINADA_RETORNO = 0.05;
const DURACAO_INVULNERABILIDADE = 90;
const DURACAO_CONTROLES_INVERTIDOS = 300;

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
        turboCarregado: false, 
        turboAtivo: false, 
        tempoDuracao: 0, 
        teclaTurboAtiva: false,
        invulneravelPosDano: false, 
        tempoInvulnerabilidade: 0,
        controlesInvertidos: false, 
        tempoControlesInvertidos: 0,
    };
}

export function iniciarFaixa(player, alturaPista){
    player.y = getPosFaixa(player.faixaAtual, alturaPista) - player.altura/2;
    player.yDestino = player.y;
}

export function atualizarPlayer(player, alturaPista, velocidadeGlobal){  
    const margemTopo  = alturaPista.topo;
    const margemBase  = alturaPista.base - player.altura;
    
    if (player.y < margemTopo)  player.y = margemTopo;
    if (player.y > margemBase)  player.y = margemBase;

    if (player.invulneravelPosDano) {
        player.tempoInvulnerabilidade--;
        if (player.tempoInvulnerabilidade <= 0) {
            player.invulneravelPosDano = false;
        }
    }

    if (player.controlesInvertidos) {
        player.tempoControlesInvertidos--;
        if (player.tempoControlesInvertidos <= 0) player.controlesInvertidos = false;
    }


    if(!teclaPressionada(TECLAS.BAIXO) && !teclaPressionada(TECLAS.CIMA)){
        player.teclaFaixaAtiva = false;
    }

    if(!player.teclaFaixaAtiva){
        //Inverte cima e baixo se o efeito da lama está ativo
        const teclaCima  = player.controlesInvertidos ? TECLAS.BAIXO : TECLAS.CIMA; 
        const teclaBaixo = player.controlesInvertidos ? TECLAS.CIMA  : TECLAS.BAIXO;


        if(teclaPressionada(teclaCima) && player.faixaAtual > 0){
            player.faixaAtual--;
            player.teclaFaixaAtiva = true;
        } else if(teclaPressionada(teclaBaixo) && player.faixaAtual < NUM_FAIXAS - 1){
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
        player.turboAtivo = true;
        player.turboCarregado  = false;
        player.teclaTurboAtiva = true;
        player.tempoDuracao = DURACAO_TURBO;
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
    if(player.empinada > 0){
        player.empinada = Math.max(player.empinada - EMPINADA_RETORNO, 0);
    }
}

export function ativarControlesInvertidos(player) {
    player.controlesInvertidos        = true;
    player.tempoControlesInvertidos   = DURACAO_CONTROLES_INVERTIDOS;
}


export function ativarInvulnerabilidadePosDano(player) {
    player.invulneravelPosDano = true;
    player.tempoInvulnerabilidade = DURACAO_INVULNERABILIDADE;
}

export function desenharPlayer(player, els) {
    if (player.invulneravelPosDano && Math.floor(Date.now() / 50) % 2 === 0) {
        els.player.style.opacity = '0';
        els.playerInd.style.opacity = '0';
    } else {
        els.player.style.opacity  = '1';
        els.playerInd.style.opacity = '1';
    }
 
    const velVibracao = player.turboAtivo ? 8 : 15;
    const ampVibracao = player.turboAtivo ? 2.0 : 1.0;
    const vibracaoY   = Math.sin(Date.now() / velVibracao) * ampVibracao;
 
    els.player.style.left      = player.x + 'px';
    els.player.style.top       = (player.y + vibracaoY) + 'px';
    els.player.style.transform = `rotate(${-player.empinada}rad)`;
 
    if (player.turboAtivo) {
        els.player.style.backgroundColor = '#00e5ff';
        els.player.style.boxShadow = '0 0 12px #00e5ff';
    }else if(player.controlesInvertidos){
        els.player.style.backgroundColor = '#6b3d0f';
        els.player.style.boxShadow  = 'none';

    } else {
        els.player.style.backgroundColor = player.cor;
        els.player.style.boxShadow       = 'none';
    }
 
    if (player.turboCarregado) {
        els.playerInd.style.display = 'block';
        els.playerInd.style.left = (player.x + player.largura / 2) + 'px';
        els.playerInd.style.top = (player.y - 12 + Math.sin(Date.now() / 150) * 3 + vibracaoY) + 'px';
        els.playerInd.style.color = Math.floor(Date.now() / 150) % 2 === 0 ? '#00e5ff' : '#ffffff';
    } else {
        els.playerInd.style.display = 'none';
    }
}

export function getTurbo(player) {
    return {
        carregado: player.turboCarregado,
        ativo: player.turboAtivo,
        tempoAtual: player.tempoDuracao,
        tempoMax: DURACAO_TURBO,
    };
}