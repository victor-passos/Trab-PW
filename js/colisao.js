import { TIPO_OBSTACULO } from './obstaculos.js';
import { ativarInvulnerabilidadePosDano, ativarControlesInvertidos } from './player.js';

export const RESULTADO_COLISAO = {
    NENHUM: 'nenhum',
    DANO:'dano',
    LAMA:'lama',
    AGUA:'agua',
    COLETOU_MOEDA:'coletou_moeda',
    COLETOU_TURBO:'coletou_turbo',
};

const HITBOX = 8;

function getHitbox(entidade) {
    return {
        x: entidade.x + HITBOX,
        y: entidade.y + HITBOX,
        largura: entidade.largura - HITBOX * 2,
        altura: entidade.altura  - HITBOX * 2,
    };
}

function colidindo(a, b) {
    const ha = getHitbox(a);
    const hb = getHitbox(b);
 
    return (
        ha.x < hb.x + hb.largura  &&
        ha.x + ha.largura > hb.x  &&
        ha.y < hb.y + hb.altura   &&
        ha.y + ha.altura > hb.y
    );
}

export function verificarColisoes(player, obstaculos, itens) {
    const resultados = [];
 
    const invulneravel = player.turboAtivo || player.invulneravelPosDano;
 
    for (const obs of obstaculos) {
        if (!colidindo(player, obs)) continue;
 
        if (invulneravel) continue; 
 
        switch (obs.tipo) {
            case TIPO_OBSTACULO.LAMA:
                resultados.push({ tipo: RESULTADO_COLISAO.LAMA, origem: obs });
                break;
            case TIPO_OBSTACULO.AGUA:
                resultados.push({ tipo: RESULTADO_COLISAO.AGUA, origem: obs });
                break;
            case TIPO_OBSTACULO.VEICULO:
            case TIPO_OBSTACULO.BALA:
                resultados.push({ tipo: RESULTADO_COLISAO.DANO, origem: obs });
                break;
        }
    }
    
    for (const item of itens) {
        if (item.coletado) continue;
        if (!colidindo(player, item)) continue;
 
        if (item.tipo === 'moeda') {
            resultados.push({ tipo: RESULTADO_COLISAO.COLETOU_MOEDA, origem: item });
        } else if (item.tipo === 'turbo') {
            resultados.push({ tipo: RESULTADO_COLISAO.COLETOU_TURBO, origem: item });
        }
 
        item.coletado = true;
    }
 
    return resultados;
}

export function aplicarColisoes(player, resultados, callbacks) {
    let danoAplicado = false;
 
    for (const resultado of resultados) {
        switch (resultado.tipo) {
 
            case RESULTADO_COLISAO.DANO:
                if (!danoAplicado && !player.invulneravelPosDano) {
                    player.vidas--;
                    danoAplicado = true;
                    
                    ativarInvulnerabilidadePosDano(player);
                    if (callbacks.onDano) callbacks.onDano(player);
                }
                break;
 
                case RESULTADO_COLISAO.LAMA:
                if (!player.controlesInvertidos) {
                    ativarControlesInvertidos(player);
                    if (callbacks.onLama) callbacks.onLama(player);
                }
                break;
 
            case RESULTADO_COLISAO.AGUA:
                player.velocidade = 0;
                if (callbacks.onAgua) callbacks.onAgua(player);
                break;
 
            case RESULTADO_COLISAO.COLETOU_MOEDA:
                if (callbacks.onMoeda) callbacks.onMoeda(player);
                break;
 
            case RESULTADO_COLISAO.COLETOU_TURBO:
                player.turboCarregado = true;
                if (callbacks.onTurbo) callbacks.onTurbo(player);
                break;
        }
    }
}