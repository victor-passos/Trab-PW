# Bike Runner

**Bike Runner** é um jogo runner arcade procedural em estilo clássico, desenvolvido utilizando **HTML5**, **CSS3** e **JavaScript modular**. O objetivo é pilotar sua moto, desviando de obstáculos, coletando itens e tentando alcançar a maior distância possível para bater seu recorde pessoal.

## Funcionalidades

- **Sistema de Faixas:** Troca dinâmica de pistas.
- **Power-ups:** Coleta de moedas para ganhar pontos e itens de Turbo para obter invulnerabilidade temporária.
- **Obstáculos Variados:**
  - **Lama:** Inverte os controles temporariamente.
  - **Água:** Remove todas as vidas instantaneamente.
  - **Veículos e Balas:** Causam dano de 1 vida.
- **HUD (Interface):** Monitoramento de vidas, pontuação, distância percorrida, recorde e barra de turbo.
- **Estados de Jogo:** Menus de início, contagem regressiva, pausa e fim de jogo.
- **Seleção de Personagem:** Escolha entre duas motos diferentes (alteração apenas estética).

## Como Executar

### Pré-requisitos

Certifique-se de ter o **Node.js** instalado em sua máquina.

### Instalação

Não é necessário instalar bibliotecas adicionais com `npm install`.

### Iniciando o Jogo

No terminal, dentro da pasta raiz do projeto, execute:

```bash
node game/js/node/index.js
```

> **Nota:** O arquivo `js/node/index.js` está configurado para servir os arquivos estáticos do diretório atual. Após executar o comando, acesse o endereço indicado no terminal, normalmente:
>
> `http://localhost:3000`

### Alternativa

O jogo também pode ser executado utilizando a extensão **Live Server** no **Visual Studio Code**.

## Controles

| Tecla | Ação |
|---------|---------|
| ↑ / ↓ | Mudar de faixa |
| Z | Ativar Turbo (quando a barra estiver cheia) |
| ESC | Pausar / Retomar o jogo |
| ENTER / ESPAÇO | Iniciar ou reiniciar o jogo |

## Estrutura do Projeto

```text
.
├── index.html
├── css/
│   └── style.css
└── js/
    ├── game.js
    ├── input.js
    ├── player.js
    ├── pista.js
    ├── obstaculos.js
    ├── itens.js
    ├── colisao.js
    ├── placar.js
    ├── estado.js
    └── node/
        ├── index.js
        └── package.json
```

### Principais Arquivos

| Arquivo | Descrição |
|----------|------------|
| `index.html` | Estrutura principal do jogo |
| `css/style.css` | Estilização e layout |
| `js/game.js` | Motor principal do jogo |
| `js/input.js` | Gerenciamento dos comandos do teclado |
| `js/player.js` | Lógica e animação do personagem |
| `js/pista.js` | Gerenciamento da pista |
| `js/obstaculos.js` | Controle dos obstáculos |
| `js/itens.js` | Controle dos itens coletáveis |
| `js/colisao.js` | Detecção de colisões |
| `js/placar.js` | Sistema de pontuação |
| `js/estado.js` | Controle dos estados do jogo |
| `js/node/index.js` | Servidor local para execução no navegador |
| `package.json` | Configurações do projeto Node.js |

## Tecnologias Utilizadas

- HTML5
- CSS3
- JavaScript (ES6 Modules)
- Node.js


## Divisão de Responsabilidades do Grupo
- **Victor Passos**:
    - Ideia inicial do jogo
    - Implementação dos elementos:
        - Movimentação base do jogo
        - Animações
        - Obstaculos
    - Musica e Efeitos Sonoros
    - Gestão da Main do github
    - Correção de Bugs

- **Lilian Alves**:
    - Implementação inicial dos elementos:
        - Colisão
        - Itens Coletaveis
        - Obstaculos
        - Placar
    - Implementação de Sprites e Visual do Jogo
    - Menus de Seleção de Personagem
    - Correção de Bugs