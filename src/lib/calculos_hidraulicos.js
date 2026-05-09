/**
 * Simulador de Cálculos Hidráulicos para Redes de Esgoto
 */

export class CalculosHidraulicos {
    constructor() {
        // Valores padrão dos parâmetros
        this.parametrosPadrao = {
            consumoPerCapita: 150,      // l/hab/dia
            taxaOcupacao: 5,            // hab/casa
            coefRetorno: 0.8,           // C
            k1: 1.2,                    // Coef. máximo diário
            k2: 1.5,                    // Coef. máximo horário
            qtdeResidencias: 100,       // unidades
            coefManning: 0.013,         // n
            forcaTrativaMin: 1.0,       // Pa
            laminaMaxima: 0.75,         // y/D
            vazaoMinima: 1.5,           // l/s
            declividade: 0.005,         // m/m
            diametro: 150               // mm
        };
    }

    /**
     * Calcula a vazão estimada baseada nos parâmetros de consumo
     * @param {Object} params - Parâmetros de entrada
     * @returns {number} Vazão estimada em l/s
     */
    calcularVazaoEstimada(params) {
        const {
            consumoPerCapita,
            taxaOcupacao,
            coefRetorno,
            k1,
            k2,
            qtdeResidencias
        } = { ...this.parametrosPadrao, ...params };

        return (consumoPerCapita * taxaOcupacao * coefRetorno * k1 * k2 / 86400) * qtdeResidencias;
    }

    /**
     * Calcula a vazão de cálculo (máximo entre estimada e mínima)
     * @param {Object} params - Parâmetros de entrada
     * @returns {number} Vazão calculada em l/s
     */
    calcularVazaoCalculada(params) {
        const vazaoEstimada = this.calcularVazaoEstimada(params);
        const vazaoMinima = params.vazaoMinima || this.parametrosPadrao.vazaoMinima;
        
        return Math.max(vazaoEstimada, vazaoMinima);
    }

    /**
     * Calcula o ângulo teta através do método iterativo EXATO da planilha
     * @param {Object} params - Parâmetros de entrada
     * @returns {number} Ângulo teta em radianos
     */
    calcularAnguloTeta(params) {
        const {
            coefManning,
            declividade,
            diametro
        } = { ...this.parametrosPadrao, ...params };

        const qcalc = this.calcularVazaoCalculada(params); // em l/s
        
        // Calcular E exatamente como na planilha: =(F6*C6/1000)/((E6^0.5)*((D6/1000)^(8/3)))
        const E = (coefManning * qcalc / 1000) / 
                  (Math.pow(declividade, 0.5) * Math.pow(diametro / 1000, 8/3));
        
        // Calcular E' exatamente como na planilha: =8*(((H6^3)/4)^0.2)
        const epsilon = 8 * Math.pow((Math.pow(E, 3) / 4), 0.2);
        
        // Iterações exatamente como na planilha
        // J6: =PI()
        let iteracao1 = Math.PI;
        
        // K6: =$I6*(J6^0.4)+(SIN(J6))
        let iteracao2 = epsilon * Math.pow(iteracao1, 0.4) + Math.sin(iteracao1);
        
        // Continuar iterações até convergência (máximo 15 como na planilha)
        let iteracaoAnterior = iteracao1;
        let iteracaoAtual = iteracao2;
        
        for (let i = 3; i <= 15; i++) {
            iteracaoAnterior = iteracaoAtual;
            // Próxima iteração: =$I6*(anterior^0.4)+(SIN(anterior))
            iteracaoAtual = epsilon * Math.pow(iteracaoAnterior, 0.4) + Math.sin(iteracaoAnterior);
            
            // Verificar convergência (diferença muito pequena)
            if (Math.abs(iteracaoAtual - iteracaoAnterior) < 1e-8) {
                break;
            }
        }
        
        // TETA final é a última iteração (não a diferença como eu pensava antes)
        // Na planilha, G6: =ABS(X6-Y6) é apenas para verificar convergência
        // O valor usado nos cálculos é Y6 (última iteração)
        return iteracaoAtual;
    }

    /**
     * Calcula a área hidráulica exatamente como na planilha
     * @param {Object} params - Parâmetros de entrada
     * @returns {number} Área hidráulica em m²
     */
    calcularAreaHidraulica(params) {
        const diametro = params.diametro || this.parametrosPadrao.diametro;
        const teta = this.calcularAnguloTeta(params);
        
        // AA6: =IF(Y6>2*PI(),0,((D6/1000)^2)/8*(Y6-SIN(Y6)))
        if (teta > 2 * Math.PI) {
            return 0;
        }
        
        return Math.pow(diametro / 1000, 2) / 8 * (teta - Math.sin(teta));
    }

    /**
     * Calcula o perímetro molhado exatamente como na planilha
     * @param {Object} params - Parâmetros de entrada
     * @returns {number} Perímetro molhado em m
     */
    calcularPerimetroMolhado(params) {
        const diametro = params.diametro || this.parametrosPadrao.diametro;
        const teta = this.calcularAnguloTeta(params);
        
        // AB6: =IF(Y6>2*PI(),0,Y6/2*D6/1000)
        if (teta > 2 * Math.PI) {
            return 0;
        }
        
        return teta / 2 * diametro / 1000;
    }

    /**
     * Calcula o raio hidráulico exatamente como na planilha
     * @param {Object} params - Parâmetros de entrada
     * @returns {number} Raio hidráulico em m
     */
    calcularRaioHidraulico(params) {
        const diametro = params.diametro || this.parametrosPadrao.diametro;
        const teta = this.calcularAnguloTeta(params);
        
        // AD6: =IF(Y6>2*PI(),0,(D6/1000/4)*(Y6-(SIN(Y6)))/Y6)
        if (teta > 2 * Math.PI) {
            return 0;
        }
        
        return (diametro / 1000 / 4) * (teta - Math.sin(teta)) / teta;
    }

    /**
     * Calcula a altura molhada exatamente como na planilha
     * @param {Object} params - Parâmetros de entrada
     * @returns {number} Altura molhada em m
     */
    calcularAlturaMolhada(params) {
        const diametro = params.diametro || this.parametrosPadrao.diametro;
        const teta = this.calcularAnguloTeta(params);
        
        // AC6: =IF(Y6<=2*PI(),(1-COS(Y6/2))*D6/1000/2,0)
        if (teta <= 2 * Math.PI) {
            return (1 - Math.cos(teta / 2)) * diametro / 1000 / 2;
        }
        
        return 0;
    }

    /**
     * Calcula a lâmina líquida exatamente como na planilha
     * @param {Object} params - Parâmetros de entrada
     * @returns {number} Lâmina líquida (y/D)
     */
    calcularLaminaLiquida(params) {
        const diametro = params.diametro || this.parametrosPadrao.diametro;
        const alturaMolhada = this.calcularAlturaMolhada(params);
        
        // AE6: =AC6/(D6/1000)
        return alturaMolhada / (diametro / 1000);
    }

    /**
     * Calcula a força trativa exatamente como na planilha
     * @param {Object} params - Parâmetros de entrada
     * @returns {number} Força trativa em Pascal
     */
    calcularForcaTraativa(params) {
        const declividade = params.declividade || this.parametrosPadrao.declividade;
        const raioHidraulico = this.calcularRaioHidraulico(params);
        
        // AF6: =1000*AD6*E6*10
        return 1000 * raioHidraulico * declividade * 10;
    }

    /**
     * Calcula a velocidade exatamente como na planilha
     * @param {Object} params - Parâmetros de entrada
     * @returns {number} Velocidade em m/s
     */
    calcularVelocidade(params) {
        const coefManning = params.coefManning || this.parametrosPadrao.coefManning;
        const declividade = params.declividade || this.parametrosPadrao.declividade;
        const raioHidraulico = this.calcularRaioHidraulico(params);
        
        // Z6: =(AD6^(2/3)*E6^0.5/F6)
        if (raioHidraulico <= 0) {
            return 0;
        }
        
        return Math.pow(raioHidraulico, 2/3) * Math.pow(declividade, 0.5) / coefManning;
    }

    /**
     * Executa todos os cálculos e retorna um objeto com todos os resultados
     * @param {Object} params - Parâmetros de entrada
     * @returns {Object} Objeto com todos os resultados calculados
     */
    calcularTodos(params) {
        const parametros = { ...this.parametrosPadrao, ...params };

        const vazaoEstimada = this.calcularVazaoEstimada(parametros);
        const vazaoCalculada = this.calcularVazaoCalculada(parametros);
        const anguloTeta = this.calcularAnguloTeta(parametros);

        const transbordando = anguloTeta >= 2 * Math.PI;

        let areaHidraulica, perimetroMolhado, raioHidraulico, alturaMolhada, laminaLiquida, forcaTraativa, velocidade;

        if (transbordando) {
            const d = parametros.diametro / 1000;
            areaHidraulica = Math.PI * Math.pow(d, 2) / 4;
            perimetroMolhado = Math.PI * d;
            raioHidraulico = d / 4;
            alturaMolhada = d;
            laminaLiquida = anguloTeta / (2 * Math.PI);
            forcaTraativa = 1000 * raioHidraulico * parametros.declividade * 10;
            velocidade = Math.pow(raioHidraulico, 2/3) * Math.pow(parametros.declividade, 0.5) / parametros.coefManning;
        } else {
            areaHidraulica = this.calcularAreaHidraulica(parametros);
            perimetroMolhado = this.calcularPerimetroMolhado(parametros);
            raioHidraulico = this.calcularRaioHidraulico(parametros);
            alturaMolhada = this.calcularAlturaMolhada(parametros);
            laminaLiquida = this.calcularLaminaLiquida(parametros);
            forcaTraativa = this.calcularForcaTraativa(parametros);
            velocidade = this.calcularVelocidade(parametros);
        }

        const laminaOK = laminaLiquida <= parametros.laminaMaxima;
        const forcaTraativaOK = forcaTraativa >= parametros.forcaTrativaMin;

        return {
            parametros,
            resultados: {
                vazaoEstimada,
                vazaoCalculada,
                anguloTeta,
                areaHidraulica,
                perimetroMolhado,
                raioHidraulico,
                alturaMolhada,
                laminaLiquida,
                forcaTraativa,
                velocidade
            },
            verificacoes: {
                laminaOK,
                forcaTraativaOK,
                transbordando,
                sistemaOK: laminaOK && forcaTraativaOK && !transbordando
            }
        };
    }

    /**
     * Valida se os parâmetros estão dentro de faixas aceitáveis
     * @param {Object} params - Parâmetros a validar
     * @returns {Object} Objeto com validações
     */
    validarParametros(params) {
        const erros = [];
        const avisos = [];

        if (params.consumoPerCapita < 50 || params.consumoPerCapita > 500) {
            avisos.push('Consumo per capita fora da faixa típica (50-500 l/hab/dia)');
        }

        if (params.taxaOcupacao < 1 || params.taxaOcupacao > 10) {
            avisos.push('Taxa de ocupação fora da faixa típica (1-10 hab/casa)');
        }

        if (params.coefRetorno < 0.5 || params.coefRetorno > 1.0) {
            erros.push('Coeficiente de retorno deve estar entre 0.5 e 1.0');
        }

        if (params.declividade < 0.001 || params.declividade > 0.1) {
            avisos.push('Declividade fora da faixa típica (0.1% a 10%)');
        }

        if (params.diametro < 100 || params.diametro > 1000) {
            avisos.push('Diâmetro fora da faixa típica (100-1000 mm)');
        }

        return {
            valido: erros.length === 0,
            erros,
            avisos
        };
    }
} 