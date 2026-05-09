import React from 'react'
import { useLanguage } from "@/i18n/LanguageProvider";

const COLORS = {
  white: '#FFFFFF',
  sageDark: '#2F5C44',
  ink1: '#0F1B2A',
  ink2: '#2C3E50',
  ink3: '#5C6B7A',
  ink4: '#94A3B0',
  line: 'rgba(15,27,42,0.10)',
  err: '#C0334D',
  errBg: '#FDEDF2',
}

const VisualizacaoSecaoTubulacao = ({ resultados, parametros, actions }) => {
  const { t } = useLanguage();

  if (!resultados) return null

  const { laminaLiquida, forcaTraativa } = resultados.resultados
  const { diametro, laminaMaxima, forcaTrativaMin } = parametros
  const transbordando = resultados.verificacoes.transbordando

  // Verificar se há risco de sedimentação
  const temSedimentacao = !transbordando && forcaTraativa < forcaTrativaMin

  // Configurações do SVG (canvas dimensionado para acomodar anotações externas)
  const svgWidth = 420
  const svgHeight = 320
  const cx = 150
  const cy = svgHeight / 2
  const radius = 105

  // Verificar se lâmina excede critério
  const laminaExcedeCriterio = laminaLiquida > laminaMaxima

  // Calcular a altura da água baseada na lâmina líquida
  // Cap at 1.0 for visualization (pipe can't show more than full)
  const alturaAguaRelativa = Math.min(laminaLiquida, 1)

  // Status para a cor do badge de lâmina
  const laminaStatus = (transbordando || laminaExcedeCriterio)
    ? { fg: COLORS.err, bg: COLORS.errBg, border: 'rgba(192,51,77,0.3)' }
    : { fg: '#1E4D6B', bg: '#E8F0F5', border: 'rgba(30,77,107,0.25)' }

  // Função para criar o path da área molhada (preenchimento de baixo para cima)
  const criarPathAreaMolhada = () => {
    if (alturaAguaRelativa <= 0) return ""
    if (alturaAguaRelativa >= 1) {
      return `M ${cx} ${cy} m -${radius} 0 a ${radius} ${radius} 0 1 1 ${radius * 2} 0 a ${radius} ${radius} 0 1 1 -${radius * 2} 0`
    }
    const alturaAguaPixels = alturaAguaRelativa * (radius * 2)
    const ySuperficie = cy + radius - alturaAguaPixels
    const h = radius - alturaAguaPixels
    const w = Math.sqrt(radius * radius - h * h)
    const x1 = cx - w
    const x2 = cx + w
    const y = ySuperficie
    const largeArcFlag = alturaAguaRelativa > 0.5 ? 1 : 0
    return `M ${x1} ${y} A ${radius} ${radius} 0 ${largeArcFlag} 0 ${x2} ${y} Z`
  }

  // Calcular posição Y da superfície da água
  const calcularSuperficieAgua = () => {
    if (alturaAguaRelativa <= 0) return cy + radius
    if (alturaAguaRelativa >= 1) return cy - radius
    const alturaAguaPixels = alturaAguaRelativa * (radius * 2)
    return cy + radius - alturaAguaPixels
  }

  const superficieY = calcularSuperficieAgua()

  // Calcular largura da superfície da água
  const calcularLarguraSuperficie = () => {
    if (alturaAguaRelativa <= 0 || alturaAguaRelativa >= 1) return 0
    const h = radius - (alturaAguaRelativa * radius * 2)
    const w = Math.sqrt(radius * radius - h * h)
    return w * 2
  }

  const larguraSuperficie = calcularLarguraSuperficie()

  return (
    <section
      className="relative flex flex-col h-full"
      style={{
        background: COLORS.white,
        border: `1px solid ${COLORS.line}`,
        borderRadius: '4px',
        padding: '24px 28px',
      }}
    >
      <span
        aria-hidden="true"
        className="absolute"
        style={{ top: 0, left: 24, width: 28, height: 3, background: '#5C8A6E' }}
      />
      <header className="mb-5 pb-3" style={{ borderBottom: `1px solid ${COLORS.line}` }}>
        <h2
          className="font-mono text-sm font-extrabold tracking-[0.14em] uppercase"
          style={{ color: COLORS.sageDark }}
        >
          {t('visualization.section.title')}
        </h2>
        <p className="text-xs mt-1.5" style={{ color: COLORS.ink3 }}>{t('visualization.section.description')}</p>
      </header>
      <div className="flex-1 flex flex-col mx-auto w-full" style={{ maxWidth: 472 }}>
        <div className="w-full">
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            preserveAspectRatio="xMidYMid meet"
            className="w-full h-auto"
          >
            <defs>
              <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
                <polygon points="0 0, 8 3, 0 6" fill={COLORS.ink2} />
              </marker>
              <marker id="arrowhead-rev" markerWidth="8" markerHeight="6" refX="1" refY="3" orient="auto">
                <polygon points="8 0, 0 3, 8 6" fill={COLORS.ink2} />
              </marker>
              <marker id="dot" markerWidth="6" markerHeight="6" refX="3" refY="3">
                <circle cx="3" cy="3" r="2" fill={COLORS.ink2} />
              </marker>
              <pattern id="gridSecao" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(15,27,42,0.10)" strokeWidth="0.5" />
              </pattern>
            </defs>

            {/* Grid de papel milimetrado (sutil) */}
            <rect x="0" y="0" width={svgWidth} height={svgHeight} fill="url(#gridSecao)" />

            {/* Régua de ticks no topo */}
            <g stroke={COLORS.ink4} strokeWidth="0.5">
              {Array.from({ length: 21 }, (_, i) => {
                const x = (svgWidth / 20) * i
                const isMajor = i % 5 === 0
                return (
                  <line
                    key={`tick-t-${i}`}
                    x1={x}
                    y1={0}
                    x2={x}
                    y2={isMajor ? 5 : 2.5}
                    opacity={isMajor ? 0.5 : 0.3}
                  />
                )
              })}
            </g>
            {/* Régua de ticks na esquerda */}
            <g stroke={COLORS.ink4} strokeWidth="0.5">
              {Array.from({ length: 17 }, (_, i) => {
                const y = (svgHeight / 16) * i
                const isMajor = i % 4 === 0
                return (
                  <line
                    key={`tick-l-${i}`}
                    x1={0}
                    y1={y}
                    x2={isMajor ? 5 : 2.5}
                    y2={y}
                    opacity={isMajor ? 0.5 : 0.3}
                  />
                )
              })}
            </g>

            {/* Centerline horizontal (referência D/2) */}
            <line
              x1={cx - radius - 4}
              y1={cy}
              x2={cx + radius + 4}
              y2={cy}
              stroke={COLORS.ink4}
              strokeWidth="0.6"
              strokeDasharray="2,3"
            />

            {/* Círculo da tubulação */}
            <circle cx={cx} cy={cy} r={radius} fill="none" stroke={COLORS.ink2} strokeWidth="2.5" />

            {/* Área molhada */}
            {alturaAguaRelativa > 0 && (
              <path
                d={criarPathAreaMolhada()}
                fill={transbordando ? "#EF4444" : "#3B82F6"}
                fillOpacity="0.55"
                stroke={transbordando ? "#B91C1C" : "#1D4ED8"}
                strokeWidth="1"
              />
            )}

            {/* Superfície da água (tracejada) */}
            {alturaAguaRelativa > 0 && alturaAguaRelativa < 1 && larguraSuperficie > 0 && (
              <line
                x1={cx - larguraSuperficie / 2}
                y1={superficieY}
                x2={cx + larguraSuperficie / 2}
                y2={superficieY}
                stroke="#1D4ED8"
                strokeWidth="1.5"
                strokeDasharray="4,3"
              />
            )}

            {/* Partículas de sedimento */}
            {temSedimentacao && alturaAguaRelativa > 0 && (() => {
              const alturaAguaPixels = alturaAguaRelativa * (radius * 2);
              const ySuperficie = cy + radius - alturaAguaPixels;
              const estaDentroAreaMolhada = (x, y) => {
                if (y < ySuperficie) return false;
                const dx = x - cx;
                const dy = y - cy;
                return Math.sqrt(dx * dx + dy * dy) <= radius;
              };
              const sedimentos = [
                { x: cx, y: cy + radius - 3, r: 2.5 },
                { x: cx - 7, y: cy + radius - 4, r: 2 },
                { x: cx + 4, y: cy + radius - 3.5, r: 2 },
                { x: cx - 3, y: cy + radius - 6, r: 1.8 },
                { x: cx + 6, y: cy + radius - 5, r: 1.5 },
                { x: cx - 10, y: cy + radius - 5, r: 1.5 },
                { x: cx + 9, y: cy + radius - 7, r: 1.3 },
                { x: cx - 5, y: cy + radius - 8, r: 1.5 },
                { x: cx + 2, y: cy + radius - 9, r: 1.2 },
                { x: cx - 8, y: cy + radius - 7, r: 1.4 },
                { x: cx + 11, y: cy + radius - 6, r: 1.3 },
                { x: cx - 2, y: cy + radius - 10, r: 1 },
              ];
              if (alturaAguaRelativa > 0.15) {
                sedimentos.push({ x: cx - 15, y: cy + radius - 10, r: 1.2 }, { x: cx + 13, y: cy + radius - 11, r: 1 });
              }
              if (alturaAguaRelativa > 0.2) {
                sedimentos.push({ x: cx - 18, y: cy + radius - 13, r: 1 }, { x: cx + 16, y: cy + radius - 14, r: 0.9 }, { x: cx - 12, y: cy + radius - 12, r: 1.1 });
              }
              return (
                <>
                  {sedimentos.map((sed, idx) =>
                    estaDentroAreaMolhada(sed.x, sed.y) && (
                      <circle key={idx} cx={sed.x} cy={sed.y} r={sed.r} fill="#8B5CF6" />
                    )
                  )}
                </>
              );
            })()}

            {/* ─── ANOTAÇÃO DE DIÂMETRO (top) ─────────────────────── */}
            {/* Extension lines (pequenas linhas verticais nas bordas) */}
            <line x1={cx - radius} y1={cy - radius - 4} x2={cx - radius} y2={cy - radius - 22} stroke={COLORS.ink4} strokeWidth="0.6" />
            <line x1={cx + radius} y1={cy - radius - 4} x2={cx + radius} y2={cy - radius - 22} stroke={COLORS.ink4} strokeWidth="0.6" />
            {/* Linha de cota com setas */}
            <line
              x1={cx - radius}
              y1={cy - radius - 14}
              x2={cx + radius}
              y2={cy - radius - 14}
              stroke={COLORS.ink2}
              strokeWidth="1"
              markerStart="url(#arrowhead-rev)"
              markerEnd="url(#arrowhead)"
            />
            {/* Badge do diâmetro acima da linha de cota */}
            <rect
              x={cx - 38}
              y={cy - radius - 42}
              width="76"
              height="20"
              rx="3"
              fill={COLORS.white}
              stroke={COLORS.line}
              strokeWidth="0.6"
            />
            <text
              x={cx}
              y={cy - radius - 28}
              textAnchor="middle"
              fontFamily='"JetBrains Mono", monospace'
              fontSize="11"
              fontWeight="600"
              fill={COLORS.ink1}
            >
              Ø {diametro} mm
            </text>

            {/* ─── ANOTAÇÃO DE LÂMINA (y) — dimension externa + badge ─── */}
            {alturaAguaRelativa > 0 && !transbordando && (() => {
              const dimX = cx + radius + 24       // posição do eixo da cota vertical (fora do tubo)
              const yMid = (cy + radius + superficieY) / 2
              const badgeX = dimX + 14
              const badgeY = yMid - 18
              const badgeW = 78
              const badgeH = 36
              return (
                <g>
                  {/* Extension line — superfície da água */}
                  <line
                    x1={cx + (larguraSuperficie / 2)}
                    y1={superficieY}
                    x2={dimX + 6}
                    y2={superficieY}
                    stroke={COLORS.ink4}
                    strokeWidth="0.6"
                  />
                  {/* Extension line — fundo do tubo */}
                  <line
                    x1={cx}
                    y1={cy + radius}
                    x2={dimX + 6}
                    y2={cy + radius}
                    stroke={COLORS.ink4}
                    strokeWidth="0.6"
                  />
                  {/* Linha de cota vertical com setas (fora do tubo) */}
                  <line
                    x1={dimX}
                    y1={cy + radius}
                    x2={dimX}
                    y2={superficieY}
                    stroke={laminaStatus.fg}
                    strokeWidth="1.2"
                    markerStart="url(#arrowhead-rev)"
                    markerEnd="url(#arrowhead)"
                  />
                  {/* Badge com y/D + percentagem */}
                  <rect
                    x={badgeX}
                    y={badgeY}
                    width={badgeW}
                    height={badgeH}
                    rx="3"
                    fill={laminaStatus.bg}
                    stroke={laminaStatus.border}
                    strokeWidth="1"
                  />
                  <text
                    x={badgeX + badgeW / 2}
                    y={badgeY + 13}
                    textAnchor="middle"
                    fontFamily='"JetBrains Mono", monospace'
                    fontSize="9"
                    fontWeight="700"
                    letterSpacing="1"
                    fill={laminaStatus.fg}
                    opacity="0.75"
                  >
                    y/D
                  </text>
                  <text
                    x={badgeX + badgeW / 2}
                    y={badgeY + 28}
                    textAnchor="middle"
                    fontFamily='"JetBrains Mono", monospace'
                    fontSize="14"
                    fontWeight="700"
                    fill={laminaStatus.fg}
                  >
                    {(laminaLiquida * 100).toFixed(1)}%
                  </text>
                </g>
              )
            })()}

            {/* Quando transbordando — anotação especial */}
            {transbordando && (
              <g>
                <rect
                  x={cx + radius + 15}
                  y={cy - 22}
                  width="100"
                  height="44"
                  rx="6"
                  fill={COLORS.errBg}
                  stroke="rgba(192,51,77,0.3)"
                  strokeWidth="1"
                />
                <text
                  x={cx + radius + 65}
                  y={cy - 5}
                  textAnchor="middle"
                  fontFamily='"JetBrains Mono", monospace'
                  fontSize="9"
                  fontWeight="700"
                  letterSpacing="1"
                  fill={COLORS.err}
                  opacity="0.75"
                >
                  y / Ø
                </text>
                <text
                  x={cx + radius + 65}
                  y={cy + 12}
                  textAnchor="middle"
                  fontFamily='"JetBrains Mono", monospace'
                  fontSize="15"
                  fontWeight="700"
                  fill={COLORS.err}
                >
                  {(laminaLiquida * 100).toFixed(1)}%
                </text>
              </g>
            )}

            {/* Tick "Ø" embaixo (referência da base) */}
            <line x1={cx - 3} y1={cy + radius} x2={cx + 3} y2={cy + radius} stroke={COLORS.ink3} strokeWidth="1" />

            {/* FIG caption + title block (canto inferior direito) */}
            <line x1={20} y1={svgHeight - 24} x2={svgWidth - 20} y2={svgHeight - 24} stroke={COLORS.ink4} strokeWidth="0.5" opacity="0.4" />
            <text
              x={20}
              y={svgHeight - 10}
              fontFamily='"JetBrains Mono", monospace'
              fontSize="9"
              fontWeight="700"
              letterSpacing="1.2"
              fill={COLORS.ink2}
            >
              FIG. 01 · SEÇÃO TRANSVERSAL
            </text>
            <text
              x={svgWidth - 20}
              y={svgHeight - 10}
              textAnchor="end"
              fontFamily='"JetBrains Mono", monospace'
              fontSize="9"
              fontWeight="500"
              fill={COLORS.ink4}
              letterSpacing="0.5"
            >
              D = {diametro}mm
            </text>
          </svg>
        </div>
        
        {/* Ações: atingir meta + adicionar à tabela */}
        {actions && <div className="mt-4">{actions}</div>}

        {/* Legenda — empurrada para baixo */}
        <div className="mt-auto pt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs" style={{ color: COLORS.ink3 }}>
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-sm"
              style={{
                background: transbordando ? '#EF4444' : '#3B82F6',
                opacity: 0.55,
                border: `1px solid ${transbordando ? '#B91C1C' : '#1D4ED8'}`,
              }}
            ></div>
            <span>{transbordando ? t('visualization.section.overflowArea') : t('visualization.section.wettedArea')}</span>
          </div>
          {!transbordando && (
            <div className="flex items-center gap-2">
              <svg width="16" height="2"><line x1="0" y1="1" x2="16" y2="1" stroke="#1D4ED8" strokeWidth="1.5" strokeDasharray="3,2" /></svg>
              <span>{t('visualization.section.waterSurface')}</span>
            </div>
          )}
        </div>

        {/* Status alert quando transbordando ou excede critério */}
        {transbordando && (
          <div
            className="mt-4 flex items-center justify-center text-sm font-bold"
            style={{
              padding: '10px 14px',
              borderRadius: '3px',
              background: COLORS.errBg,
              border: `1px solid rgba(192,51,77,0.25)`,
              color: COLORS.err,
            }}
          >
            ⚠ {t('visualization.section.overflowWarning')}
          </div>
        )}
        {!transbordando && laminaExcedeCriterio && (
          <div
            className="mt-4 flex items-center justify-center text-sm font-semibold"
            style={{
              padding: '10px 14px',
              borderRadius: '3px',
              background: COLORS.errBg,
              border: `1px solid rgba(192,51,77,0.25)`,
              color: COLORS.err,
            }}
          >
            ⚠ {t('visualization.section.exceedsCriteria')}
          </div>
        )}
      </div>
    </section>
  )
}

export default VisualizacaoSecaoTubulacao 