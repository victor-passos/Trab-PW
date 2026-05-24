const COR_CHAO = '#b07242';
const COR_LINHA = '#ffffff';
const COR_BORDA = '#e8c840';
const ESPACAMENTO = 80;   // distância entre as linhas verticais (marcações)
 
// Retorna os limites verticais da pista no canvas
export function obterLimitesPista(alturaTela) {
    const topo = Math.floor(alturaTela * 0.2);
    const base = Math.floor(alturaTela * 0.8);
    return { topo, base };
}
 
export function desenharPista(ctx, larguraTela, alturaTela, deslocamento) {
    const { topo, base } = obterLimitesPista(alturaTela);
 
    // --- Fundo da pista (retângulo verde) ---
    ctx.fillStyle = COR_CHAO;
    ctx.fillRect(0, topo, larguraTela, base - topo);
 
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
    
    // --- Linhas de marcação verticais (rolagem) ---
    ctx.strokeStyle = COR_LINHA;
    ctx.lineWidth   = 1;
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
