import React from 'react'
import { useLanguage } from "@/i18n/LanguageProvider";

const COLORS = {
  white: '#FFFFFF',
  sage: '#5C8A6E',
  sageDark: '#2F5C44',
  ink1: '#0F1B2A',
  ink2: '#2C3E50',
  ink3: '#5C6B7A',
  ink4: '#94A3B0',
  line: 'rgba(15,27,42,0.10)',
  ok: '#3D8C5C',
  okBg: '#EAF3EC',
  err: '#C0334D',
  errBg: '#FDEDF2',
}

const VisualizacaoPerfilRede = ({ resultados, parametros }) => {
  const { t } = useLanguage();

  if (!resultados) return null

  const { laminaLiquida, velocidade, forcaTraativa } = resultados.resultados
  const { diametro, declividade, forcaTrativaMin } = parametros
  const transbordando = resultados.verificacoes.transbordando

  // Configurações do SVG
  const svgWidth = 400
  const svgHeight = 240
  const tuboLength = 300
  const tuboHeight = 40

  // Exagerar a inclinação para melhor visualização (multiplicar por fator de escala)
  const fatorEscalaDeclividade = 50 // Exagerar 50x para visualização
  const inclinacaoVisual = declividade * tuboLength * fatorEscalaDeclividade

  // Limitar a inclinação visual para não sair da tela
  const inclinacaoLimitada = Math.min(inclinacaoVisual, svgHeight * 0.3)

  // Posições do tubo (slope desce da esquerda para a direita)
  const startX = 50
  const startY = svgHeight - 150
  const endX = startX + tuboLength
  const endY = startY + inclinacaoLimitada

  // Altura da água no tubo (cap at full pipe for visualization)
  const alturaAguaRelativa = Math.min(laminaLiquida, 1)
  const alturaAguaPixels = tuboHeight * alturaAguaRelativa

  const corAgua = transbordando ? '#EF4444' : '#3B82F6'
  const statusFluxo = transbordando ? 'overflow' : (forcaTraativa >= forcaTrativaMin ? 'normal' : 'sedimentacao')

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
        style={{ top: 0, left: 24, width: 28, height: 3, background: COLORS.sage }}
      />
      <header className="mb-5 pb-3" style={{ borderBottom: `1px solid ${COLORS.line}` }}>
        <h2
          className="font-mono text-sm font-extrabold tracking-[0.14em] uppercase"
          style={{ color: COLORS.sageDark }}
        >
          {t('visualization.profile.title')}
        </h2>
        <p className="text-xs mt-1.5" style={{ color: COLORS.ink3 }}>{t('visualization.profile.description')}</p>
      </header>
      <div className="flex-1 flex flex-col">
        <div className="w-full">
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            preserveAspectRatio="xMidYMid meet"
            className="rounded w-full h-auto"
            style={{ border: `1px solid ${COLORS.line}`, maxHeight: '260px' }}
          >
            <defs>
              <pattern id="gridPerfil" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(15,27,42,0.10)" strokeWidth="0.5" />
              </pattern>
            </defs>
            {/* Grid de papel milimetrado (sutil) */}
            <rect x="0" y="0" width={svgWidth} height={svgHeight} fill="url(#gridPerfil)" />

            {/* Régua de ticks no topo */}
            <g stroke={COLORS.ink4} strokeWidth="0.5">
              {Array.from({ length: 21 }, (_, i) => {
                const x = (svgWidth / 20) * i
                const isMajor = i % 5 === 0
                return (
                  <line key={`tick-t-${i}`} x1={x} y1={0} x2={x} y2={isMajor ? 5 : 2.5} opacity={isMajor ? 0.5 : 0.3} />
                )
              })}
            </g>

            {/* Tubulação (contorno superior) */}
            <line
              x1={startX}
              y1={startY}
              x2={endX}
              y2={endY}
              stroke="#374151"
              strokeWidth="3"
            />
            
            {/* Tubulação (contorno inferior) */}
            <line
              x1={startX}
              y1={startY + tuboHeight}
              x2={endX}
              y2={endY + tuboHeight}
              stroke="#374151"
              strokeWidth="3"
            />
            
            {/* Laterais da tubulação */}
            <line
              x1={startX}
              y1={startY}
              x2={startX}
              y2={startY + tuboHeight}
              stroke="#374151"
              strokeWidth="3"
            />
            <line
              x1={endX}
              y1={endY}
              x2={endX}
              y2={endY + tuboHeight}
              stroke="#374151"
              strokeWidth="3"
            />
            
            {/* Água/esgoto dentro da tubulação */}
            {alturaAguaRelativa > 0 && (
              <polygon
                points={`
                  ${startX},${startY + tuboHeight - alturaAguaPixels}
                  ${endX},${endY + tuboHeight - alturaAguaPixels}
                  ${endX},${endY + tuboHeight}
                  ${startX},${startY + tuboHeight}
                `}
                fill={corAgua}
                fillOpacity="0.7"
                stroke={corAgua}
                strokeWidth="1"
              />
            )}

            {/* Superfície da água */}
            {alturaAguaRelativa > 0 && (
              <line
                x1={startX}
                y1={startY + tuboHeight - alturaAguaPixels}
                x2={endX}
                y2={endY + tuboHeight - alturaAguaPixels}
                stroke={corAgua}
                strokeWidth="2"
                strokeDasharray="3,3"
              />
            )}
            
            {/* Seta de fluxo — inclinada igual à tubulação (esquerda → direita, descendo) */}
            {(() => {
              const midX = startX + tuboLength / 2
              const midY = (startY + endY) / 2 + tuboHeight / 2
              const angleDeg = Math.atan2(endY - startY, endX - startX) * 180 / Math.PI
              return (
                <g transform={`rotate(${angleDeg}, ${midX}, ${midY})`}>
                  <line
                    x1={midX - 20}
                    y1={midY}
                    x2={midX + 20}
                    y2={midY}
                    stroke="#000000"
                    strokeWidth="2"
                  />
                  <polygon
                    points={`${midX + 20},${midY - 4} ${midX + 28},${midY} ${midX + 20},${midY + 4}`}
                    fill="#000000"
                  />
                </g>
              )
            })()}
            
            {/* Partículas de sedimento (se força trativa insuficiente) */}
            {statusFluxo === 'sedimentacao' && alturaAguaRelativa > 0 && (() => {
              // Lista de sedimentos com posições X relativas e offsets Y
              const sedimentos = [
                { xOffset: 80, yOffset: 3, r: 2 },
                { xOffset: 120, yOffset: 5, r: 1.5 },
                { xOffset: 160, yOffset: 4, r: 2 },
                { xOffset: 200, yOffset: 3, r: 1.5 },
                { xOffset: 240, yOffset: 5, r: 2 },
                { xOffset: 270, yOffset: 4, r: 1.5 },
              ];
              
              return (
                <>
                  {sedimentos.map((sed, idx) => {
                    // Calcular Y interpolado para a posição X ao longo do tubo inclinado
                    const yFundoTubo = startY + (endY - startY) * (sed.xOffset / tuboLength) + tuboHeight;
                    const ySedimento = yFundoTubo - sed.yOffset;
                    
                    // Calcular Y da superfície da água nesta posição X
                    const ySuperficieAgua = startY + (endY - startY) * (sed.xOffset / tuboLength) + tuboHeight - alturaAguaPixels;
                    
                    // Verificar se o sedimento está dentro da área de água
                    // (abaixo da superfície e acima do fundo - offset)
                    const estaDentroAgua = ySedimento >= ySuperficieAgua && ySedimento <= yFundoTubo;
                    
                    return estaDentroAgua && (
                      <circle 
                        key={idx}
                        cx={startX + sed.xOffset} 
                        cy={ySedimento} 
                        r={sed.r} 
                        fill="#8B5CF6" 
                      />
                    );
                  })}
                </>
              );
            })()}
            
            {/* Dimensões e anotações */}
            {/* Diâmetro */}
            <g>
              <line
                x1={startX - 20}
                y1={startY}
                x2={startX - 20}
                y2={startY + tuboHeight}
                stroke="#6B7280"
                strokeWidth="1"
              />
              <text
                x={startX - 35}
                y={(startY + startY + tuboHeight) / 2}
                textAnchor="middle"
                className="text-xs font-medium fill-gray-700"
                transform={`rotate(-90, ${startX - 35}, ${(startY + startY + tuboHeight) / 2})`}
              >
                Ø {diametro}mm
              </text>
            </g>
            
            {/* Declividade com escala exagerada */}
            <g>
              <text
                x={startX + tuboLength / 2}
                y={Math.min(startY, endY) - 15}
                textAnchor="middle"
                className="text-xs font-medium fill-gray-700"
              >
                i = {declividade.toFixed(4)} m/m
              </text>
              <text
                x={startX + tuboLength / 2}
                y={Math.min(startY, endY) - 5}
                textAnchor="middle"
                className="text-xs fill-gray-500"
              >
                ({t('visualization.profile.exaggeratedScale')} {fatorEscalaDeclividade}x)
              </text>
            </g>
            
            {/* Velocidade */}
            <g>
              <text
                x={startX + tuboLength / 2}
                y={Math.max(startY, endY) + tuboHeight + 12}
                textAnchor="middle"
                className="text-xs font-medium fill-blue-700"
              >
                V = {velocidade.toFixed(2)} m/s
              </text>
            </g>
            
            {/* Indicação da direção do fluxo */}
            <text
              x={endX + 10}
              y={endY + tuboHeight/2}
              className="text-xs fill-green-600 font-medium"
            >
              →
            </text>

            {/* FIG caption + title block */}
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
              FIG. 02 · PERFIL LONGITUDINAL
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
              i = {declividade.toFixed(4)} m/m
            </text>
          </svg>
        </div>
        
        {/* Status pill (discreto: border + dot, sem fundo cheio) — empurrado para baixo */}
        <div className="mt-auto pt-5 flex justify-center">
          <div
            className="inline-flex items-center gap-2 text-xs font-semibold"
            style={{
              padding: '4px 10px',
              borderRadius: '2px',
              background: 'transparent',
              border: `1px solid ${statusFluxo === 'normal' ? 'rgba(61,140,92,0.35)' : 'rgba(192,51,77,0.35)'}`,
              color: statusFluxo === 'normal' ? COLORS.ok : COLORS.err,
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: statusFluxo === 'normal' ? COLORS.ok : COLORS.err }}></span>
            {statusFluxo === 'normal'
              ? t('visualization.profile.normalFlow')
              : statusFluxo === 'overflow'
              ? t('visualization.profile.overflowRisk')
              : t('visualization.profile.sedimentationRisk')}
          </div>
        </div>

        {/* Legenda */}
        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-xs" style={{ color: COLORS.ink2 }}>
          <div className="flex items-center gap-2">
            <div className="w-3.5 h-3.5 rounded-sm" style={{ background: corAgua, opacity: 0.7 }}></div>
            <span>{t('visualization.profile.wastewater')}</span>
          </div>
          <div className="flex items-center gap-2">
            <svg width="20" height="12" viewBox="0 0 20 12">
              <line x1="0" y1="6" x2="14" y2="6" stroke={COLORS.ink2} strokeWidth="2" />
              <polygon points="14,3 20,6 14,9" fill={COLORS.ink2} />
            </svg>
            <span>{t('visualization.profile.flowDirection')}</span>
          </div>
          {statusFluxo === 'sedimentacao' && (
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#8B5CF6' }}></div>
              <span>{t('visualization.profile.sediments')}</span>
            </div>
          )}
        </div>

        {/* Informações do fluxo */}
        <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2 text-xs" style={{ borderTop: `1px solid ${COLORS.line}`, paddingTop: '12px' }}>
          <div className="flex justify-between">
            <dt style={{ color: COLORS.ink3 }}>{t('visualization.profile.tractiveForce')}</dt>
            <dd className="font-mono font-medium" style={{ color: COLORS.ink1 }}>{forcaTraativa.toFixed(2)} <span style={{ color: COLORS.ink4 }}>Pa</span></dd>
          </div>
          <div className="flex justify-between">
            <dt style={{ color: COLORS.ink3 }}>{t('visualization.profile.minimum')}</dt>
            <dd className="font-mono font-medium" style={{ color: COLORS.ink1 }}>{forcaTrativaMin} <span style={{ color: COLORS.ink4 }}>Pa</span></dd>
          </div>
          <div className="flex justify-between">
            <dt style={{ color: COLORS.ink3 }}>{t('visualization.profile.velocity')}</dt>
            <dd className="font-mono font-medium" style={{ color: COLORS.ink1 }}>{velocidade.toFixed(2)} <span style={{ color: COLORS.ink4 }}>m/s</span></dd>
          </div>
          <div className="flex justify-between">
            <dt style={{ color: COLORS.ink3 }}>{t('visualization.profile.depthLabel')}</dt>
            <dd className="font-mono font-medium" style={{ color: COLORS.ink1 }}>{(laminaLiquida * 100).toFixed(1)}<span style={{ color: COLORS.ink4 }}>%</span></dd>
          </div>
        </dl>

        {statusFluxo === 'sedimentacao' && (
          <div
            className="mt-3 text-xs"
            style={{ padding: '10px 14px', borderRadius: '3px', background: COLORS.errBg, border: `1px solid rgba(192,51,77,0.25)`, color: COLORS.err }}
          >
            <strong>{t('visualization.profile.warning')}:</strong> {t('visualization.profile.warningMessage')}
          </div>
        )}
        {statusFluxo === 'overflow' && (
          <div
            className="mt-3 text-xs"
            style={{ padding: '10px 14px', borderRadius: '3px', background: COLORS.errBg, border: `1px solid rgba(192,51,77,0.25)`, color: COLORS.err }}
          >
            <strong>{t('visualization.profile.warning')}:</strong> {t('visualization.profile.overflowMessage')}
          </div>
        )}
      </div>
    </section>
  )
}

export default VisualizacaoPerfilRede
