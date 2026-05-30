const COR_CHAO = '#b07242';
const COR_LINHA = '#ffffff';
const COR_BORDA = '#3cb4009e';
const COR_MARCACAO = '#ffa560';
const ESPACAMENTO = 80;   // distância entre as linhas verticais (marcações)

export const NUM_FAIXAS = 4;
 
// Retorna os limites verticais da pista no canvas
export function obterLimitesPista(alturaTela) {
    const topo = Math.floor(alturaTela * 0.2);
    const base = Math.floor(alturaTela * 0.8);
    return { topo, base };
}

export function obterPosFaixa(faixa, limites) {
    const alturaPista  = limites.base - limites.topo;
    const alturaFaixa = alturaPista/NUM_FAIXAS;
    return limites.topo + faixa * alturaFaixa + alturaFaixa/2;
}


 
export function desenharPista(ctx, larguraTela, alturaTela, deslocamento) {
    const { topo, base } = obterLimitesPista(alturaTela);
    const alturaPista = base -topo;
    const alturaFaixa = alturaPista/NUM_FAIXAS;
 
    // --- Fundo da pista ---
    ctx.fillStyle = COR_CHAO;
    ctx.fillRect(0, topo, larguraTela, alturaPista);
 
    // --- Bordas superior e inferior da pista ---
    ctx.strokeStyle = COR_BORDA;
    ctx.lineWidth   = 3;
    
    ctx.beginPath();
    ctx.moveTo(0, topo);
    ctx.lineTo(larguraTela, topo);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(0, base);
    ctx.lineTo(larguraTela, base);
    ctx.stroke();
    
    // --- Divisoria das faixas ---
    ctx.strokeStyle = COR_LINHA;
    ctx.lineWidth   = 1;

    for (let i = 1; i < NUM_FAIXAS; i++){
        const y = topo + i * alturaFaixa;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(larguraTela, y);
        ctx.stroke();
    }

    ctx.setLineDash([]);

    // Marcações verticais
    ctx.strokeStyle = COR_MARCACAO;
    ctx.lineWidth = 1;
    ctx.setLineDash([6, 6]);
    
    // offset garante rolagem contínua sem saltos
    const offset = deslocamento % ESPACAMENTO;
    
    for (let x = -offset; x < larguraTela; x += ESPACAMENTO) {
        ctx.beginPath();
        ctx.moveTo(x, topo);
        ctx.lineTo(x, base);
        ctx.stroke();
    }
    
    ctx.setLineDash([]); // reseta o tracejado
}
