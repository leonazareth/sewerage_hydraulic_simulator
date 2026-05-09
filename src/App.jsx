import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { AlertCircle, CheckCircle, Droplet, Users, Home } from 'lucide-react'
import VisualizacaoSecaoTubulacao from '@/components/VisualizacaoSecaoTubulacao.jsx'
import VisualizacaoPerfilRede from '@/components/VisualizacaoPerfilRede.jsx'
import { CalculosHidraulicos } from '@/lib/calculos_hidraulicos.js'
import LanguageSelector from '@/components/LanguageSelector.jsx'
import { useLanguage } from '@/i18n/LanguageProvider'

const COLORS = {
  paper: '#F5F2EC',
  white: '#FFFFFF',
  sage: '#5C8A6E',
  sageDark: '#2F5C44',
  sageTint: '#DDE8E0',
  ink1: '#0F1B2A',
  ink2: '#2C3E50',
  ink3: '#5C6B7A',
  ink4: '#94A3B0',
  line: 'rgba(15,27,42,0.10)',
  ok: '#3D8C5C',
  okBg: '#EAF3EC',
  warn: '#C77B2D',
  warnBg: '#FEF3E2',
  err: '#C0334D',
  errBg: '#FDEDF2',
}

const SectionCard = ({ number, title, description, children, className = '', stamp }) => (
  <section
    className={`relative flex flex-col ${className}`}
    style={{
      background: COLORS.white,
      border: `1px solid ${COLORS.line}`,
      borderRadius: '4px',
      padding: '24px 28px',
    }}
  >
    {/* Sage pin (top-left accent) */}
    <span
      aria-hidden="true"
      className="absolute"
      style={{ top: 0, left: 24, width: 28, height: 3, background: COLORS.sage }}
    />
    <header className="mb-5 pb-3" style={{ borderBottom: `1px solid ${COLORS.line}` }}>
      <h2
        className="font-mono text-sm font-extrabold tracking-[0.14em] uppercase flex items-baseline gap-2"
        style={{ color: COLORS.sageDark }}
      >
        {number && (
          <span style={{ color: COLORS.ink4, fontWeight: 600 }}>§{number}</span>
        )}
        <span>{title}</span>
      </h2>
      {description && (
        <p className="text-xs mt-1.5" style={{ color: COLORS.ink3 }}>
          {description}
        </p>
      )}
    </header>
    <div className="flex-1">{children}</div>
    {stamp && (
      <div
        className="font-mono mt-6 pt-3 text-[10px] tracking-[0.18em] uppercase flex justify-end"
        style={{ borderTop: `1px solid ${COLORS.line}`, color: COLORS.ink4 }}
      >
        {stamp}
      </div>
    )}
  </section>
)

const FieldIcon = ({ children }) => (
  <span
    aria-hidden="true"
    className="inline-flex items-center justify-center shrink-0"
    style={{ width: 14, height: 14, color: COLORS.sage }}
  >
    {children}
  </span>
)

const FieldGroup = ({ label, children }) => (
  <div className="py-7 first:pt-0 last:pb-0">
    <div className="flex items-center gap-2.5 mb-4">
      <span
        aria-hidden="true"
        style={{ width: 6, height: 6, background: COLORS.sage, display: 'inline-block', borderRadius: 1 }}
      />
      <div
        className="font-mono text-[11px] font-extrabold tracking-[0.15em] uppercase"
        style={{ color: COLORS.sageDark }}
      >
        {label}
      </div>
    </div>
    <div className="space-y-3">{children}</div>
  </div>
)

const ResultRow = ({ label, value, unit, status }) => (
  <div className="flex items-center justify-between py-2" style={{ borderBottom: `1px solid ${COLORS.line}` }}>
    <span className="text-sm" style={{ color: COLORS.ink2 }}>
      {label}
    </span>
    <div className="flex items-center gap-2">
      <span className="font-mono text-sm" style={{ color: COLORS.ink1 }}>
        {value}
        {unit && <span className="ml-1" style={{ color: COLORS.ink4 }}>{unit}</span>}
      </span>
      {status === 'ok' && <CheckCircle className="w-4 h-4" style={{ color: COLORS.ok }} />}
      {status === 'err' && <AlertCircle className="w-4 h-4" style={{ color: COLORS.err }} />}
    </div>
  </div>
)

const ResultBlock = ({ label, children }) => (
  <div>
    <div className="flex items-center gap-2.5 mb-4">
      <span
        aria-hidden="true"
        style={{ width: 6, height: 6, background: COLORS.sage, display: 'inline-block', borderRadius: 1 }}
      />
      <div
        className="font-mono text-[11px] font-extrabold tracking-[0.15em] uppercase"
        style={{ color: COLORS.sageDark }}
      >
        {label}
      </div>
    </div>
    <div>{children}</div>
  </div>
)

function App() {
  const { t } = useLanguage()

  const [parametros, setParametros] = useState({
    consumoPerCapita: 150,
    taxaOcupacao: 5,
    coefRetorno: 0.8,
    k1: 1.2,
    k2: 1.5,
    qtdeResidencias: 100,
    coefManning: 0.013,
    forcaTrativaMin: 1.0,
    laminaMaxima: 0.75,
    vazaoMinima: 1.5,
    declividade: 0.0045,
    diametro: 150,
  })

  const [resultados, setResultados] = useState(null)
  const [calculadora] = useState(new CalculosHidraulicos())

  useEffect(() => {
    try {
      setResultados(calculadora.calcularTodos(parametros))
    } catch (error) {
      console.error('Erro nos cálculos:', error)
    }
  }, [parametros, calculadora])

  const atualizarParametro = (nome, valor) => {
    const numericValue = valor === '' ? 0 : parseFloat(valor)
    setParametros(prev => ({
      ...prev,
      [nome]: isNaN(numericValue) ? 0 : numericValue,
    }))
  }

  const exibirValor = (valor, isDecimal = false) => {
    if (valor === 0 && !isDecimal) return ''
    return valor
  }

  return (
    <div className="min-h-screen" style={{ background: COLORS.paper, color: COLORS.ink1 }}>
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12" style={{ maxWidth: '1640px' }}>
        {/* Top right: language */}
        <div className="flex justify-end mb-8">
          <LanguageSelector />
        </div>

        {/* Hero */}
        <header className="mb-10 lg:mb-14">
          <div
            className="font-mono font-bold tracking-[0.22em] uppercase mb-4"
            style={{ color: COLORS.sageDark, fontSize: '15px' }}
          >
            {t('app.subtitle')}
          </div>
          <h1
            className="font-extrabold leading-[1.02] mb-4"
            style={{
              color: COLORS.ink1,
              letterSpacing: '-0.035em',
              fontSize: 'clamp(2.25rem, 1.5rem + 3.5vw, 4.5rem)',
            }}
          >
            {t('app.title')}
          </h1>
          <div className="flex justify-end">
            <p className="text-sm" style={{ color: COLORS.ink3 }}>
              {t('header.authors')}
            </p>
          </div>
          <div className="mt-6" style={{ height: '1px', background: COLORS.line }} />
        </header>

        {/* Layout: parâmetros à esquerda + visualizações/resultados à direita */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 xl:gap-8 items-stretch">
          {/* Parâmetros */}
          <div className="lg:col-span-3">
            <SectionCard
              className="h-full"
              title={t('parameters.title')}
              description={t('parameters.description')}
              stamp="ABNT NBR 9649"
            >
              <div className="divide-y divide-[rgba(15,27,42,0.10)]">
              <FieldGroup label={t('parameters.consumption.title')}>
                <div>
                  <Label htmlFor="consumoPerCapita" className="text-xs flex items-center gap-1.5" style={{ color: COLORS.ink2 }}>
                    <FieldIcon><Droplet className="w-3.5 h-3.5" strokeWidth={1.75} /></FieldIcon>
                    {t('parameters.consumption.perCapita')}
                  </Label>
                  <Input
                    id="consumoPerCapita"
                    type="number"
                    value={exibirValor(parametros.consumoPerCapita)}
                    onChange={(e) => atualizarParametro('consumoPerCapita', e.target.value)}
                    className="mt-1 font-mono"
                  />
                </div>
                <div>
                  <Label htmlFor="taxaOcupacao" className="text-xs flex items-center gap-1.5" style={{ color: COLORS.ink2 }}>
                    <FieldIcon><Users className="w-3.5 h-3.5" strokeWidth={1.75} /></FieldIcon>
                    {t('parameters.consumption.occupancyRate')}
                  </Label>
                  <Input
                    id="taxaOcupacao"
                    type="number"
                    value={exibirValor(parametros.taxaOcupacao)}
                    onChange={(e) => atualizarParametro('taxaOcupacao', e.target.value)}
                    className="mt-1 font-mono"
                  />
                </div>
                <div>
                  <Label htmlFor="coefRetorno" className="text-xs" style={{ color: COLORS.ink2 }}>
                    {t('parameters.consumption.returnCoefficient')}
                  </Label>
                  <Input
                    id="coefRetorno"
                    type="number"
                    step="0.01"
                    value={parametros.coefRetorno}
                    onChange={(e) => atualizarParametro('coefRetorno', e.target.value)}
                    className="mt-1 font-mono"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="k1" className="text-xs" style={{ color: COLORS.ink2 }}>
                      {t('parameters.consumption.k1')}
                    </Label>
                    <Input
                      id="k1"
                      type="number"
                      step="0.1"
                      value={parametros.k1}
                      onChange={(e) => atualizarParametro('k1', e.target.value)}
                      className="mt-1 font-mono"
                    />
                  </div>
                  <div>
                    <Label htmlFor="k2" className="text-xs" style={{ color: COLORS.ink2 }}>
                      {t('parameters.consumption.k2')}
                    </Label>
                    <Input
                      id="k2"
                      type="number"
                      step="0.1"
                      value={parametros.k2}
                      onChange={(e) => atualizarParametro('k2', e.target.value)}
                      className="mt-1 font-mono"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="qtdeResidencias" className="text-xs flex items-center gap-1.5" style={{ color: COLORS.ink2 }}>
                    <FieldIcon><Home className="w-3.5 h-3.5" strokeWidth={1.75} /></FieldIcon>
                    {t('parameters.consumption.residences')}
                  </Label>
                  <Input
                    id="qtdeResidencias"
                    type="number"
                    value={exibirValor(parametros.qtdeResidencias)}
                    onChange={(e) => atualizarParametro('qtdeResidencias', e.target.value)}
                    className="mt-1 font-mono"
                  />
                </div>
              </FieldGroup>

              <FieldGroup label={t('parameters.hydraulic.title')}>
                <div>
                  <Label htmlFor="diametro" className="text-xs flex items-center gap-1.5" style={{ color: COLORS.ink2 }}>
                    <FieldIcon><span className="font-mono font-bold text-[13px] leading-none">Ø</span></FieldIcon>
                    {t('parameters.hydraulic.diameter')}
                  </Label>
                  <Input
                    id="diametro"
                    type="number"
                    step="50"
                    value={exibirValor(parametros.diametro)}
                    onChange={(e) => atualizarParametro('diametro', e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                        e.preventDefault()
                        const current = parametros.diametro || 0
                        const next = e.key === 'ArrowUp'
                          ? Math.ceil((current + 1) / 50) * 50
                          : Math.floor((current - 1) / 50) * 50
                        atualizarParametro('diametro', Math.max(50, next))
                      }
                    }}
                    className="mt-1 font-mono"
                  />
                </div>
                <div>
                  <Label htmlFor="declividade" className="text-xs" style={{ color: COLORS.ink2 }}>
                    {t('parameters.hydraulic.slope')}
                  </Label>
                  <Input
                    id="declividade"
                    type="number"
                    step="0.0001"
                    value={parametros.declividade}
                    onChange={(e) => atualizarParametro('declividade', parseFloat(e.target.value))}
                    className="mt-1 font-mono"
                  />
                </div>
                <div>
                  <Label htmlFor="coefManning" className="text-xs" style={{ color: COLORS.ink2 }}>
                    {t('parameters.hydraulic.manning')}
                  </Label>
                  <Input
                    id="coefManning"
                    type="number"
                    step="0.001"
                    value={parametros.coefManning}
                    onChange={(e) => atualizarParametro('coefManning', e.target.value)}
                    className="mt-1 font-mono"
                  />
                </div>
              </FieldGroup>

              <FieldGroup label={t('parameters.verification.title')}>
                <div>
                  <Label htmlFor="laminaMaxima" className="text-xs" style={{ color: COLORS.ink2 }}>
                    {t('parameters.verification.maxDepth')}
                  </Label>
                  <Input
                    id="laminaMaxima"
                    type="number"
                    step="0.01"
                    value={(parametros.laminaMaxima * 100).toFixed(0)}
                    onChange={(e) => atualizarParametro('laminaMaxima', parseFloat(e.target.value) / 100)}
                    className="mt-1 font-mono"
                  />
                </div>
                <div>
                  <Label htmlFor="forcaTrativaMin" className="text-xs" style={{ color: COLORS.ink2 }}>
                    {t('parameters.verification.minTractive')}
                  </Label>
                  <Input
                    id="forcaTrativaMin"
                    type="number"
                    step="0.1"
                    value={parametros.forcaTrativaMin}
                    onChange={(e) => atualizarParametro('forcaTrativaMin', e.target.value)}
                    className="mt-1 font-mono"
                  />
                </div>
                <div>
                  <Label htmlFor="vazaoMinima" className="text-xs" style={{ color: COLORS.ink2 }}>
                    {t('parameters.verification.minFlow')}
                  </Label>
                  <Input
                    id="vazaoMinima"
                    type="number"
                    step="0.1"
                    value={parametros.vazaoMinima}
                    onChange={(e) => atualizarParametro('vazaoMinima', e.target.value)}
                    className="mt-1 font-mono"
                  />
                </div>
              </FieldGroup>
              </div>
            </SectionCard>
          </div>

          {/* Visualizações + Resultados */}
          <div className="lg:col-span-9 flex flex-col gap-6 xl:gap-8">
            <div className="grid grid-cols-1 xl:grid-cols-11 gap-6 xl:gap-8">
              <div className="xl:col-span-6">
                <VisualizacaoSecaoTubulacao resultados={resultados} parametros={parametros} />
              </div>
              <div className="xl:col-span-5">
                <VisualizacaoPerfilRede resultados={resultados} parametros={parametros} />
              </div>
            </div>

            {/* Resultados em estilo editorial */}
            <SectionCard
              className="flex-1"
              title={t('results.title')}
              description={t('results.description')}
              stamp="MANNING · NEWTON-RAPHSON"
            >
              {resultados && (
                <>
                  {resultados.verificacoes.transbordando ? (
                    <>
                      <ResultBlock label={t('results.flows.title')}>
                        <ResultRow
                          label={t('results.flows.estimated')}
                          value={resultados.resultados.vazaoEstimada.toFixed(2)}
                          unit="l/s"
                        />
                        <ResultRow
                          label={t('results.flows.considered')}
                          value={resultados.resultados.vazaoCalculada.toFixed(2)}
                          unit="l/s"
                        />
                      </ResultBlock>

                      <div
                        className="flex items-start gap-3 mt-2"
                        style={{
                          background: COLORS.errBg,
                          border: `1px solid rgba(192,51,77,0.25)`,
                          borderRadius: '3px',
                          padding: '14px 18px',
                        }}
                      >
                        <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" style={{ color: COLORS.err }} />
                        <span className="text-sm font-medium" style={{ color: COLORS.err }}>
                          {t('results.overflowNotice')}
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-10">
                      <ResultBlock label={t('results.flows.title')}>
                        <ResultRow
                          label={t('results.flows.estimated')}
                          value={resultados.resultados.vazaoEstimada.toFixed(2)}
                          unit="l/s"
                        />
                        <ResultRow
                          label={t('results.flows.considered')}
                          value={resultados.resultados.vazaoCalculada.toFixed(2)}
                          unit="l/s"
                        />
                      </ResultBlock>

                      <ResultBlock label={t('results.verification.title')}>
                        <ResultRow
                          label={t('results.verification.depth')}
                          value={(resultados.resultados.laminaLiquida * 100).toFixed(1)}
                          unit="%"
                          status={resultados.verificacoes.laminaOK ? 'ok' : 'err'}
                        />
                        <ResultRow
                          label={t('results.verification.tractive')}
                          value={resultados.resultados.forcaTraativa.toFixed(2)}
                          unit="Pa"
                          status={resultados.verificacoes.forcaTraativaOK ? 'ok' : 'err'}
                        />
                        <ResultRow
                          label={t('results.verification.velocity')}
                          value={resultados.resultados.velocidade.toFixed(2)}
                          unit="m/s"
                        />
                      </ResultBlock>

                      <ResultBlock label={t('results.geometric.title')}>
                        <ResultRow
                          label={t('results.geometric.area')}
                          value={resultados.resultados.areaHidraulica.toFixed(6)}
                          unit="m²"
                        />
                        <ResultRow
                          label={t('results.geometric.perimeter')}
                          value={resultados.resultados.perimetroMolhado.toFixed(4)}
                          unit="m"
                        />
                        <ResultRow
                          label={t('results.geometric.radius')}
                          value={resultados.resultados.raioHidraulico.toFixed(4)}
                          unit="m"
                        />
                        <ResultRow
                          label={t('results.geometric.height')}
                          value={resultados.resultados.alturaMolhada.toFixed(4)}
                          unit="m"
                        />
                      </ResultBlock>

                      <ResultBlock label={t('results.technical.title')}>
                        <ResultRow
                          label={t('results.technical.angle')}
                          value={resultados.resultados.anguloTeta.toFixed(4)}
                          unit="rad"
                        />
                        <ResultRow
                          label={t('results.technical.diameter')}
                          value={parametros.diametro}
                          unit="mm"
                        />
                        <ResultRow
                          label={t('results.technical.slope')}
                          value={parametros.declividade.toFixed(4)}
                          unit="m/m"
                        />
                      </ResultBlock>
                    </div>
                  )}
                </>
              )}
            </SectionCard>
          </div>
        </div>

        {/* Footer */}
        <footer
          className="mt-16 pt-8 text-center"
          style={{ borderTop: `1px solid ${COLORS.line}` }}
        >
          <p className="text-xs leading-relaxed mb-2" style={{ color: COLORS.ink3 }}>
            {t('footer.copyleft')}
          </p>
          <p className="text-xs leading-relaxed max-w-3xl mx-auto" style={{ color: COLORS.ink4 }}>
            {t('footer.disclaimer')}
          </p>
        </footer>
      </div>
    </div>
  )
}

export default App
