// Incluir as bibliotecas
// Gerencia as requisições, rotas e URLs, entre outra funcionalidades
const express = require('express');
// Utilizado para manipular as rotas da aplicação
const router = express.Router();
// Arquivo com a funcionalidade para verificar se o usuário está logado
const { eAdmin } = require("../helpers/eAdmin");
// Incluir o arquivo que possui a conexão com banco de dados
const db = require('../db/models');
// Validar input do formulário
const yup = require('yup');

const Sequelize = require('sequelize');
const Excel = require('exceljs');


router.get('/', eAdmin, async (req, res) => {
            const nomeMes = req.session.mes;
            const mes = req.session.mes;
            const nomeAno = req.session.ano;
            const ano = req.session.ano;
            const { Op } = require('sequelize');
            const { page = 1 } = req.query;
            const limit = 40;
            var lastPage = 1;

    // INICIO DIM ------------------------------------------------------------------------------------------------------------------------------------------------
    if (req.user.dataValues.omeId == 2){ 

        const countPjes = await db.pjes.count();
                
                if (countPjes === 0) {
                    return res.render("unidade/unidadepjes/list", { layout: 'main', profile: req.user.dataValues, sidebarSituations: true, danger_msg: 'Erro: Nenhum pjes encontrada!' });
                }


            //---UNIDADES | INICIO TABELA DE COTAS DISTRIBUIDAS-------------------------------------------------------------------------
                const Sequelize = require('sequelize');
                const total_cotadistunidade = await db.pjes.findAll({
                    attributes: [
                        'id', 'operacao', 'evento', 'cotaofdist', 'cotaprcdist', 'mes', 'idome', 'iduser', 'obs',
                        [Sequelize.literal('SUM(cotaofdist)'), 'total_cotaofdist'],
                        [Sequelize.literal('SUM(cotaprcdist)'), 'total_cotaprcdist'],
                        [Sequelize.literal('SUM(cotaofdist) * 300'), 'total_cotaofdist_multiplicado'],
                        [Sequelize.literal('SUM(cotaprcdist) * 200'), 'total_cotaprcdist_multiplicado']
                    ],
                    where: 
                        {
                            idome:[2, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17],
                            ano,
                            mes,
                            operacao: {
                                [Sequelize.Op.like]: 'PJES GOVERNO%'
                            },
                    },
                    include: [
                        { model: db.omes, attributes: ['nome'] },
                        { model: db.users, attributes: ['name'] }
                    ],
                    group: ['idome', 'ome.nome', 'user.name'],
                    raw: true,
                });

            //----UNIDADES | INICIO TABELA DE COTAS EXECUTADAS-------------------------------------------------------------------------
                const SequelizeExecut = require('sequelize');
                const total_cotaexeunidade = await db.pjesgercota.findAll({
                    attributes: [
                        'id', 'operacao', 'id_ome', 'ttofexe', 'ttprcexe', 'status', 'mes', 'ano', 'obs',
                        [SequelizeExecut.literal('SUM(ttofexe)'), 'total_cotaofexe'],
                        [SequelizeExecut.literal('SUM(ttprcexe)'), 'total_cotaprcexe'],
                        [SequelizeExecut.literal('SUM(ttofexe) * 300'), 'total_cotaofexe_multiplicado'],
                        [SequelizeExecut.literal('SUM(ttprcexe) * 200'), 'total_cotaprcexe_multiplicado']
                    ],
                    where: 
                        {id_ome:[2, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17],
                        ano,
                        mes,
                        operacao: {
                            [SequelizeExecut.Op.like]: 'PJES GOVERNO%'
                            },
                        },
                    include: [
                        { model: db.omes, attributes: ['nome'] },
                    ],
                    group: ['id_ome', 'ome.nome'],
                    raw: true,
                });


            //--- UNIDADES | INICIO CALCULAR OS VALORES TOTAIS POR UNIDADES-------------------------------------------------------------------------

                //VALOR FINAL DE COTAS DISTRIBUIDAS OFICIAIS UNIDADES
                const SequelizeDistUnidade = require('sequelize');
                const valorfinal_cotadistunidade = await db.pjes.findAll({
                    attributes: [
                        [SequelizeDistUnidade.literal('SUM(cotaofdist) * 300'), 'valor_cotaofdist_multiplicado'],
                        [SequelizeDistUnidade.literal('SUM(cotaprcdist) * 200'), 'valor_cotaprcdist_multiplicado']
                    ],
                    where: {
                            idome:[2, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17],
                            ano,
                            mes,
                            operacao: {
                                [SequelizeDistUnidade.Op.like]: 'PJES GOVERNO%'
                            },
                            
                    },
                    raw: true,
                });

                //VALOR DE COTAS EXECUTADAS OFICIAIS UNIDADES
                const SequelizeExecutUnidade = require('sequelize');
                const valorfinal_cotaexeunidade = await db.pjesgercota.findAll({
                    attributes: [
                        [SequelizeExecutUnidade.literal('SUM(ttofexe) * 300'), 'valor_cotaofexe_multiplicado'],
                        [SequelizeExecutUnidade.literal('SUM(ttprcexe) * 200'), 'valor_cotaprcexe_multiplicado']
                    ],
                    where: {
                            id_ome:[2, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17],
                            ano,
                            mes,
                            operacao: {
                                [SequelizeExecutUnidade.Op.like]: 'PJES GOVERNO%'
                            },
                    },
                    raw: true,
                });

            //---UNIDADES | INICIO CALCULAR OS VALORES E COTAS TOTAIS POR UNIDADES-------------------------------------------------------------------------

                // CALCULO DO VALOR DISTRIBUIDO
                const valorCotaOfDistUnidade = parseFloat(valorfinal_cotadistunidade[0]?.valor_cotaofdist_multiplicado) || 0;
                const valorCotaPrcDistUnidade = parseFloat(valorfinal_cotadistunidade[0]?.valor_cotaprcdist_multiplicado) || 0;
                const valorFinalDistUnidade = valorCotaOfDistUnidade + valorCotaPrcDistUnidade;

                // CALCULO DO TOTAL DE COTAS DISTRIBUIDAS
                const totalcotaOfDistUnidade = valorCotaOfDistUnidade/300;
                const totalcotaPrcDistUnidade = valorCotaPrcDistUnidade/200;


                // CALCULO DO VALOR EXECUTADO
                const valorCotaOfExeUnidade = parseFloat(valorfinal_cotaexeunidade[0]?.valor_cotaofexe_multiplicado) || 0;
                const valorCotaPrcExeUnidade = parseFloat(valorfinal_cotaexeunidade[0]?.valor_cotaprcexe_multiplicado) || 0;
                const valorFinalExeUnidade = valorCotaOfExeUnidade + valorCotaPrcExeUnidade;

                // CALCULO DO TOTAL DE COTAS EXECUTADAS
                const totalcotaOfExeUnidade = valorCotaOfExeUnidade/300;
                const totalcotaPrcExeUnidade = valorCotaPrcExeUnidade/200;

                // CALCULO DO SALDO FINAL
                const saldoFinalUnidade = valorFinalDistUnidade-valorFinalExeUnidade;

            //---UNIDADES | FIM CALCULAR OS VALORES E COTAS TOTAIS POR DIRETORIA-------------------------------------------------------------------------


            //---PE | INICIO

        //---PE | INICIO TABELA DE COTAS DISTRIBUIDAS-------------------------------------------------------------------------
                const Sequelizepe = require('sequelize');
                const total_cotadistpe = await db.pjes.findAll({
                    attributes: [
                        'id', 'operacao', 'evento', 'cotaofdist', 'cotaprcdist', 'mes', 'idome', 'iduser', 'obs',
                        [Sequelizepe.literal('SUM(cotaofdist)'), 'total_cotaofdist'],
                        [Sequelizepe.literal('SUM(cotaprcdist)'), 'total_cotaprcdist'],
                        [Sequelizepe.literal('SUM(cotaofdist) * 300'), 'total_cotaofdist_multiplicado'],
                        [Sequelizepe.literal('SUM(cotaprcdist) * 200'), 'total_cotaprcdist_multiplicado']
                    ],
                    where: 
                        {
                        idome:[2, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17],
                        mes,
                        ano,
                        operacao: "PJES PATRULHA ESCOLAR",
                    },
                    include: [
                        { model: db.omes, attributes: ['nome'] },
                        { model: db.users, attributes: ['name'] }
                    ],
                    group: ['idome', 'ome.nome', 'user.name'],
                    raw: true,
                });

            //----PE | INICIO TABELA DE COTAS EXECUTADAS-------------------------------------------------------------------------
                const SequelizeExecutpe = require('sequelize');
                const total_cotaexepe = await db.pjesgercota.findAll({
                    attributes: [
                        'id', 'operacao', 'id_ome', 'ttofexe', 'ttprcexe', 'status', 'mes', 'ano', 'obs',
                        [SequelizeExecutpe.literal('SUM(ttofexe)'), 'total_cotaofexe'],
                        [SequelizeExecutpe.literal('SUM(ttprcexe)'), 'total_cotaprcexe'],
                        [SequelizeExecutpe.literal('SUM(ttofexe) * 300'), 'total_cotaofexe_multiplicado'],
                        [SequelizeExecutpe.literal('SUM(ttprcexe) * 200'), 'total_cotaprcexe_multiplicado']
                    ],
                    where: 
                        {
                        id_ome:[2, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17],
                        mes,
                        ano,
                        operacao: "PJES PATRULHA ESCOLAR",
                        },
                    include: [
                        { model: db.omes, attributes: ['nome'] },
                    ],
                    group: ['id_ome', 'ome.nome'],
                    raw: true,
                });

            //--- PE | INICIO CALCULAR OS VALORES TOTAIS POR DIRETORIA-------------------------------------------------------------------------

            //VALOR FINAL DE COTAS DISTRIBUIDAS OFICIAIS PE
                const SequelizeDistPe = require('sequelize');
                const valorfinal_cotadistpe = await db.pjes.findAll({
                    attributes: [
                        [SequelizeDistPe.literal('SUM(cotaofdist) * 300'), 'valor_cotaofdist_multiplicado'],
                        [SequelizeDistPe.literal('SUM(cotaprcdist) * 200'), 'valor_cotaprcdist_multiplicado']
                    ],
                    where: {
                            idome:[2, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17],
                            mes,
                            ano,
                            operacao: "PJES PATRULHA ESCOLAR",
                    },
                    raw: true,
                });

            //VALOR DE COTAS EXECUTADAS OFICIAIS PE
                const SequelizeExecutPe = require('sequelize');
                const valorfinal_cotaexepe = await db.pjesgercota.findAll({
                    attributes: [
                        [SequelizeExecutPe.literal('SUM(ttofexe) * 300'), 'valor_cotaofexe_multiplicado'],
                        [SequelizeExecutPe.literal('SUM(ttprcexe) * 200'), 'valor_cotaprcexe_multiplicado']
                    ],
                    where: {
                            id_ome:[2, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17],
                            mes,
                            ano,
                            operacao: "PJES PATRULHA ESCOLAR",
                    },
                    raw: true,
                });

            //---PE | INICIO CALCULAR OS VALORES E COTAS TOTAIS POR DIRETORIA-------------------------------------------------------------------------

            // CALCULO DO VALOR DISTRIBUIDO
                const valorCotaOfDistPe = parseFloat(valorfinal_cotadistpe[0]?.valor_cotaofdist_multiplicado) || 0;
                const valorCotaPrcDistPe = parseFloat(valorfinal_cotadistpe[0]?.valor_cotaprcdist_multiplicado) || 0;
                const valorFinalDistPe = valorCotaOfDistPe + valorCotaPrcDistPe;

            // CALCULO DO TOTAL DE COTAS DISTRIBUIDAS
                const totalcotaOfDistPe = valorCotaOfDistPe/300;
                const totalcotaPrcDistPe = valorCotaPrcDistPe/200;


            // CALCULO DO VALOR EXECUTADO
                const valorCotaOfExePe = parseFloat(valorfinal_cotaexepe[0]?.valor_cotaofexe_multiplicado) || 0;
                const valorCotaPrcExePe = parseFloat(valorfinal_cotaexepe[0]?.valor_cotaprcexe_multiplicado) || 0;
                const valorFinalExePe = valorCotaOfExePe + valorCotaPrcExePe;

            // CALCULO DO TOTAL DE COTAS EXECUTADAS
                const totalcotaOfExePe = valorCotaOfExePe/300;
                const totalcotaPrcExePe = valorCotaPrcExePe/200;

            // CALCULO DO SALDO FINAL
                const saldoFinalPe = valorFinalDistPe-valorFinalExePe;

        //---PE | FIM CALCULAR OS VALORES E COTAS TOTAIS POR DIRETORIA-------------------------------------------------------------------------

    //---PE | FIM

    //---TI | INICIO

                //---TI | INICIO TABELA DE COTAS DISTRIBUIDAS-------------------------------------------------------------------------
                const Sequelizeti = require('sequelize');
                const total_cotadistti = await db.pjes.findAll({
                    attributes: [
                        'id', 'operacao', 'evento', 'cotaofdist', 'cotaprcdist', 'mes', 'idome', 'iduser', 'obs',
                        [Sequelizeti.literal('SUM(cotaofdist)'), 'total_cotaofdist'],
                        [Sequelizeti.literal('SUM(cotaprcdist)'), 'total_cotaprcdist'],
                        [Sequelizeti.literal('SUM(cotaofdist) * 300'), 'total_cotaofdist_multiplicado'],
                        [Sequelizeti.literal('SUM(cotaprcdist) * 200'), 'total_cotaprcdist_multiplicado']
                    ],
                    where: 
                        {
                        idome:[2, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17],
                        mes,
                        ano,
                        operacao: "PJES CTM (BRT)",
                    },
                    include: [
                        { model: db.omes, attributes: ['nome'] },
                        { model: db.users, attributes: ['name'] }
                    ],
                    group: ['idome', 'ome.nome', 'user.name'],
                    raw: true,
                });

            //----TI | INICIO TABELA DE COTAS EXECUTADAS-------------------------------------------------------------------------
                const SequelizeExecutti = require('sequelize');
                const total_cotaexeti = await db.pjesgercota.findAll({
                    attributes: [
                        'id', 'operacao', 'id_ome', 'ttofexe', 'ttprcexe', 'status', 'mes', 'ano', 'obs',
                        [SequelizeExecutti.literal('SUM(ttofexe)'), 'total_cotaofexe'],
                        [SequelizeExecutti.literal('SUM(ttprcexe)'), 'total_cotaprcexe'],
                        [SequelizeExecutti.literal('SUM(ttofexe) * 300'), 'total_cotaofexe_multiplicado'],
                        [SequelizeExecutti.literal('SUM(ttprcexe) * 200'), 'total_cotaprcexe_multiplicado']
                    ],
                    where: 
                        {
                        id_ome:[2, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17],
                        mes,
                        ano,
                        operacao: "PJES CTM (BRT)",
                        },
                    include: [
                        { model: db.omes, attributes: ['nome'] },
                    ],
                    group: ['id_ome', 'ome.nome'],
                    raw: true,
                });

            //--- TI | INICIO CALCULAR OS VALORES TOTAIS POR DIRETORIA-------------------------------------------------------------------------

            //VALOR FINAL DE COTAS DISTRIBUIDAS OFICIAIS PE
                const SequelizeDistTi = require('sequelize');
                const valorfinal_cotadistti = await db.pjes.findAll({
                    attributes: [
                        [SequelizeDistTi.literal('SUM(cotaofdist) * 300'), 'valor_cotaofdist_multiplicado'],
                        [SequelizeDistTi.literal('SUM(cotaprcdist) * 200'), 'valor_cotaprcdist_multiplicado']
                    ],
                    where: {
                            idome:[2, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17],
                            mes,
                            ano,
                            operacao: "PJES CTM (BRT)",
                    },
                    raw: true,
                });

            //VALOR DE COTAS EXECUTADAS OFICIAIS TI
                const SequelizeExecutTi = require('sequelize');
                const valorfinal_cotaexeti = await db.pjesgercota.findAll({
                    attributes: [
                        [SequelizeExecutTi.literal('SUM(ttofexe) * 300'), 'valor_cotaofexe_multiplicado'],
                        [SequelizeExecutTi.literal('SUM(ttprcexe) * 200'), 'valor_cotaprcexe_multiplicado']
                    ],
                    where: {
                            id_ome:[2, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17],
                            mes,
                            ano,
                            operacao: "PJES CTM (BRT)",
                    },
                    raw: true,
                });

            //---TI | INICIO CALCULAR OS VALORES E COTAS TOTAIS POR DIRETORIA-------------------------------------------------------------------------

            // CALCULO DO VALOR DISTRIBUIDO
                const valorCotaOfDistTi = parseFloat(valorfinal_cotadistti[0]?.valor_cotaofdist_multiplicado) || 0;
                const valorCotaPrcDistTi = parseFloat(valorfinal_cotadistti[0]?.valor_cotaprcdist_multiplicado) || 0;
                const valorFinalDistTi = valorCotaOfDistTi + valorCotaPrcDistTi;

            // CALCULO DO TOTAL DE COTAS DISTRIBUIDAS
                const totalcotaOfDistTi = valorCotaOfDistTi/300;
                const totalcotaPrcDistTi = valorCotaPrcDistTi/200;


            // CALCULO DO VALOR EXECUTADO
                const valorCotaOfExeTi = parseFloat(valorfinal_cotaexeti[0]?.valor_cotaofexe_multiplicado) || 0;
                const valorCotaPrcExeTi = parseFloat(valorfinal_cotaexeti[0]?.valor_cotaprcexe_multiplicado) || 0;
                const valorFinalExeTi = valorCotaOfExeTi + valorCotaPrcExeTi;

            // CALCULO DO TOTAL DE COTAS EXECUTADAS
                const totalcotaOfExeTi = valorCotaOfExeTi/300;
                const totalcotaPrcExeTi = valorCotaPrcExeTi/200;

            // CALCULO DO SALDO FINAL
                const saldoFinalTi = valorFinalDistTi-valorFinalExeTi;

            //---TI | FIM CALCULAR OS VALORES E COTAS TOTAIS POR DIRETORIA-------------------------------------------------------------------------

    //---TI | FIM

    //---ENEM | INICIO

                //---ENEM | INICIO TABELA DE COTAS DISTRIBUIDAS-------------------------------------------------------------------------
                const Sequelizeenem = require('sequelize');
                const total_cotadistenem = await db.pjes.findAll({
                    attributes: [
                        'id', 'operacao', 'evento', 'cotaofdist', 'cotaprcdist', 'mes', 'idome', 'iduser', 'obs',
                        [Sequelizeenem.literal('SUM(cotaofdist)'), 'total_cotaofdist'],
                        [Sequelizeenem.literal('SUM(cotaprcdist)'), 'total_cotaprcdist'],
                        [Sequelizeenem.literal('SUM(cotaofdist) * 300'), 'total_cotaofdist_multiplicado'],
                        [Sequelizeenem.literal('SUM(cotaprcdist) * 200'), 'total_cotaprcdist_multiplicado']
                    ],
                    where: 
                        {
                        idome:[2, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17],
                        mes,
                        ano,
                        operacao: "PJES OP ENEM",
                    },
                    include: [
                        { model: db.omes, attributes: ['nome'] },
                        { model: db.users, attributes: ['name'] }
                    ],
                    group: ['idome', 'ome.nome', 'user.name'],
                    raw: true,
                });

            //----ENEM | INICIO TABELA DE COTAS EXECUTADAS-------------------------------------------------------------------------
                const SequelizeExecutenem = require('sequelize');
                const total_cotaexeenem = await db.pjesgercota.findAll({
                    attributes: [
                        'id', 'operacao', 'id_ome', 'ttofexe', 'ttprcexe', 'status', 'mes', 'ano', 'obs',
                        [SequelizeExecutenem.literal('SUM(ttofexe)'), 'total_cotaofexe'],
                        [SequelizeExecutenem.literal('SUM(ttprcexe)'), 'total_cotaprcexe'],
                        [SequelizeExecutenem.literal('SUM(ttofexe) * 300'), 'total_cotaofexe_multiplicado'],
                        [SequelizeExecutenem.literal('SUM(ttprcexe) * 200'), 'total_cotaprcexe_multiplicado']
                    ],
                    where: 
                        {
                        id_ome:[2, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17],
                        mes,
                        ano,
                        operacao: "PJES OP ENEM",
                        },
                    include: [
                        { model: db.omes, attributes: ['nome'] },
                    ],
                    group: ['id_ome', 'ome.nome'],
                    raw: true,
                });

            //--- ENEM | INICIO CALCULAR OS VALORES TOTAIS POR DIRETORIA-------------------------------------------------------------------------

            //VALOR FINAL DE COTAS DISTRIBUIDAS OFICIAIS ENEM
                const SequelizeDistEnem = require('sequelize');
                const valorfinal_cotadistenem = await db.pjes.findAll({
                    attributes: [
                        [SequelizeDistEnem.literal('SUM(cotaofdist) * 300'), 'valor_cotaofdist_multiplicado'],
                        [SequelizeDistEnem.literal('SUM(cotaprcdist) * 200'), 'valor_cotaprcdist_multiplicado']
                    ],
                    where: {
                            idome:[2, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17],
                            mes,
                            ano,
                            operacao: "PJES OP ENEM",
                    },
                    raw: true,
                });

            //VALOR DE COTAS EXECUTADAS OFICIAIS ENEM
                const SequelizeExecutEnem = require('sequelize');
                const valorfinal_cotaexeenem = await db.pjesgercota.findAll({
                    attributes: [
                        [SequelizeExecutEnem.literal('SUM(ttofexe) * 300'), 'valor_cotaofexe_multiplicado'],
                        [SequelizeExecutEnem.literal('SUM(ttprcexe) * 200'), 'valor_cotaprcexe_multiplicado']
                    ],
                    where: {
                            id_ome:[2, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17],
                            mes,
                            ano,
                            operacao: "PJES OP ENEM",
                    },
                    raw: true,
                });

            //---ENEM | INICIO CALCULAR OS VALORES E COTAS TOTAIS POR DIRETORIA-------------------------------------------------------------------------

            // CALCULO DO VALOR DISTRIBUIDO
                const valorCotaOfDistEnem = parseFloat(valorfinal_cotadistenem[0]?.valor_cotaofdist_multiplicado) || 0;
                const valorCotaPrcDistEnem = parseFloat(valorfinal_cotadistenem[0]?.valor_cotaprcdist_multiplicado) || 0;
                const valorFinalDistEnem = valorCotaOfDistTi + valorCotaPrcDistEnem;

            // CALCULO DO TOTAL DE COTAS DISTRIBUIDAS
                const totalcotaOfDistEnem = valorCotaOfDistEnem/300;
                const totalcotaPrcDistEnem = valorCotaPrcDistEnem/200;


            // CALCULO DO VALOR EXECUTADO
                const valorCotaOfExeEnem = parseFloat(valorfinal_cotaexeenem[0]?.valor_cotaofexe_multiplicado) || 0;
                const valorCotaPrcExeEnem = parseFloat(valorfinal_cotaexeenem[0]?.valor_cotaprcexe_multiplicado) || 0;
                const valorFinalExeEnem = valorCotaOfExeEnem + valorCotaPrcExeEnem;

            // CALCULO DO TOTAL DE COTAS EXECUTADAS
                const totalcotaOfExeEnem = valorCotaOfExeEnem/300;
                const totalcotaPrcExeEnem = valorCotaPrcExeEnem/200;

            // CALCULO DO SALDO FINAL
                const saldoFinalEnem = valorFinalDistEnem-valorFinalExeEnem;

            //---ENEM | FIM CALCULAR OS VALORES E COTAS TOTAIS POR DIRETORIA-------------------------------------------------------------------------

    //---ENEM | FIM



            // CALCULAR O SALDO GERAL DE COTAS PARA A UNIDADE

            function converterMesPTparaEN(nomeMesPT) {
                switch (nomeMesPT) {
                    case 'JAN':
                        return 'JAN';
                    case 'FEV':
                        return 'FEB';
                    case 'MAR':
                        return 'MAR';
                    case 'ABR':
                        return 'APR';
                    case 'MAI':
                        return 'MAY';
                    case 'JUN':
                        return 'JUN';
                    case 'JUL':
                        return 'JUL';
                    case 'AGO':
                        return 'AUG';
                    case 'SET':
                        return 'SEP';
                    case 'OUT':
                        return 'OCT';
                    case 'NOV':
                        return 'NOV';
                    case 'DEZ':
                        return 'DEC';
                    default:
                        return nomeMesPT;
                }
            }


            // BLOCO QUE CONTA A QUANTIDADE SERVIÇO EM EXCESSO DE OFICIAS E PRAÇAS
            const nomeMesConvert = converterMesPTparaEN(nomeMes);
            const ttServOf = await db.escalas.findAll({
                attributes: [
                    'matricula',
                    [Sequelize.fn('SUM', Sequelize.col('ttcota')), 'count']
                ],
                where: {
                    data_inicio: {
                        [Op.and]: [
                            Sequelize.literal(`DATE_FORMAT(data_inicio, '%b') = '${nomeMesConvert}'`),
                            Sequelize.literal(`YEAR(data_inicio) = ${nomeAno}`)
                        ]
                    },
                    pg: ['2º TEN', '1º TEN', 'CAP', 'MAJ', 'TC', 'CEL'],
                    idome:[2, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17],
                },
                group: ['matricula'],
                
            });
            const ttServicoOf = ttServOf.length;

            
            // BLOCO QUE CONTA A QUANTIDADE SERVIÇO EM EXCESSO DE OFICIAS E PRAÇAS
            const ttServPrc = await db.escalas.findAll({
                attributes: [
                    'matricula',
                    [Sequelize.fn('SUM', Sequelize.col('ttcota')), 'count']
                ],
                where: {
                    data_inicio: {
                        [Op.and]: [
                            Sequelize.literal(`DATE_FORMAT(data_inicio, '%b') = '${nomeMesConvert}'`),
                            Sequelize.literal(`YEAR(data_inicio) = ${nomeAno}`)
                        ]
                    },
                    pg: ['SD', 'CB', '3º SGT', '2º SGT', '1º SGT', 'ST'],
                    idome:[2, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17],
                },
                group: ['matricula'],
                
            });
            const ttServicoPrc = ttServPrc.length;

            const totalcotaOfDistGeral = totalcotaOfDistUnidade + totalcotaOfDistPe + totalcotaOfDistTi + totalcotaOfDistEnem;
            const totalcotaPrcDistGeral = totalcotaPrcDistUnidade + totalcotaPrcDistPe + totalcotaPrcDistTi + totalcotaPrcDistEnem;

            const saldocotaOfGeral = totalcotaOfDistGeral - ttServicoOf;
            const saldocotaPrcGeral = totalcotaPrcDistGeral - ttServicoPrc;



            // INICIO -  CONSULTA PARA TRAZER O REMANESCENTE DE OFICIAIS ANUAL
            const dataAtual = new Date();
            const anoAtual = dataAtual.getFullYear();
            const mesAtual = dataAtual.getMonth() + 1; // Mês atual (janeiro é 0, fevereiro é 1, ..., dezembro é 11)

            const somaCtgeralinicialof = await db.tetopjes.sum('ctgeralinicialof', {
                where: {
                    ano: anoAtual,
                    mes: {[Sequelize.Op.lte]: mesAtual},
                }
            });
            
            const somaTtofexe = await db.pjesgercota.sum('ttofexe', {
                    where: {
                        ano: anoAtual,
                        mes: {[Sequelize.Op.lte]: mesAtual},
                        operacao: {[Sequelize.Op.like]: 'PJES GOVERNO%'}
                    }
                });

            const saldoCtRenOfAnual = somaCtgeralinicialof - somaTtofexe;
            // FIM -  CONSULTA PARA TRAZER O REMANESCENTE DE OFICIAIS ANUAL
            

            // INICIO -  CONSULTA PARA TRAZER O REMANESCENTE DE PRAÇAS ANUAL
            const somaCtgeralinicialprc = await db.tetopjes.sum('ctgeralinicialprc', {
                where: {
                    ano: anoAtual,
                    mes: { [Sequelize.Op.lte]: mesAtual } // A soma é Somente até o mês atual
                }});
            const somaTtprcexe = await db.pjesgercota.sum('ttprcexe', {
                where: {
                    ano:anoAtual,
                    mes: { [Sequelize.Op.lte]: mesAtual },
                    operacao: {[Sequelize.Op.like]: 'PJES GOVERNO%'},
                }
            });
            const saldoCtRenPrcAnual = somaCtgeralinicialprc - somaTtprcexe;
            // FIM -  CONSULTA PARA TRAZER O REMANESCENTE DE PRAÇAS ANUAL



            // INICIO -  CONSULTA PARA TRAZER O TETO DE OFICIAIS E PRAÇAS DA TABELA tetopjes
            const ttgeralinicialofmes = await db.tetopjes.findOne({
                attributes: ['id', 'ctgeralinicialof', 'ctgeralinicialprc', 'mes', 'ano'],
                where: {
                    ano: anoAtual,
                    mes: { [Sequelize.Op.lte]: mesAtual } // A soma é Somente até o mês atual
                }});


            //---CALCULO TOTAL - PARTE SUPERIOR DA TELA PJES | INICIO
            const ctGeralInicialOf = ttgeralinicialofmes.ctgeralinicialof; //Passando os valores da consulta acima
            const ctGeralInicialPrc = ttgeralinicialofmes.ctgeralinicialprc; //Passando os valores da consulta acima
            const valorGeralInicial = ctGeralInicialOf*300 + ctGeralInicialPrc*200;

            const totalcotaOfDistGov = totalcotaOfDistUnidade;
            const totalcotaPrcDistGov = totalcotaPrcDistUnidade; 
            const totalcotaDistGov = totalcotaOfDistGov + totalcotaPrcDistGov;

            const totalcotaOfExeGov = totalcotaOfExeUnidade;
            const totalcotaPrcExeGov = totalcotaPrcExeUnidade; 
            const totalcotaExeGov = totalcotaOfExeGov + totalcotaPrcExeGov;

            const ctAtualOf = ctGeralInicialOf - totalcotaOfDistGov;
            const ctAtualPrc = ctGeralInicialPrc - totalcotaPrcDistGov;


            //TOTAL DE EVENTOS CADASTRADOS PARA A OME | COUNT
            const queryPjes = await db.pjes.count({
                where: {idome:[2, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17], mes, ano, },
            });


            function converterMesPTparaEN(nomeMesPT) {
                switch (nomeMesPT) {
                    case 'JAN':
                        return 'JAN';
                    case 'FEV':
                        return 'FEB';
                    case 'MAR':
                        return 'MAR';
                    case 'ABR':
                        return 'APR';
                    case 'MAI':
                        return 'MAY';
                    case 'JUN':
                        return 'JUN';
                    case 'JUL':
                        return 'JUL';
                    case 'AGO':
                        return 'AUG';
                    case 'SET':
                        return 'SEP';
                    case 'OUT':
                        return 'OCT';
                    case 'NOV':
                        return 'NOV';
                    case 'DEZ':
                        return 'DEC';
                    default:
                        return nomeMesPT;
                }
            }

            // BLOCO QUE CONTA A QUANTIDADE SERVIÇO EM EXCESSO DE OFICIAS E PRAÇAS
            const nomeMesConvertido = converterMesPTparaEN(nomeMes);

            const ttServExcessoOf = await db.escalas.findAll({
                attributes: [
                    'matricula',
                    [Sequelize.fn('SUM', Sequelize.col('ttcota')), 'count']
                ],
                where: {
                    data_inicio: {
                        [Op.and]: [
                            Sequelize.literal(`DATE_FORMAT(data_inicio, '%b') = '${nomeMesConvertido}'`),
                            Sequelize.literal(`YEAR(data_inicio) = ${nomeAno}`)
                        ]
                    },
                    pg: ['2º TEN', '1º TEN', 'CAP', 'MAJ', 'TC', 'CEL']
                },
                group: ['matricula'],
                having: Sequelize.literal('count > 12') // Condição para contar mais de 12 vezes
            });
            const ttServExcOf = ttServExcessoOf.length;
        
            // BLOCO QUE CONTA A QUANTIDADE SERVIÇO EM EXCESSO DE OFICIAS E PRAÇAS
            const ttServExcessoPrc = await db.escalas.findAll({
                attributes: [
                    'matricula',
                    [Sequelize.fn('SUM', Sequelize.col('ttcota')), 'count']
                ],
                where: {
                    data_inicio: {
                        [Op.and]: [
                            Sequelize.literal(`DATE_FORMAT(data_inicio, '%b') = '${nomeMesConvertido}'`),
                            Sequelize.literal(`YEAR(data_inicio) = ${nomeAno}`)
                        ]
                    },
                    pg: ['SD', 'CB', '3º SGT', '2º SGT', '1º SGT', 'ST']
                },
                group: ['matricula'],
                having: Sequelize.literal('count > 12') // Condição para contar mais de 12 vezes
            });
            const ttServExcPrc = ttServExcessoPrc.length;

            // MOSTRA O VALOR TOTAL DE EXCESSO DE OFICIAIS E PRAÇAS
            const valorttServExc = (parseFloat(ttServExcOf) * 300) + (parseFloat(ttServExcPrc) * 200);

            //TOTAL DE POLICIAIS IMPEDIDOS COM COTA NA OME | COUNT   
            const contagemImpedidos = await db.escalas.count({
                attributes: ['id','operacao', 'cod', 'nunfunc', 'pg', 'matricula', 'nome','telefone','status', 'modalidade', 'data_inicio', 'hora_inicio', 'data_fim', 'hora_fim', 'ome_sgpm', 'localap', 'anotacoes', 'idevento', 'idome', 'createdAt', 'updatedAt'],
                    where: Sequelize.literal(`
                        DATE_FORMAT(data_inicio, '%b') = '${nomeMesConvertido}' AND
                        YEAR(data_inicio) = ${nomeAno} AND
                        idome = ${2, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17} AND
                        status = 'IMPEDIDO'`),
            });
            

            // INICIO BLOCO QUE CONTA A QUANTIDADE REMANESCENTE DE OFICIAS E PRAÇAS
            const SequelizeRem = require('sequelize');
            const total_cotadistRen = await db.pjes.findAll({
                attributes: [
                    'id', 'operacao', 'evento', 'cotaofdist', 'cotaprcdist', 'mes', 'idome', 'iduser', 'obs',
                    [SequelizeRem.literal('SUM(cotaofdist)'), 'total_cotaofdist'],
                    [SequelizeRem.literal('SUM(cotaprcdist)'), 'total_cotaprcdist'],
                    [SequelizeRem.literal('SUM(cotaofdist) * 300'), 'total_cotaofdist_multiplicado'],
                    [SequelizeRem.literal('SUM(cotaprcdist) * 200'), 'total_cotaprcdist_multiplicado']
                ],
                where: { 
                    mes,
                    ano,
                    idome:[2, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17],
                    operacao: "PJES GOVERNO REMANESCENTE",
                },
                
                raw: true,
            });

            const valorCotaOfDistRen = parseFloat(total_cotadistRen[0]?.total_cotaofdist_multiplicado) || 0;
            const valorCotaPrcDistRen = parseFloat(total_cotadistRen[0]?.total_cotaprcdist_multiplicado) || 0;
            const totalcotaOfDistRen = valorCotaOfDistRen/300;
            const totalcotaPrcDistRen = valorCotaPrcDistRen/200;

            const totalFinalDistRen = valorCotaOfDistRen + valorCotaPrcDistRen;
        
                SaldoAnualOfGov = ctGeralInicialOf - totalcotaOfExeGov;
                SaldoAnualPrcGov = ctGeralInicialPrc - totalcotaPrcExeGov;
            // FIM BLOCO QUE CONTA A QUANTIDADE REMANESCENTE DE OFICIAS E PRAÇAS


            const user = await db.users.findOne({
                attributes: ['id', 'name', 'email', 'image', 'situationId', 'omeId', 'createdAt'],
                where: {
                    id: req.user.dataValues.id
                },
                include: [{
                    model: db.situations,
                    attributes: ['nameSituation']
                }]
            });


            // Consulta para obter os Pjes com inclusão da soma de escalas onde pg = 'ST' ou 'CB' e 'CEL' ou 'MAJ'
            await db.pjes.findAll({
                attributes: [
                    'id', 'operacao', 'evento', 'cotaofdist', 'cotaprcdist', 'mes', 'idome', 'iduser', 'obs',
                    // Subconsulta para contar pg = 'ST' ou 'CB'
                    [
                        Sequelize.literal(`(
                            SELECT SUM(ttcota)
                            FROM escalas 
                            WHERE escalas.idevento = pjes.id
                            AND (escalas.pg = 'ST' OR escalas.pg = '1º SGT'
                                OR escalas.pg = '2º SGT'  OR escalas.pg = '3º SGT' 
                                OR escalas.pg = 'CB'  OR escalas.pg = 'SD')
                        )`),
                        'count_pg_prc'
                    ],
                    // Subconsulta para contar pg = 'CEL' ou 'MAJ'
                    [
                        Sequelize.literal(`(
                            SELECT SUM(ttcota)
                            FROM escalas 
                            WHERE escalas.idevento = pjes.id
                            AND (escalas.pg = 'CEL' OR escalas.pg = 'TC'
                                OR escalas.pg = 'MAJ'  OR escalas.pg = 'CAP' 
                                OR escalas.pg = '1º TEN'  OR escalas.pg = '2º TEN')
                        )`),
                        'count_pg_of'
                    ]
                ],
                where: {
                    ano, mes, idome:[2, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17],
                },
                order: [['id', 'DESC']],
                include: [
                    { model: db.omes, attributes: ['nome'] },
                    { model: db.users, attributes: ['name'] }
                ],
                
            })
            .then((pjes) => {

                if (pjes.length !== 0) {
                    
                        res.render("unidade/unidadepjes/list", {
                        layout: 'main', profile: req.user.dataValues, user, nomeMes, nomeAno, sidebarSituations: true,
                        pjes: pjes.map(id => id.toJSON()),
                        valorFinalDistUnidade, valorFinalExeUnidade, saldoFinalUnidade, total_cotadistunidade, total_cotaexeunidade, totalcotaOfDistUnidade,
                        totalcotaPrcDistUnidade, totalcotaOfExeUnidade, totalcotaPrcExeUnidade,

                        valorFinalDistPe, valorFinalExePe, saldoFinalPe, total_cotadistpe,
                        total_cotaexepe, totalcotaOfDistPe, totalcotaPrcDistPe, totalcotaOfExePe,
                        totalcotaPrcExePe,

                        valorFinalDistTi, valorFinalExeTi, saldoFinalTi, total_cotadistti,
                        total_cotaexeti, totalcotaOfDistTi, totalcotaPrcDistTi, totalcotaOfExeTi,
                        totalcotaPrcExeTi,

                        valorFinalDistEnem, valorFinalExeEnem, saldoFinalEnem, total_cotadistenem,
                        total_cotaexeenem, totalcotaOfDistEnem, totalcotaPrcDistEnem, totalcotaOfExeEnem,
                        totalcotaPrcExeEnem,

                        totalcotaOfDistGeral, queryPjes, contagemImpedidos, totalcotaPrcDistGeral, saldocotaOfGeral, saldocotaPrcGeral,

                        ctAtualOf,ctAtualPrc, valorGeralInicial, ctGeralInicialOf, ctGeralInicialPrc, valorGeralInicial,
                        totalcotaDistGov, totalcotaExeGov, totalcotaOfDistGov, totalcotaPrcDistGov, totalcotaOfExeGov,
                        totalcotaPrcExeGov, ttServExcOf, ttServExcPrc, valorttServExc, totalFinalDistRen, totalcotaOfDistRen,
                        totalcotaPrcDistRen, SaldoAnualOfGov, SaldoAnualPrcGov, saldoCtRenOfAnual, saldoCtRenPrcAnual,

                        
                    });
                } else {
                    res.render("unidade/unidadepjes/list", {
                        layout: 'main', profile: req.user.dataValues, sidebarSituations: true, danger_msg: 'Erro: Nenhum Evento Cadastrado!'
                    });
                }

            })
            .catch(() => {
                res.render("unidade/unidadepjes/list", {
                    layout: 'main', profile: req.user.dataValues, sidebarSituations: true, danger_msg: 'Erro: Nenhum Evento Cadastrado!'
                });
            });


    } // FIM IF DIM ----------------------------------------------------------------------------------------------------------------------------------------------


    // INICIO DIRESP ---------------------------------------------------------------------------------------------------------------------------------------------
    if (req.user.dataValues.omeId == 3){ 

        const countPjes = await db.pjes.count();
                
                if (countPjes === 0) {
                    return res.render("unidade/unidadepjes/list", { layout: 'main', profile: req.user.dataValues, sidebarSituations: true, danger_msg: 'Erro: Nenhum pjes encontrada!' });
                }


            //---UNIDADES | INICIO TABELA DE COTAS DISTRIBUIDAS-------------------------------------------------------------------------
                const Sequelize = require('sequelize');
                const total_cotadistunidade = await db.pjes.findAll({
                    attributes: [
                        'id', 'operacao', 'evento', 'cotaofdist', 'cotaprcdist', 'mes', 'idome', 'iduser', 'obs',
                        [Sequelize.literal('SUM(cotaofdist)'), 'total_cotaofdist'],
                        [Sequelize.literal('SUM(cotaprcdist)'), 'total_cotaprcdist'],
                        [Sequelize.literal('SUM(cotaofdist) * 300'), 'total_cotaofdist_multiplicado'],
                        [Sequelize.literal('SUM(cotaprcdist) * 200'), 'total_cotaprcdist_multiplicado']
                    ],
                    where: 
                        {
                            idome:[3, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33],
                            ano,
                            mes,
                            operacao: {
                                [Sequelize.Op.like]: 'PJES GOVERNO%'
                            },
                    },
                    include: [
                        { model: db.omes, attributes: ['nome'] },
                        { model: db.users, attributes: ['name'] }
                    ],
                    group: ['idome', 'ome.nome', 'user.name'],
                    raw: true,
                });

            //----UNIDADES | INICIO TABELA DE COTAS EXECUTADAS-------------------------------------------------------------------------
                const SequelizeExecut = require('sequelize');
                const total_cotaexeunidade = await db.pjesgercota.findAll({
                    attributes: [
                        'id', 'operacao', 'id_ome', 'ttofexe', 'ttprcexe', 'status', 'mes', 'ano', 'obs',
                        [SequelizeExecut.literal('SUM(ttofexe)'), 'total_cotaofexe'],
                        [SequelizeExecut.literal('SUM(ttprcexe)'), 'total_cotaprcexe'],
                        [SequelizeExecut.literal('SUM(ttofexe) * 300'), 'total_cotaofexe_multiplicado'],
                        [SequelizeExecut.literal('SUM(ttprcexe) * 200'), 'total_cotaprcexe_multiplicado']
                    ],
                    where: 
                        {id_ome:[3, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33],
                        ano,
                        mes,
                        operacao: {
                            [SequelizeExecut.Op.like]: 'PJES GOVERNO%'
                            },
                        },
                    include: [
                        { model: db.omes, attributes: ['nome'] },
                    ],
                    group: ['id_ome', 'ome.nome'],
                    raw: true,
                });


            //--- UNIDADES | INICIO CALCULAR OS VALORES TOTAIS POR UNIDADES-------------------------------------------------------------------------

                //VALOR FINAL DE COTAS DISTRIBUIDAS OFICIAIS UNIDADES
                const SequelizeDistUnidade = require('sequelize');
                const valorfinal_cotadistunidade = await db.pjes.findAll({
                    attributes: [
                        [SequelizeDistUnidade.literal('SUM(cotaofdist) * 300'), 'valor_cotaofdist_multiplicado'],
                        [SequelizeDistUnidade.literal('SUM(cotaprcdist) * 200'), 'valor_cotaprcdist_multiplicado']
                    ],
                    where: {
                            idome:[3, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33],
                            ano,
                            mes,
                            operacao: {
                                [SequelizeDistUnidade.Op.like]: 'PJES GOVERNO%'
                            },
                            
                    },
                    raw: true,
                });

                //VALOR DE COTAS EXECUTADAS OFICIAIS UNIDADES
                const SequelizeExecutUnidade = require('sequelize');
                const valorfinal_cotaexeunidade = await db.pjesgercota.findAll({
                    attributes: [
                        [SequelizeExecutUnidade.literal('SUM(ttofexe) * 300'), 'valor_cotaofexe_multiplicado'],
                        [SequelizeExecutUnidade.literal('SUM(ttprcexe) * 200'), 'valor_cotaprcexe_multiplicado']
                    ],
                    where: {
                            id_ome:[3, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33],
                            ano,
                            mes,
                            operacao: {
                                [SequelizeExecutUnidade.Op.like]: 'PJES GOVERNO%'
                            },
                    },
                    raw: true,
                });

            //---UNIDADES | INICIO CALCULAR OS VALORES E COTAS TOTAIS POR UNIDADES-------------------------------------------------------------------------

                // CALCULO DO VALOR DISTRIBUIDO
                const valorCotaOfDistUnidade = parseFloat(valorfinal_cotadistunidade[0]?.valor_cotaofdist_multiplicado) || 0;
                const valorCotaPrcDistUnidade = parseFloat(valorfinal_cotadistunidade[0]?.valor_cotaprcdist_multiplicado) || 0;
                const valorFinalDistUnidade = valorCotaOfDistUnidade + valorCotaPrcDistUnidade;

                // CALCULO DO TOTAL DE COTAS DISTRIBUIDAS
                const totalcotaOfDistUnidade = valorCotaOfDistUnidade/300;
                const totalcotaPrcDistUnidade = valorCotaPrcDistUnidade/200;


                // CALCULO DO VALOR EXECUTADO
                const valorCotaOfExeUnidade = parseFloat(valorfinal_cotaexeunidade[0]?.valor_cotaofexe_multiplicado) || 0;
                const valorCotaPrcExeUnidade = parseFloat(valorfinal_cotaexeunidade[0]?.valor_cotaprcexe_multiplicado) || 0;
                const valorFinalExeUnidade = valorCotaOfExeUnidade + valorCotaPrcExeUnidade;

                // CALCULO DO TOTAL DE COTAS EXECUTADAS
                const totalcotaOfExeUnidade = valorCotaOfExeUnidade/300;
                const totalcotaPrcExeUnidade = valorCotaPrcExeUnidade/200;

                // CALCULO DO SALDO FINAL
                const saldoFinalUnidade = valorFinalDistUnidade-valorFinalExeUnidade;

            //---UNIDADES | FIM CALCULAR OS VALORES E COTAS TOTAIS POR DIRETORIA-------------------------------------------------------------------------


            //---PE | INICIO

        //---PE | INICIO TABELA DE COTAS DISTRIBUIDAS-------------------------------------------------------------------------
                const Sequelizepe = require('sequelize');
                const total_cotadistpe = await db.pjes.findAll({
                    attributes: [
                        'id', 'operacao', 'evento', 'cotaofdist', 'cotaprcdist', 'mes', 'idome', 'iduser', 'obs',
                        [Sequelizepe.literal('SUM(cotaofdist)'), 'total_cotaofdist'],
                        [Sequelizepe.literal('SUM(cotaprcdist)'), 'total_cotaprcdist'],
                        [Sequelizepe.literal('SUM(cotaofdist) * 300'), 'total_cotaofdist_multiplicado'],
                        [Sequelizepe.literal('SUM(cotaprcdist) * 200'), 'total_cotaprcdist_multiplicado']
                    ],
                    where: 
                        {
                        idome:[3, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33],
                        mes,
                        ano,
                        operacao: "PJES PATRULHA ESCOLAR",
                    },
                    include: [
                        { model: db.omes, attributes: ['nome'] },
                        { model: db.users, attributes: ['name'] }
                    ],
                    group: ['idome', 'ome.nome', 'user.name'],
                    raw: true,
                });

            //----PE | INICIO TABELA DE COTAS EXECUTADAS-------------------------------------------------------------------------
                const SequelizeExecutpe = require('sequelize');
                const total_cotaexepe = await db.pjesgercota.findAll({
                    attributes: [
                        'id', 'operacao', 'id_ome', 'ttofexe', 'ttprcexe', 'status', 'mes', 'ano', 'obs',
                        [SequelizeExecutpe.literal('SUM(ttofexe)'), 'total_cotaofexe'],
                        [SequelizeExecutpe.literal('SUM(ttprcexe)'), 'total_cotaprcexe'],
                        [SequelizeExecutpe.literal('SUM(ttofexe) * 300'), 'total_cotaofexe_multiplicado'],
                        [SequelizeExecutpe.literal('SUM(ttprcexe) * 200'), 'total_cotaprcexe_multiplicado']
                    ],
                    where: 
                        {
                        id_ome:[3, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33],
                        mes,
                        ano,
                        operacao: "PJES PATRULHA ESCOLAR",
                        },
                    include: [
                        { model: db.omes, attributes: ['nome'] },
                    ],
                    group: ['id_ome', 'ome.nome'],
                    raw: true,
                });

            //--- PE | INICIO CALCULAR OS VALORES TOTAIS POR DIRETORIA-------------------------------------------------------------------------

            //VALOR FINAL DE COTAS DISTRIBUIDAS OFICIAIS PE
                const SequelizeDistPe = require('sequelize');
                const valorfinal_cotadistpe = await db.pjes.findAll({
                    attributes: [
                        [SequelizeDistPe.literal('SUM(cotaofdist) * 300'), 'valor_cotaofdist_multiplicado'],
                        [SequelizeDistPe.literal('SUM(cotaprcdist) * 200'), 'valor_cotaprcdist_multiplicado']
                    ],
                    where: {
                            idome:[3, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33],
                            mes,
                            ano,
                            operacao: "PJES PATRULHA ESCOLAR",
                    },
                    raw: true,
                });

            //VALOR DE COTAS EXECUTADAS OFICIAIS PE
                const SequelizeExecutPe = require('sequelize');
                const valorfinal_cotaexepe = await db.pjesgercota.findAll({
                    attributes: [
                        [SequelizeExecutPe.literal('SUM(ttofexe) * 300'), 'valor_cotaofexe_multiplicado'],
                        [SequelizeExecutPe.literal('SUM(ttprcexe) * 200'), 'valor_cotaprcexe_multiplicado']
                    ],
                    where: {
                            id_ome:[3, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33],
                            mes,
                            ano,
                            operacao: "PJES PATRULHA ESCOLAR",
                    },
                    raw: true,
                });

            //---PE | INICIO CALCULAR OS VALORES E COTAS TOTAIS POR DIRETORIA-------------------------------------------------------------------------

            // CALCULO DO VALOR DISTRIBUIDO
                const valorCotaOfDistPe = parseFloat(valorfinal_cotadistpe[0]?.valor_cotaofdist_multiplicado) || 0;
                const valorCotaPrcDistPe = parseFloat(valorfinal_cotadistpe[0]?.valor_cotaprcdist_multiplicado) || 0;
                const valorFinalDistPe = valorCotaOfDistPe + valorCotaPrcDistPe;

            // CALCULO DO TOTAL DE COTAS DISTRIBUIDAS
                const totalcotaOfDistPe = valorCotaOfDistPe/300;
                const totalcotaPrcDistPe = valorCotaPrcDistPe/200;


            // CALCULO DO VALOR EXECUTADO
                const valorCotaOfExePe = parseFloat(valorfinal_cotaexepe[0]?.valor_cotaofexe_multiplicado) || 0;
                const valorCotaPrcExePe = parseFloat(valorfinal_cotaexepe[0]?.valor_cotaprcexe_multiplicado) || 0;
                const valorFinalExePe = valorCotaOfExePe + valorCotaPrcExePe;

            // CALCULO DO TOTAL DE COTAS EXECUTADAS
                const totalcotaOfExePe = valorCotaOfExePe/300;
                const totalcotaPrcExePe = valorCotaPrcExePe/200;

            // CALCULO DO SALDO FINAL
                const saldoFinalPe = valorFinalDistPe-valorFinalExePe;

        //---PE | FIM CALCULAR OS VALORES E COTAS TOTAIS POR DIRETORIA-------------------------------------------------------------------------

    //---PE | FIM

    //---TI | INICIO

                //---TI | INICIO TABELA DE COTAS DISTRIBUIDAS-------------------------------------------------------------------------
                const Sequelizeti = require('sequelize');
                const total_cotadistti = await db.pjes.findAll({
                    attributes: [
                        'id', 'operacao', 'evento', 'cotaofdist', 'cotaprcdist', 'mes', 'idome', 'iduser', 'obs',
                        [Sequelizeti.literal('SUM(cotaofdist)'), 'total_cotaofdist'],
                        [Sequelizeti.literal('SUM(cotaprcdist)'), 'total_cotaprcdist'],
                        [Sequelizeti.literal('SUM(cotaofdist) * 300'), 'total_cotaofdist_multiplicado'],
                        [Sequelizeti.literal('SUM(cotaprcdist) * 200'), 'total_cotaprcdist_multiplicado']
                    ],
                    where: 
                        {
                        idome:[3, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33],
                        mes,
                        ano,
                        operacao: "PJES CTM (BRT)",
                    },
                    include: [
                        { model: db.omes, attributes: ['nome'] },
                        { model: db.users, attributes: ['name'] }
                    ],
                    group: ['idome', 'ome.nome', 'user.name'],
                    raw: true,
                });

            //----TI | INICIO TABELA DE COTAS EXECUTADAS-------------------------------------------------------------------------
                const SequelizeExecutti = require('sequelize');
                const total_cotaexeti = await db.pjesgercota.findAll({
                    attributes: [
                        'id', 'operacao', 'id_ome', 'ttofexe', 'ttprcexe', 'status', 'mes', 'ano', 'obs',
                        [SequelizeExecutti.literal('SUM(ttofexe)'), 'total_cotaofexe'],
                        [SequelizeExecutti.literal('SUM(ttprcexe)'), 'total_cotaprcexe'],
                        [SequelizeExecutti.literal('SUM(ttofexe) * 300'), 'total_cotaofexe_multiplicado'],
                        [SequelizeExecutti.literal('SUM(ttprcexe) * 200'), 'total_cotaprcexe_multiplicado']
                    ],
                    where: 
                        {
                        id_ome:[3, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33],
                        mes,
                        ano,
                        operacao: "PJES CTM (BRT)",
                        },
                    include: [
                        { model: db.omes, attributes: ['nome'] },
                    ],
                    group: ['id_ome', 'ome.nome'],
                    raw: true,
                });

            //--- TI | INICIO CALCULAR OS VALORES TOTAIS POR DIRETORIA-------------------------------------------------------------------------

            //VALOR FINAL DE COTAS DISTRIBUIDAS OFICIAIS PE
                const SequelizeDistTi = require('sequelize');
                const valorfinal_cotadistti = await db.pjes.findAll({
                    attributes: [
                        [SequelizeDistTi.literal('SUM(cotaofdist) * 300'), 'valor_cotaofdist_multiplicado'],
                        [SequelizeDistTi.literal('SUM(cotaprcdist) * 200'), 'valor_cotaprcdist_multiplicado']
                    ],
                    where: {
                            idome:[3, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33],
                            mes,
                            ano,
                            operacao: "PJES CTM (BRT)",
                    },
                    raw: true,
                });

            //VALOR DE COTAS EXECUTADAS OFICIAIS TI
                const SequelizeExecutTi = require('sequelize');
                const valorfinal_cotaexeti = await db.pjesgercota.findAll({
                    attributes: [
                        [SequelizeExecutTi.literal('SUM(ttofexe) * 300'), 'valor_cotaofexe_multiplicado'],
                        [SequelizeExecutTi.literal('SUM(ttprcexe) * 200'), 'valor_cotaprcexe_multiplicado']
                    ],
                    where: {
                            id_ome:[3, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33],
                            mes,
                            ano,
                            operacao: "PJES CTM (BRT)",
                    },
                    raw: true,
                });

            //---TI | INICIO CALCULAR OS VALORES E COTAS TOTAIS POR DIRETORIA-------------------------------------------------------------------------

            // CALCULO DO VALOR DISTRIBUIDO
                const valorCotaOfDistTi = parseFloat(valorfinal_cotadistti[0]?.valor_cotaofdist_multiplicado) || 0;
                const valorCotaPrcDistTi = parseFloat(valorfinal_cotadistti[0]?.valor_cotaprcdist_multiplicado) || 0;
                const valorFinalDistTi = valorCotaOfDistTi + valorCotaPrcDistTi;

            // CALCULO DO TOTAL DE COTAS DISTRIBUIDAS
                const totalcotaOfDistTi = valorCotaOfDistTi/300;
                const totalcotaPrcDistTi = valorCotaPrcDistTi/200;


            // CALCULO DO VALOR EXECUTADO
                const valorCotaOfExeTi = parseFloat(valorfinal_cotaexeti[0]?.valor_cotaofexe_multiplicado) || 0;
                const valorCotaPrcExeTi = parseFloat(valorfinal_cotaexeti[0]?.valor_cotaprcexe_multiplicado) || 0;
                const valorFinalExeTi = valorCotaOfExeTi + valorCotaPrcExeTi;

            // CALCULO DO TOTAL DE COTAS EXECUTADAS
                const totalcotaOfExeTi = valorCotaOfExeTi/300;
                const totalcotaPrcExeTi = valorCotaPrcExeTi/200;

            // CALCULO DO SALDO FINAL
                const saldoFinalTi = valorFinalDistTi-valorFinalExeTi;

            //---TI | FIM CALCULAR OS VALORES E COTAS TOTAIS POR DIRETORIA-------------------------------------------------------------------------

    //---TI | FIM

    //---ENEM | INICIO

                //---ENEM | INICIO TABELA DE COTAS DISTRIBUIDAS-------------------------------------------------------------------------
                const Sequelizeenem = require('sequelize');
                const total_cotadistenem = await db.pjes.findAll({
                    attributes: [
                        'id', 'operacao', 'evento', 'cotaofdist', 'cotaprcdist', 'mes', 'idome', 'iduser', 'obs',
                        [Sequelizeenem.literal('SUM(cotaofdist)'), 'total_cotaofdist'],
                        [Sequelizeenem.literal('SUM(cotaprcdist)'), 'total_cotaprcdist'],
                        [Sequelizeenem.literal('SUM(cotaofdist) * 300'), 'total_cotaofdist_multiplicado'],
                        [Sequelizeenem.literal('SUM(cotaprcdist) * 200'), 'total_cotaprcdist_multiplicado']
                    ],
                    where: 
                        {
                        idome:[3, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33],
                        mes,
                        ano,
                        operacao: "PJES OP ENEM",
                    },
                    include: [
                        { model: db.omes, attributes: ['nome'] },
                        { model: db.users, attributes: ['name'] }
                    ],
                    group: ['idome', 'ome.nome', 'user.name'],
                    raw: true,
                });

            //----ENEM | INICIO TABELA DE COTAS EXECUTADAS-------------------------------------------------------------------------
                const SequelizeExecutenem = require('sequelize');
                const total_cotaexeenem = await db.pjesgercota.findAll({
                    attributes: [
                        'id', 'operacao', 'id_ome', 'ttofexe', 'ttprcexe', 'status', 'mes', 'ano', 'obs',
                        [SequelizeExecutenem.literal('SUM(ttofexe)'), 'total_cotaofexe'],
                        [SequelizeExecutenem.literal('SUM(ttprcexe)'), 'total_cotaprcexe'],
                        [SequelizeExecutenem.literal('SUM(ttofexe) * 300'), 'total_cotaofexe_multiplicado'],
                        [SequelizeExecutenem.literal('SUM(ttprcexe) * 200'), 'total_cotaprcexe_multiplicado']
                    ],
                    where: 
                        {
                        id_ome:[3, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33],
                        mes,
                        ano,
                        operacao: "PJES OP ENEM",
                        },
                    include: [
                        { model: db.omes, attributes: ['nome'] },
                    ],
                    group: ['id_ome', 'ome.nome'],
                    raw: true,
                });

            //--- ENEM | INICIO CALCULAR OS VALORES TOTAIS POR DIRETORIA-------------------------------------------------------------------------

            //VALOR FINAL DE COTAS DISTRIBUIDAS OFICIAIS ENEM
                const SequelizeDistEnem = require('sequelize');
                const valorfinal_cotadistenem = await db.pjes.findAll({
                    attributes: [
                        [SequelizeDistEnem.literal('SUM(cotaofdist) * 300'), 'valor_cotaofdist_multiplicado'],
                        [SequelizeDistEnem.literal('SUM(cotaprcdist) * 200'), 'valor_cotaprcdist_multiplicado']
                    ],
                    where: {
                            idome:[3, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33],
                            mes,
                            ano,
                            operacao: "PJES OP ENEM",
                    },
                    raw: true,
                });

            //VALOR DE COTAS EXECUTADAS OFICIAIS ENEM
                const SequelizeExecutEnem = require('sequelize');
                const valorfinal_cotaexeenem = await db.pjesgercota.findAll({
                    attributes: [
                        [SequelizeExecutEnem.literal('SUM(ttofexe) * 300'), 'valor_cotaofexe_multiplicado'],
                        [SequelizeExecutEnem.literal('SUM(ttprcexe) * 200'), 'valor_cotaprcexe_multiplicado']
                    ],
                    where: {
                            id_ome:[3, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33],
                            mes,
                            ano,
                            operacao: "PJES OP ENEM",
                    },
                    raw: true,
                });

            //---ENEM | INICIO CALCULAR OS VALORES E COTAS TOTAIS POR DIRETORIA-------------------------------------------------------------------------

            // CALCULO DO VALOR DISTRIBUIDO
                const valorCotaOfDistEnem = parseFloat(valorfinal_cotadistenem[0]?.valor_cotaofdist_multiplicado) || 0;
                const valorCotaPrcDistEnem = parseFloat(valorfinal_cotadistenem[0]?.valor_cotaprcdist_multiplicado) || 0;
                const valorFinalDistEnem = valorCotaOfDistTi + valorCotaPrcDistEnem;

            // CALCULO DO TOTAL DE COTAS DISTRIBUIDAS
                const totalcotaOfDistEnem = valorCotaOfDistEnem/300;
                const totalcotaPrcDistEnem = valorCotaPrcDistEnem/200;


            // CALCULO DO VALOR EXECUTADO
                const valorCotaOfExeEnem = parseFloat(valorfinal_cotaexeenem[0]?.valor_cotaofexe_multiplicado) || 0;
                const valorCotaPrcExeEnem = parseFloat(valorfinal_cotaexeenem[0]?.valor_cotaprcexe_multiplicado) || 0;
                const valorFinalExeEnem = valorCotaOfExeEnem + valorCotaPrcExeEnem;

            // CALCULO DO TOTAL DE COTAS EXECUTADAS
                const totalcotaOfExeEnem = valorCotaOfExeEnem/300;
                const totalcotaPrcExeEnem = valorCotaPrcExeEnem/200;

            // CALCULO DO SALDO FINAL
                const saldoFinalEnem = valorFinalDistEnem-valorFinalExeEnem;

            //---ENEM | FIM CALCULAR OS VALORES E COTAS TOTAIS POR DIRETORIA-------------------------------------------------------------------------

    //---ENEM | FIM



            // CALCULAR O SALDO GERAL DE COTAS PARA A UNIDADE

            function converterMesPTparaEN(nomeMesPT) {
                switch (nomeMesPT) {
                    case 'JAN':
                        return 'JAN';
                    case 'FEV':
                        return 'FEB';
                    case 'MAR':
                        return 'MAR';
                    case 'ABR':
                        return 'APR';
                    case 'MAI':
                        return 'MAY';
                    case 'JUN':
                        return 'JUN';
                    case 'JUL':
                        return 'JUL';
                    case 'AGO':
                        return 'AUG';
                    case 'SET':
                        return 'SEP';
                    case 'OUT':
                        return 'OCT';
                    case 'NOV':
                        return 'NOV';
                    case 'DEZ':
                        return 'DEC';
                    default:
                        return nomeMesPT;
                }
            }


            // BLOCO QUE CONTA A QUANTIDADE SERVIÇO EM EXCESSO DE OFICIAS E PRAÇAS
            const nomeMesConvert = converterMesPTparaEN(nomeMes);
            const ttServOf = await db.escalas.findAll({
                attributes: [
                    'matricula',
                    [Sequelize.fn('SUM', Sequelize.col('ttcota')), 'count']
                ],
                where: {
                    data_inicio: {
                        [Op.and]: [
                            Sequelize.literal(`DATE_FORMAT(data_inicio, '%b') = '${nomeMesConvert}'`),
                            Sequelize.literal(`YEAR(data_inicio) = ${nomeAno}`)
                        ]
                    },
                    pg: ['2º TEN', '1º TEN', 'CAP', 'MAJ', 'TC', 'CEL'],
                    idome:[3, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33],
                },
                group: ['matricula'],
                
            });
            const ttServicoOf = ttServOf.length;

            
            // BLOCO QUE CONTA A QUANTIDADE SERVIÇO EM EXCESSO DE OFICIAS E PRAÇAS
            const ttServPrc = await db.escalas.findAll({
                attributes: [
                    'matricula',
                    [Sequelize.fn('SUM', Sequelize.col('ttcota')), 'count']
                ],
                where: {
                    data_inicio: {
                        [Op.and]: [
                            Sequelize.literal(`DATE_FORMAT(data_inicio, '%b') = '${nomeMesConvert}'`),
                            Sequelize.literal(`YEAR(data_inicio) = ${nomeAno}`)
                        ]
                    },
                    pg: ['SD', 'CB', '3º SGT', '2º SGT', '1º SGT', 'ST'],
                    idome:[3, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33],
                },
                group: ['matricula'],
                
            });
            const ttServicoPrc = ttServPrc.length;

            const totalcotaOfDistGeral = totalcotaOfDistUnidade + totalcotaOfDistPe + totalcotaOfDistTi + totalcotaOfDistEnem;
            const totalcotaPrcDistGeral = totalcotaPrcDistUnidade + totalcotaPrcDistPe + totalcotaPrcDistTi + totalcotaPrcDistEnem;

            const saldocotaOfGeral = totalcotaOfDistGeral - ttServicoOf;
            const saldocotaPrcGeral = totalcotaPrcDistGeral - ttServicoPrc;



            // INICIO -  CONSULTA PARA TRAZER O REMANESCENTE DE OFICIAIS ANUAL
            const dataAtual = new Date();
            const anoAtual = dataAtual.getFullYear();
            const mesAtual = dataAtual.getMonth() + 1; // Mês atual (janeiro é 0, fevereiro é 1, ..., dezembro é 11)

            const somaCtgeralinicialof = await db.tetopjes.sum('ctgeralinicialof', {
                where: {
                    ano: anoAtual,
                    mes: {[Sequelize.Op.lte]: mesAtual},
                }
            });
            
            const somaTtofexe = await db.pjesgercota.sum('ttofexe', {
                    where: {
                        ano: anoAtual,
                        mes: {[Sequelize.Op.lte]: mesAtual},
                        operacao: {[Sequelize.Op.like]: 'PJES GOVERNO%'}
                    }
                });

            const saldoCtRenOfAnual = somaCtgeralinicialof - somaTtofexe;
            // FIM -  CONSULTA PARA TRAZER O REMANESCENTE DE OFICIAIS ANUAL
            

            // INICIO -  CONSULTA PARA TRAZER O REMANESCENTE DE PRAÇAS ANUAL
            const somaCtgeralinicialprc = await db.tetopjes.sum('ctgeralinicialprc', {
                where: {
                    ano: anoAtual,
                    mes: { [Sequelize.Op.lte]: mesAtual } // A soma é Somente até o mês atual
                }});
            const somaTtprcexe = await db.pjesgercota.sum('ttprcexe', {
                where: {
                    ano:anoAtual,
                    mes: { [Sequelize.Op.lte]: mesAtual },
                    operacao: {[Sequelize.Op.like]: 'PJES GOVERNO%'},
                }
            });
            const saldoCtRenPrcAnual = somaCtgeralinicialprc - somaTtprcexe;
            // FIM -  CONSULTA PARA TRAZER O REMANESCENTE DE PRAÇAS ANUAL



            // INICIO -  CONSULTA PARA TRAZER O TETO DE OFICIAIS E PRAÇAS DA TABELA tetopjes
            const ttgeralinicialofmes = await db.tetopjes.findOne({
                attributes: ['id', 'ctgeralinicialof', 'ctgeralinicialprc', 'mes', 'ano'],
                where: {
                    ano: anoAtual,
                    mes: { [Sequelize.Op.lte]: mesAtual } // A soma é Somente até o mês atual
                }});


            //---CALCULO TOTAL - PARTE SUPERIOR DA TELA PJES | INICIO
            const ctGeralInicialOf = ttgeralinicialofmes.ctgeralinicialof; //Passando os valores da consulta acima
            const ctGeralInicialPrc = ttgeralinicialofmes.ctgeralinicialprc; //Passando os valores da consulta acima
            const valorGeralInicial = ctGeralInicialOf*300 + ctGeralInicialPrc*200;

            const totalcotaOfDistGov = totalcotaOfDistUnidade;
            const totalcotaPrcDistGov = totalcotaPrcDistUnidade; 
            const totalcotaDistGov = totalcotaOfDistGov + totalcotaPrcDistGov;

            const totalcotaOfExeGov = totalcotaOfExeUnidade;
            const totalcotaPrcExeGov = totalcotaPrcExeUnidade; 
            const totalcotaExeGov = totalcotaOfExeGov + totalcotaPrcExeGov;

            const ctAtualOf = ctGeralInicialOf - totalcotaOfDistGov;
            const ctAtualPrc = ctGeralInicialPrc - totalcotaPrcDistGov;


            //TOTAL DE EVENTOS CADASTRADOS PARA A OME | COUNT
            const queryPjes = await db.pjes.count({
                where: {idome:[3, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33], mes, ano, },
            });


            function converterMesPTparaEN(nomeMesPT) {
                switch (nomeMesPT) {
                    case 'JAN':
                        return 'JAN';
                    case 'FEV':
                        return 'FEB';
                    case 'MAR':
                        return 'MAR';
                    case 'ABR':
                        return 'APR';
                    case 'MAI':
                        return 'MAY';
                    case 'JUN':
                        return 'JUN';
                    case 'JUL':
                        return 'JUL';
                    case 'AGO':
                        return 'AUG';
                    case 'SET':
                        return 'SEP';
                    case 'OUT':
                        return 'OCT';
                    case 'NOV':
                        return 'NOV';
                    case 'DEZ':
                        return 'DEC';
                    default:
                        return nomeMesPT;
                }
            }

            // BLOCO QUE CONTA A QUANTIDADE SERVIÇO EM EXCESSO DE OFICIAS E PRAÇAS
            const nomeMesConvertido = converterMesPTparaEN(nomeMes);

            const ttServExcessoOf = await db.escalas.findAll({
                attributes: [
                    'matricula',
                    [Sequelize.fn('SUM', Sequelize.col('ttcota')), 'count']
                ],
                where: {
                    data_inicio: {
                        [Op.and]: [
                            Sequelize.literal(`DATE_FORMAT(data_inicio, '%b') = '${nomeMesConvertido}'`),
                            Sequelize.literal(`YEAR(data_inicio) = ${nomeAno}`)
                        ]
                    },
                    pg: ['2º TEN', '1º TEN', 'CAP', 'MAJ', 'TC', 'CEL']
                },
                group: ['matricula'],
                having: Sequelize.literal('count > 12') // Condição para contar mais de 12 vezes
            });
            const ttServExcOf = ttServExcessoOf.length;
        
            // BLOCO QUE CONTA A QUANTIDADE SERVIÇO EM EXCESSO DE OFICIAS E PRAÇAS
            const ttServExcessoPrc = await db.escalas.findAll({
                attributes: [
                    'matricula',
                    [Sequelize.fn('SUM', Sequelize.col('ttcota')), 'count']
                ],
                where: {
                    data_inicio: {
                        [Op.and]: [
                            Sequelize.literal(`DATE_FORMAT(data_inicio, '%b') = '${nomeMesConvertido}'`),
                            Sequelize.literal(`YEAR(data_inicio) = ${nomeAno}`)
                        ]
                    },
                    pg: ['SD', 'CB', '3º SGT', '2º SGT', '1º SGT', 'ST']
                },
                group: ['matricula'],
                having: Sequelize.literal('count > 12') // Condição para contar mais de 12 vezes
            });
            const ttServExcPrc = ttServExcessoPrc.length;

            // MOSTRA O VALOR TOTAL DE EXCESSO DE OFICIAIS E PRAÇAS
            const valorttServExc = (parseFloat(ttServExcOf) * 300) + (parseFloat(ttServExcPrc) * 200);

            //TOTAL DE POLICIAIS IMPEDIDOS COM COTA NA OME | COUNT   
            const contagemImpedidos = await db.escalas.count({
                attributes: ['id','operacao', 'cod', 'nunfunc', 'pg', 'matricula', 'nome','telefone','status', 'modalidade', 'data_inicio', 'hora_inicio', 'data_fim', 'hora_fim', 'ome_sgpm', 'localap', 'anotacoes', 'idevento', 'idome', 'createdAt', 'updatedAt'],
                    where: Sequelize.literal(`
                        DATE_FORMAT(data_inicio, '%b') = '${nomeMesConvertido}' AND
                        YEAR(data_inicio) = ${nomeAno} AND
                        idome = ${3, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33} AND
                        status = 'IMPEDIDO'`),
            });
            

            // INICIO BLOCO QUE CONTA A QUANTIDADE REMANESCENTE DE OFICIAS E PRAÇAS
            const SequelizeRem = require('sequelize');
            const total_cotadistRen = await db.pjes.findAll({
                attributes: [
                    'id', 'operacao', 'evento', 'cotaofdist', 'cotaprcdist', 'mes', 'idome', 'iduser', 'obs',
                    [SequelizeRem.literal('SUM(cotaofdist)'), 'total_cotaofdist'],
                    [SequelizeRem.literal('SUM(cotaprcdist)'), 'total_cotaprcdist'],
                    [SequelizeRem.literal('SUM(cotaofdist) * 300'), 'total_cotaofdist_multiplicado'],
                    [SequelizeRem.literal('SUM(cotaprcdist) * 200'), 'total_cotaprcdist_multiplicado']
                ],
                where: { 
                    mes,
                    ano,
                    idome:[3, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33],
                    operacao: "PJES GOVERNO REMANESCENTE",
                },
                
                raw: true,
            });

            const valorCotaOfDistRen = parseFloat(total_cotadistRen[0]?.total_cotaofdist_multiplicado) || 0;
            const valorCotaPrcDistRen = parseFloat(total_cotadistRen[0]?.total_cotaprcdist_multiplicado) || 0;
            const totalcotaOfDistRen = valorCotaOfDistRen/300;
            const totalcotaPrcDistRen = valorCotaPrcDistRen/200;

            const totalFinalDistRen = valorCotaOfDistRen + valorCotaPrcDistRen;
        
                SaldoAnualOfGov = ctGeralInicialOf - totalcotaOfExeGov;
                SaldoAnualPrcGov = ctGeralInicialPrc - totalcotaPrcExeGov;
            // FIM BLOCO QUE CONTA A QUANTIDADE REMANESCENTE DE OFICIAS E PRAÇAS


            const user = await db.users.findOne({
                attributes: ['id', 'name', 'email', 'image', 'situationId', 'omeId', 'createdAt'],
                where: {
                    id: req.user.dataValues.id
                },
                include: [{
                    model: db.situations,
                    attributes: ['nameSituation']
                }]
            });


            // Consulta para obter os Pjes com inclusão da soma de escalas onde pg = 'ST' ou 'CB' e 'CEL' ou 'MAJ'
            await db.pjes.findAll({
                attributes: [
                    'id', 'operacao', 'evento', 'cotaofdist', 'cotaprcdist', 'mes', 'idome', 'iduser', 'obs',
                    // Subconsulta para contar pg = 'ST' ou 'CB'
                    [
                        Sequelize.literal(`(
                            SELECT SUM(ttcota)
                            FROM escalas 
                            WHERE escalas.idevento = pjes.id
                            AND (escalas.pg = 'ST' OR escalas.pg = '1º SGT'
                                OR escalas.pg = '2º SGT'  OR escalas.pg = '3º SGT' 
                                OR escalas.pg = 'CB'  OR escalas.pg = 'SD')
                        )`),
                        'count_pg_prc'
                    ],
                    // Subconsulta para contar pg = 'CEL' ou 'MAJ'
                    [
                        Sequelize.literal(`(
                            SELECT SUM(ttcota)
                            FROM escalas 
                            WHERE escalas.idevento = pjes.id
                            AND (escalas.pg = 'CEL' OR escalas.pg = 'TC'
                                OR escalas.pg = 'MAJ'  OR escalas.pg = 'CAP' 
                                OR escalas.pg = '1º TEN'  OR escalas.pg = '2º TEN')
                        )`),
                        'count_pg_of'
                    ]
                ],
                where: {
                    ano, mes, idome:[3, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33],
                },
                order: [['id', 'DESC']],
                include: [
                    { model: db.omes, attributes: ['nome'] },
                    { model: db.users, attributes: ['name'] }
                ],
                
            })
            .then((pjes) => {

                if (pjes.length !== 0) {
                    
                        res.render("unidade/unidadepjes/list", {
                        layout: 'main', profile: req.user.dataValues, user, nomeMes, nomeAno, sidebarSituations: true,
                        pjes: pjes.map(id => id.toJSON()),
                        valorFinalDistUnidade, valorFinalExeUnidade, saldoFinalUnidade, total_cotadistunidade, total_cotaexeunidade, totalcotaOfDistUnidade,
                        totalcotaPrcDistUnidade, totalcotaOfExeUnidade, totalcotaPrcExeUnidade,

                        valorFinalDistPe, valorFinalExePe, saldoFinalPe, total_cotadistpe,
                        total_cotaexepe, totalcotaOfDistPe, totalcotaPrcDistPe, totalcotaOfExePe,
                        totalcotaPrcExePe,

                        valorFinalDistTi, valorFinalExeTi, saldoFinalTi, total_cotadistti,
                        total_cotaexeti, totalcotaOfDistTi, totalcotaPrcDistTi, totalcotaOfExeTi,
                        totalcotaPrcExeTi,

                        valorFinalDistEnem, valorFinalExeEnem, saldoFinalEnem, total_cotadistenem,
                        total_cotaexeenem, totalcotaOfDistEnem, totalcotaPrcDistEnem, totalcotaOfExeEnem,
                        totalcotaPrcExeEnem,

                        totalcotaOfDistGeral, queryPjes, contagemImpedidos, totalcotaPrcDistGeral, saldocotaOfGeral, saldocotaPrcGeral,

                        ctAtualOf,ctAtualPrc, valorGeralInicial, ctGeralInicialOf, ctGeralInicialPrc, valorGeralInicial,
                        totalcotaDistGov, totalcotaExeGov, totalcotaOfDistGov, totalcotaPrcDistGov, totalcotaOfExeGov,
                        totalcotaPrcExeGov, ttServExcOf, ttServExcPrc, valorttServExc, totalFinalDistRen, totalcotaOfDistRen,
                        totalcotaPrcDistRen, SaldoAnualOfGov, SaldoAnualPrcGov, saldoCtRenOfAnual, saldoCtRenPrcAnual,

                        
                    });
                } else {
                    res.render("unidade/unidadepjes/list", {
                        layout: 'main', profile: req.user.dataValues, sidebarSituations: true, danger_msg: 'Erro: Nenhum Evento Cadastrado!'
                    });
                }

            })
            .catch(() => {
                res.render("unidade/unidadepjes/list", {
                    layout: 'main', profile: req.user.dataValues, sidebarSituations: true, danger_msg: 'Erro: Nenhum Evento Cadastrado!'
                });
            });


    } // FIM IF DIRESP -------------------------------------------------------------------------------------------------------------------------------------------


    // INICIO DINTER I ---------------------------------------------------------------------------------------------------------------------------------------------
    if (req.user.dataValues.omeId == 4){ 

        const countPjes = await db.pjes.count();
                
                if (countPjes === 0) {
                    return res.render("unidade/unidadepjes/list", { layout: 'main', profile: req.user.dataValues, sidebarSituations: true, danger_msg: 'Erro: Nenhum pjes encontrada!' });
                }

            //---UNIDADES | INICIO TABELA DE COTAS DISTRIBUIDAS-------------------------------------------------------------------------
                const Sequelize = require('sequelize');
                const total_cotadistunidade = await db.pjes.findAll({
                    attributes: [
                        'id', 'operacao', 'evento', 'cotaofdist', 'cotaprcdist', 'mes', 'idome', 'iduser', 'obs',
                        [Sequelize.literal('SUM(cotaofdist)'), 'total_cotaofdist'],
                        [Sequelize.literal('SUM(cotaprcdist)'), 'total_cotaprcdist'],
                        [Sequelize.literal('SUM(cotaofdist) * 300'), 'total_cotaofdist_multiplicado'],
                        [Sequelize.literal('SUM(cotaprcdist) * 200'), 'total_cotaprcdist_multiplicado']
                    ],
                    where: 
                        {
                            idome:[4, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49],
                            ano,
                            mes,
                            operacao: {
                                [Sequelize.Op.like]: 'PJES GOVERNO%'
                            },
                    },
                    include: [
                        { model: db.omes, attributes: ['nome'] },
                        { model: db.users, attributes: ['name'] }
                    ],
                    group: ['idome', 'ome.nome', 'user.name'],
                    raw: true,
                });

            //----UNIDADES | INICIO TABELA DE COTAS EXECUTADAS-------------------------------------------------------------------------
                const SequelizeExecut = require('sequelize');
                const total_cotaexeunidade = await db.pjesgercota.findAll({
                    attributes: [
                        'id', 'operacao', 'id_ome', 'ttofexe', 'ttprcexe', 'status', 'mes', 'ano', 'obs',
                        [SequelizeExecut.literal('SUM(ttofexe)'), 'total_cotaofexe'],
                        [SequelizeExecut.literal('SUM(ttprcexe)'), 'total_cotaprcexe'],
                        [SequelizeExecut.literal('SUM(ttofexe) * 300'), 'total_cotaofexe_multiplicado'],
                        [SequelizeExecut.literal('SUM(ttprcexe) * 200'), 'total_cotaprcexe_multiplicado']
                    ],
                    where: 
                        {id_ome:[4, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49],
                        ano,
                        mes,
                        operacao: {
                            [SequelizeExecut.Op.like]: 'PJES GOVERNO%'
                            },
                        },
                    include: [
                        { model: db.omes, attributes: ['nome'] },
                    ],
                    group: ['id_ome', 'ome.nome'],
                    raw: true,
                });


            //--- UNIDADES | INICIO CALCULAR OS VALORES TOTAIS POR UNIDADES-------------------------------------------------------------------------

                //VALOR FINAL DE COTAS DISTRIBUIDAS OFICIAIS UNIDADES
                const SequelizeDistUnidade = require('sequelize');
                const valorfinal_cotadistunidade = await db.pjes.findAll({
                    attributes: [
                        [SequelizeDistUnidade.literal('SUM(cotaofdist) * 300'), 'valor_cotaofdist_multiplicado'],
                        [SequelizeDistUnidade.literal('SUM(cotaprcdist) * 200'), 'valor_cotaprcdist_multiplicado']
                    ],
                    where: {
                            idome:[4, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49],
                            ano,
                            mes,
                            operacao: {
                                [SequelizeDistUnidade.Op.like]: 'PJES GOVERNO%'
                            },
                            
                    },
                    raw: true,
                });

                //VALOR DE COTAS EXECUTADAS OFICIAIS UNIDADES
                const SequelizeExecutUnidade = require('sequelize');
                const valorfinal_cotaexeunidade = await db.pjesgercota.findAll({
                    attributes: [
                        [SequelizeExecutUnidade.literal('SUM(ttofexe) * 300'), 'valor_cotaofexe_multiplicado'],
                        [SequelizeExecutUnidade.literal('SUM(ttprcexe) * 200'), 'valor_cotaprcexe_multiplicado']
                    ],
                    where: {
                            id_ome:[4, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49],
                            ano,
                            mes,
                            operacao: {
                                [SequelizeExecutUnidade.Op.like]: 'PJES GOVERNO%'
                            },
                    },
                    raw: true,
                });

            //---UNIDADES | INICIO CALCULAR OS VALORES E COTAS TOTAIS POR UNIDADES-------------------------------------------------------------------------

                // CALCULO DO VALOR DISTRIBUIDO
                const valorCotaOfDistUnidade = parseFloat(valorfinal_cotadistunidade[0]?.valor_cotaofdist_multiplicado) || 0;
                const valorCotaPrcDistUnidade = parseFloat(valorfinal_cotadistunidade[0]?.valor_cotaprcdist_multiplicado) || 0;
                const valorFinalDistUnidade = valorCotaOfDistUnidade + valorCotaPrcDistUnidade;

                // CALCULO DO TOTAL DE COTAS DISTRIBUIDAS
                const totalcotaOfDistUnidade = valorCotaOfDistUnidade/300;
                const totalcotaPrcDistUnidade = valorCotaPrcDistUnidade/200;


                // CALCULO DO VALOR EXECUTADO
                const valorCotaOfExeUnidade = parseFloat(valorfinal_cotaexeunidade[0]?.valor_cotaofexe_multiplicado) || 0;
                const valorCotaPrcExeUnidade = parseFloat(valorfinal_cotaexeunidade[0]?.valor_cotaprcexe_multiplicado) || 0;
                const valorFinalExeUnidade = valorCotaOfExeUnidade + valorCotaPrcExeUnidade;

                // CALCULO DO TOTAL DE COTAS EXECUTADAS
                const totalcotaOfExeUnidade = valorCotaOfExeUnidade/300;
                const totalcotaPrcExeUnidade = valorCotaPrcExeUnidade/200;

                // CALCULO DO SALDO FINAL
                const saldoFinalUnidade = valorFinalDistUnidade-valorFinalExeUnidade;

            //---UNIDADES | FIM CALCULAR OS VALORES E COTAS TOTAIS POR DIRETORIA-------------------------------------------------------------------------


            //---PE | INICIO

        //---PE | INICIO TABELA DE COTAS DISTRIBUIDAS-------------------------------------------------------------------------
                const Sequelizepe = require('sequelize');
                const total_cotadistpe = await db.pjes.findAll({
                    attributes: [
                        'id', 'operacao', 'evento', 'cotaofdist', 'cotaprcdist', 'mes', 'idome', 'iduser', 'obs',
                        [Sequelizepe.literal('SUM(cotaofdist)'), 'total_cotaofdist'],
                        [Sequelizepe.literal('SUM(cotaprcdist)'), 'total_cotaprcdist'],
                        [Sequelizepe.literal('SUM(cotaofdist) * 300'), 'total_cotaofdist_multiplicado'],
                        [Sequelizepe.literal('SUM(cotaprcdist) * 200'), 'total_cotaprcdist_multiplicado']
                    ],
                    where: 
                        {
                        idome:[4, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49],
                        mes,
                        ano,
                        operacao: "PJES PATRULHA ESCOLAR",
                    },
                    include: [
                        { model: db.omes, attributes: ['nome'] },
                        { model: db.users, attributes: ['name'] }
                    ],
                    group: ['idome', 'ome.nome', 'user.name'],
                    raw: true,
                });

            //----PE | INICIO TABELA DE COTAS EXECUTADAS-------------------------------------------------------------------------
                const SequelizeExecutpe = require('sequelize');
                const total_cotaexepe = await db.pjesgercota.findAll({
                    attributes: [
                        'id', 'operacao', 'id_ome', 'ttofexe', 'ttprcexe', 'status', 'mes', 'ano', 'obs',
                        [SequelizeExecutpe.literal('SUM(ttofexe)'), 'total_cotaofexe'],
                        [SequelizeExecutpe.literal('SUM(ttprcexe)'), 'total_cotaprcexe'],
                        [SequelizeExecutpe.literal('SUM(ttofexe) * 300'), 'total_cotaofexe_multiplicado'],
                        [SequelizeExecutpe.literal('SUM(ttprcexe) * 200'), 'total_cotaprcexe_multiplicado']
                    ],
                    where: 
                        {
                        id_ome:[4, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49],
                        mes,
                        ano,
                        operacao: "PJES PATRULHA ESCOLAR",
                        },
                    include: [
                        { model: db.omes, attributes: ['nome'] },
                    ],
                    group: ['id_ome', 'ome.nome'],
                    raw: true,
                });

            //--- PE | INICIO CALCULAR OS VALORES TOTAIS POR DIRETORIA-------------------------------------------------------------------------

            //VALOR FINAL DE COTAS DISTRIBUIDAS OFICIAIS PE
                const SequelizeDistPe = require('sequelize');
                const valorfinal_cotadistpe = await db.pjes.findAll({
                    attributes: [
                        [SequelizeDistPe.literal('SUM(cotaofdist) * 300'), 'valor_cotaofdist_multiplicado'],
                        [SequelizeDistPe.literal('SUM(cotaprcdist) * 200'), 'valor_cotaprcdist_multiplicado']
                    ],
                    where: {
                            idome:[4, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49],
                            mes,
                            ano,
                            operacao: "PJES PATRULHA ESCOLAR",
                    },
                    raw: true,
                });

            //VALOR DE COTAS EXECUTADAS OFICIAIS PE
                const SequelizeExecutPe = require('sequelize');
                const valorfinal_cotaexepe = await db.pjesgercota.findAll({
                    attributes: [
                        [SequelizeExecutPe.literal('SUM(ttofexe) * 300'), 'valor_cotaofexe_multiplicado'],
                        [SequelizeExecutPe.literal('SUM(ttprcexe) * 200'), 'valor_cotaprcexe_multiplicado']
                    ],
                    where: {
                            id_ome:[4, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49],
                            mes,
                            ano,
                            operacao: "PJES PATRULHA ESCOLAR",
                    },
                    raw: true,
                });

            //---PE | INICIO CALCULAR OS VALORES E COTAS TOTAIS POR DIRETORIA-------------------------------------------------------------------------

            // CALCULO DO VALOR DISTRIBUIDO
                const valorCotaOfDistPe = parseFloat(valorfinal_cotadistpe[0]?.valor_cotaofdist_multiplicado) || 0;
                const valorCotaPrcDistPe = parseFloat(valorfinal_cotadistpe[0]?.valor_cotaprcdist_multiplicado) || 0;
                const valorFinalDistPe = valorCotaOfDistPe + valorCotaPrcDistPe;

            // CALCULO DO TOTAL DE COTAS DISTRIBUIDAS
                const totalcotaOfDistPe = valorCotaOfDistPe/300;
                const totalcotaPrcDistPe = valorCotaPrcDistPe/200;


            // CALCULO DO VALOR EXECUTADO
                const valorCotaOfExePe = parseFloat(valorfinal_cotaexepe[0]?.valor_cotaofexe_multiplicado) || 0;
                const valorCotaPrcExePe = parseFloat(valorfinal_cotaexepe[0]?.valor_cotaprcexe_multiplicado) || 0;
                const valorFinalExePe = valorCotaOfExePe + valorCotaPrcExePe;

            // CALCULO DO TOTAL DE COTAS EXECUTADAS
                const totalcotaOfExePe = valorCotaOfExePe/300;
                const totalcotaPrcExePe = valorCotaPrcExePe/200;

            // CALCULO DO SALDO FINAL
                const saldoFinalPe = valorFinalDistPe-valorFinalExePe;

        //---PE | FIM CALCULAR OS VALORES E COTAS TOTAIS POR DIRETORIA-------------------------------------------------------------------------

    //---PE | FIM

    //---TI | INICIO

                //---TI | INICIO TABELA DE COTAS DISTRIBUIDAS-------------------------------------------------------------------------
                const Sequelizeti = require('sequelize');
                const total_cotadistti = await db.pjes.findAll({
                    attributes: [
                        'id', 'operacao', 'evento', 'cotaofdist', 'cotaprcdist', 'mes', 'idome', 'iduser', 'obs',
                        [Sequelizeti.literal('SUM(cotaofdist)'), 'total_cotaofdist'],
                        [Sequelizeti.literal('SUM(cotaprcdist)'), 'total_cotaprcdist'],
                        [Sequelizeti.literal('SUM(cotaofdist) * 300'), 'total_cotaofdist_multiplicado'],
                        [Sequelizeti.literal('SUM(cotaprcdist) * 200'), 'total_cotaprcdist_multiplicado']
                    ],
                    where: 
                        {
                        idome:[4, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49],
                        mes,
                        ano,
                        operacao: "PJES CTM (BRT)",
                    },
                    include: [
                        { model: db.omes, attributes: ['nome'] },
                        { model: db.users, attributes: ['name'] }
                    ],
                    group: ['idome', 'ome.nome', 'user.name'],
                    raw: true,
                });

            //----TI | INICIO TABELA DE COTAS EXECUTADAS-------------------------------------------------------------------------
                const SequelizeExecutti = require('sequelize');
                const total_cotaexeti = await db.pjesgercota.findAll({
                    attributes: [
                        'id', 'operacao', 'id_ome', 'ttofexe', 'ttprcexe', 'status', 'mes', 'ano', 'obs',
                        [SequelizeExecutti.literal('SUM(ttofexe)'), 'total_cotaofexe'],
                        [SequelizeExecutti.literal('SUM(ttprcexe)'), 'total_cotaprcexe'],
                        [SequelizeExecutti.literal('SUM(ttofexe) * 300'), 'total_cotaofexe_multiplicado'],
                        [SequelizeExecutti.literal('SUM(ttprcexe) * 200'), 'total_cotaprcexe_multiplicado']
                    ],
                    where: 
                        {
                        id_ome:[4, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49],
                        mes,
                        ano,
                        operacao: "PJES CTM (BRT)",
                        },
                    include: [
                        { model: db.omes, attributes: ['nome'] },
                    ],
                    group: ['id_ome', 'ome.nome'],
                    raw: true,
                });

            //--- TI | INICIO CALCULAR OS VALORES TOTAIS POR DIRETORIA-------------------------------------------------------------------------

            //VALOR FINAL DE COTAS DISTRIBUIDAS OFICIAIS PE
                const SequelizeDistTi = require('sequelize');
                const valorfinal_cotadistti = await db.pjes.findAll({
                    attributes: [
                        [SequelizeDistTi.literal('SUM(cotaofdist) * 300'), 'valor_cotaofdist_multiplicado'],
                        [SequelizeDistTi.literal('SUM(cotaprcdist) * 200'), 'valor_cotaprcdist_multiplicado']
                    ],
                    where: {
                            idome:[4, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49],
                            mes,
                            ano,
                            operacao: "PJES CTM (BRT)",
                    },
                    raw: true,
                });

            //VALOR DE COTAS EXECUTADAS OFICIAIS TI
                const SequelizeExecutTi = require('sequelize');
                const valorfinal_cotaexeti = await db.pjesgercota.findAll({
                    attributes: [
                        [SequelizeExecutTi.literal('SUM(ttofexe) * 300'), 'valor_cotaofexe_multiplicado'],
                        [SequelizeExecutTi.literal('SUM(ttprcexe) * 200'), 'valor_cotaprcexe_multiplicado']
                    ],
                    where: {
                            id_ome:[4, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49],
                            mes,
                            ano,
                            operacao: "PJES CTM (BRT)",
                    },
                    raw: true,
                });

            //---TI | INICIO CALCULAR OS VALORES E COTAS TOTAIS POR DIRETORIA-------------------------------------------------------------------------

            // CALCULO DO VALOR DISTRIBUIDO
                const valorCotaOfDistTi = parseFloat(valorfinal_cotadistti[0]?.valor_cotaofdist_multiplicado) || 0;
                const valorCotaPrcDistTi = parseFloat(valorfinal_cotadistti[0]?.valor_cotaprcdist_multiplicado) || 0;
                const valorFinalDistTi = valorCotaOfDistTi + valorCotaPrcDistTi;

            // CALCULO DO TOTAL DE COTAS DISTRIBUIDAS
                const totalcotaOfDistTi = valorCotaOfDistTi/300;
                const totalcotaPrcDistTi = valorCotaPrcDistTi/200;


            // CALCULO DO VALOR EXECUTADO
                const valorCotaOfExeTi = parseFloat(valorfinal_cotaexeti[0]?.valor_cotaofexe_multiplicado) || 0;
                const valorCotaPrcExeTi = parseFloat(valorfinal_cotaexeti[0]?.valor_cotaprcexe_multiplicado) || 0;
                const valorFinalExeTi = valorCotaOfExeTi + valorCotaPrcExeTi;

            // CALCULO DO TOTAL DE COTAS EXECUTADAS
                const totalcotaOfExeTi = valorCotaOfExeTi/300;
                const totalcotaPrcExeTi = valorCotaPrcExeTi/200;

            // CALCULO DO SALDO FINAL
                const saldoFinalTi = valorFinalDistTi-valorFinalExeTi;

            //---TI | FIM CALCULAR OS VALORES E COTAS TOTAIS POR DIRETORIA-------------------------------------------------------------------------

    //---TI | FIM

    //---ENEM | INICIO

                //---ENEM | INICIO TABELA DE COTAS DISTRIBUIDAS-------------------------------------------------------------------------
                const Sequelizeenem = require('sequelize');
                const total_cotadistenem = await db.pjes.findAll({
                    attributes: [
                        'id', 'operacao', 'evento', 'cotaofdist', 'cotaprcdist', 'mes', 'idome', 'iduser', 'obs',
                        [Sequelizeenem.literal('SUM(cotaofdist)'), 'total_cotaofdist'],
                        [Sequelizeenem.literal('SUM(cotaprcdist)'), 'total_cotaprcdist'],
                        [Sequelizeenem.literal('SUM(cotaofdist) * 300'), 'total_cotaofdist_multiplicado'],
                        [Sequelizeenem.literal('SUM(cotaprcdist) * 200'), 'total_cotaprcdist_multiplicado']
                    ],
                    where: 
                        {
                        idome:[4, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49],
                        mes,
                        ano,
                        operacao: "PJES OP ENEM",
                    },
                    include: [
                        { model: db.omes, attributes: ['nome'] },
                        { model: db.users, attributes: ['name'] }
                    ],
                    group: ['idome', 'ome.nome', 'user.name'],
                    raw: true,
                });

            //----ENEM | INICIO TABELA DE COTAS EXECUTADAS-------------------------------------------------------------------------
                const SequelizeExecutenem = require('sequelize');
                const total_cotaexeenem = await db.pjesgercota.findAll({
                    attributes: [
                        'id', 'operacao', 'id_ome', 'ttofexe', 'ttprcexe', 'status', 'mes', 'ano', 'obs',
                        [SequelizeExecutenem.literal('SUM(ttofexe)'), 'total_cotaofexe'],
                        [SequelizeExecutenem.literal('SUM(ttprcexe)'), 'total_cotaprcexe'],
                        [SequelizeExecutenem.literal('SUM(ttofexe) * 300'), 'total_cotaofexe_multiplicado'],
                        [SequelizeExecutenem.literal('SUM(ttprcexe) * 200'), 'total_cotaprcexe_multiplicado']
                    ],
                    where: 
                        {
                        id_ome:[4, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49],
                        mes,
                        ano,
                        operacao: "PJES OP ENEM",
                        },
                    include: [
                        { model: db.omes, attributes: ['nome'] },
                    ],
                    group: ['id_ome', 'ome.nome'],
                    raw: true,
                });

            //--- ENEM | INICIO CALCULAR OS VALORES TOTAIS POR DIRETORIA-------------------------------------------------------------------------

            //VALOR FINAL DE COTAS DISTRIBUIDAS OFICIAIS ENEM
                const SequelizeDistEnem = require('sequelize');
                const valorfinal_cotadistenem = await db.pjes.findAll({
                    attributes: [
                        [SequelizeDistEnem.literal('SUM(cotaofdist) * 300'), 'valor_cotaofdist_multiplicado'],
                        [SequelizeDistEnem.literal('SUM(cotaprcdist) * 200'), 'valor_cotaprcdist_multiplicado']
                    ],
                    where: {
                            idome:[4, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49],
                            mes,
                            ano,
                            operacao: "PJES OP ENEM",
                    },
                    raw: true,
                });

            //VALOR DE COTAS EXECUTADAS OFICIAIS ENEM
                const SequelizeExecutEnem = require('sequelize');
                const valorfinal_cotaexeenem = await db.pjesgercota.findAll({
                    attributes: [
                        [SequelizeExecutEnem.literal('SUM(ttofexe) * 300'), 'valor_cotaofexe_multiplicado'],
                        [SequelizeExecutEnem.literal('SUM(ttprcexe) * 200'), 'valor_cotaprcexe_multiplicado']
                    ],
                    where: {
                            id_ome:[4, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49],
                            mes,
                            ano,
                            operacao: "PJES OP ENEM",
                    },
                    raw: true,
                });

            //---ENEM | INICIO CALCULAR OS VALORES E COTAS TOTAIS POR DIRETORIA-------------------------------------------------------------------------

            // CALCULO DO VALOR DISTRIBUIDO
                const valorCotaOfDistEnem = parseFloat(valorfinal_cotadistenem[0]?.valor_cotaofdist_multiplicado) || 0;
                const valorCotaPrcDistEnem = parseFloat(valorfinal_cotadistenem[0]?.valor_cotaprcdist_multiplicado) || 0;
                const valorFinalDistEnem = valorCotaOfDistTi + valorCotaPrcDistEnem;

            // CALCULO DO TOTAL DE COTAS DISTRIBUIDAS
                const totalcotaOfDistEnem = valorCotaOfDistEnem/300;
                const totalcotaPrcDistEnem = valorCotaPrcDistEnem/200;


            // CALCULO DO VALOR EXECUTADO
                const valorCotaOfExeEnem = parseFloat(valorfinal_cotaexeenem[0]?.valor_cotaofexe_multiplicado) || 0;
                const valorCotaPrcExeEnem = parseFloat(valorfinal_cotaexeenem[0]?.valor_cotaprcexe_multiplicado) || 0;
                const valorFinalExeEnem = valorCotaOfExeEnem + valorCotaPrcExeEnem;

            // CALCULO DO TOTAL DE COTAS EXECUTADAS
                const totalcotaOfExeEnem = valorCotaOfExeEnem/300;
                const totalcotaPrcExeEnem = valorCotaPrcExeEnem/200;

            // CALCULO DO SALDO FINAL
                const saldoFinalEnem = valorFinalDistEnem-valorFinalExeEnem;

            //---ENEM | FIM CALCULAR OS VALORES E COTAS TOTAIS POR DIRETORIA-------------------------------------------------------------------------

    //---ENEM | FIM



            // CALCULAR O SALDO GERAL DE COTAS PARA A UNIDADE

            function converterMesPTparaEN(nomeMesPT) {
                switch (nomeMesPT) {
                    case 'JAN':
                        return 'JAN';
                    case 'FEV':
                        return 'FEB';
                    case 'MAR':
                        return 'MAR';
                    case 'ABR':
                        return 'APR';
                    case 'MAI':
                        return 'MAY';
                    case 'JUN':
                        return 'JUN';
                    case 'JUL':
                        return 'JUL';
                    case 'AGO':
                        return 'AUG';
                    case 'SET':
                        return 'SEP';
                    case 'OUT':
                        return 'OCT';
                    case 'NOV':
                        return 'NOV';
                    case 'DEZ':
                        return 'DEC';
                    default:
                        return nomeMesPT;
                }
            }


            // BLOCO QUE CONTA A QUANTIDADE SERVIÇO EM EXCESSO DE OFICIAS E PRAÇAS
            const nomeMesConvert = converterMesPTparaEN(nomeMes);
            const ttServOf = await db.escalas.findAll({
                attributes: [
                    'matricula',
                    [Sequelize.fn('SUM', Sequelize.col('ttcota')), 'count']
                ],
                where: {
                    data_inicio: {
                        [Op.and]: [
                            Sequelize.literal(`DATE_FORMAT(data_inicio, '%b') = '${nomeMesConvert}'`),
                            Sequelize.literal(`YEAR(data_inicio) = ${nomeAno}`)
                        ]
                    },
                    pg: ['2º TEN', '1º TEN', 'CAP', 'MAJ', 'TC', 'CEL'],
                    idome:[4, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49],
                },
                group: ['matricula'],
                
            });
            const ttServicoOf = ttServOf.length;

            
            // BLOCO QUE CONTA A QUANTIDADE SERVIÇO EM EXCESSO DE OFICIAS E PRAÇAS
            const ttServPrc = await db.escalas.findAll({
                attributes: [
                    'matricula',
                    [Sequelize.fn('SUM', Sequelize.col('ttcota')), 'count']
                ],
                where: {
                    data_inicio: {
                        [Op.and]: [
                            Sequelize.literal(`DATE_FORMAT(data_inicio, '%b') = '${nomeMesConvert}'`),
                            Sequelize.literal(`YEAR(data_inicio) = ${nomeAno}`)
                        ]
                    },
                    pg: ['SD', 'CB', '3º SGT', '2º SGT', '1º SGT', 'ST'],
                    idome:[4, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49],
                },
                group: ['matricula'],
                
            });
            const ttServicoPrc = ttServPrc.length;

            const totalcotaOfDistGeral = totalcotaOfDistUnidade + totalcotaOfDistPe + totalcotaOfDistTi + totalcotaOfDistEnem;
            const totalcotaPrcDistGeral = totalcotaPrcDistUnidade + totalcotaPrcDistPe + totalcotaPrcDistTi + totalcotaPrcDistEnem;

            const saldocotaOfGeral = totalcotaOfDistGeral - ttServicoOf;
            const saldocotaPrcGeral = totalcotaPrcDistGeral - ttServicoPrc;



            // INICIO -  CONSULTA PARA TRAZER O REMANESCENTE DE OFICIAIS ANUAL
            const dataAtual = new Date();
            const anoAtual = dataAtual.getFullYear();
            const mesAtual = dataAtual.getMonth() + 1; // Mês atual (janeiro é 0, fevereiro é 1, ..., dezembro é 11)

            const somaCtgeralinicialof = await db.tetopjes.sum('ctgeralinicialof', {
                where: {
                    ano: anoAtual,
                    mes: {[Sequelize.Op.lte]: mesAtual},
                }
            });
            
            const somaTtofexe = await db.pjesgercota.sum('ttofexe', {
                    where: {
                        ano: anoAtual,
                        mes: {[Sequelize.Op.lte]: mesAtual},
                        operacao: {[Sequelize.Op.like]: 'PJES GOVERNO%'}
                    }
                });

            const saldoCtRenOfAnual = somaCtgeralinicialof - somaTtofexe;
            // FIM -  CONSULTA PARA TRAZER O REMANESCENTE DE OFICIAIS ANUAL
            

            // INICIO -  CONSULTA PARA TRAZER O REMANESCENTE DE PRAÇAS ANUAL
            const somaCtgeralinicialprc = await db.tetopjes.sum('ctgeralinicialprc', {
                where: {
                    ano: anoAtual,
                    mes: { [Sequelize.Op.lte]: mesAtual } // A soma é Somente até o mês atual
                }});
            const somaTtprcexe = await db.pjesgercota.sum('ttprcexe', {
                where: {
                    ano:anoAtual,
                    mes: { [Sequelize.Op.lte]: mesAtual },
                    operacao: {[Sequelize.Op.like]: 'PJES GOVERNO%'},
                }
            });
            const saldoCtRenPrcAnual = somaCtgeralinicialprc - somaTtprcexe;
            // FIM -  CONSULTA PARA TRAZER O REMANESCENTE DE PRAÇAS ANUAL



            // INICIO -  CONSULTA PARA TRAZER O TETO DE OFICIAIS E PRAÇAS DA TABELA tetopjes
            const ttgeralinicialofmes = await db.tetopjes.findOne({
                attributes: ['id', 'ctgeralinicialof', 'ctgeralinicialprc', 'mes', 'ano'],
                where: {
                    ano: anoAtual,
                    mes: { [Sequelize.Op.lte]: mesAtual } // A soma é Somente até o mês atual
                }});


            //---CALCULO TOTAL - PARTE SUPERIOR DA TELA PJES | INICIO
            const ctGeralInicialOf = ttgeralinicialofmes.ctgeralinicialof; //Passando os valores da consulta acima
            const ctGeralInicialPrc = ttgeralinicialofmes.ctgeralinicialprc; //Passando os valores da consulta acima
            const valorGeralInicial = ctGeralInicialOf*300 + ctGeralInicialPrc*200;

            const totalcotaOfDistGov = totalcotaOfDistUnidade;
            const totalcotaPrcDistGov = totalcotaPrcDistUnidade; 
            const totalcotaDistGov = totalcotaOfDistGov + totalcotaPrcDistGov;

            const totalcotaOfExeGov = totalcotaOfExeUnidade;
            const totalcotaPrcExeGov = totalcotaPrcExeUnidade; 
            const totalcotaExeGov = totalcotaOfExeGov + totalcotaPrcExeGov;

            const ctAtualOf = ctGeralInicialOf - totalcotaOfDistGov;
            const ctAtualPrc = ctGeralInicialPrc - totalcotaPrcDistGov;


            //TOTAL DE EVENTOS CADASTRADOS PARA A OME | COUNT
            const queryPjes = await db.pjes.count({
                where: {idome:[4, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49], mes, ano, },
            });


            function converterMesPTparaEN(nomeMesPT) {
                switch (nomeMesPT) {
                    case 'JAN':
                        return 'JAN';
                    case 'FEV':
                        return 'FEB';
                    case 'MAR':
                        return 'MAR';
                    case 'ABR':
                        return 'APR';
                    case 'MAI':
                        return 'MAY';
                    case 'JUN':
                        return 'JUN';
                    case 'JUL':
                        return 'JUL';
                    case 'AGO':
                        return 'AUG';
                    case 'SET':
                        return 'SEP';
                    case 'OUT':
                        return 'OCT';
                    case 'NOV':
                        return 'NOV';
                    case 'DEZ':
                        return 'DEC';
                    default:
                        return nomeMesPT;
                }
            }

            // BLOCO QUE CONTA A QUANTIDADE SERVIÇO EM EXCESSO DE OFICIAS E PRAÇAS
            const nomeMesConvertido = converterMesPTparaEN(nomeMes);

            const ttServExcessoOf = await db.escalas.findAll({
                attributes: [
                    'matricula',
                    [Sequelize.fn('SUM', Sequelize.col('ttcota')), 'count']
                ],
                where: {
                    data_inicio: {
                        [Op.and]: [
                            Sequelize.literal(`DATE_FORMAT(data_inicio, '%b') = '${nomeMesConvertido}'`),
                            Sequelize.literal(`YEAR(data_inicio) = ${nomeAno}`)
                        ]
                    },
                    pg: ['2º TEN', '1º TEN', 'CAP', 'MAJ', 'TC', 'CEL']
                },
                group: ['matricula'],
                having: Sequelize.literal('count > 12') // Condição para contar mais de 12 vezes
            });
            const ttServExcOf = ttServExcessoOf.length;
        
            // BLOCO QUE CONTA A QUANTIDADE SERVIÇO EM EXCESSO DE OFICIAS E PRAÇAS
            const ttServExcessoPrc = await db.escalas.findAll({
                attributes: [
                    'matricula',
                    [Sequelize.fn('SUM', Sequelize.col('ttcota')), 'count']
                ],
                where: {
                    data_inicio: {
                        [Op.and]: [
                            Sequelize.literal(`DATE_FORMAT(data_inicio, '%b') = '${nomeMesConvertido}'`),
                            Sequelize.literal(`YEAR(data_inicio) = ${nomeAno}`)
                        ]
                    },
                    pg: ['SD', 'CB', '3º SGT', '2º SGT', '1º SGT', 'ST']
                },
                group: ['matricula'],
                having: Sequelize.literal('count > 12') // Condição para contar mais de 12 vezes
            });
            const ttServExcPrc = ttServExcessoPrc.length;

            // MOSTRA O VALOR TOTAL DE EXCESSO DE OFICIAIS E PRAÇAS
            const valorttServExc = (parseFloat(ttServExcOf) * 300) + (parseFloat(ttServExcPrc) * 200);

            //TOTAL DE POLICIAIS IMPEDIDOS COM COTA NA OME | COUNT   
            const contagemImpedidos = await db.escalas.count({
                attributes: ['id','operacao', 'cod', 'nunfunc', 'pg', 'matricula', 'nome','telefone','status', 'modalidade', 'data_inicio', 'hora_inicio', 'data_fim', 'hora_fim', 'ome_sgpm', 'localap', 'anotacoes', 'idevento', 'idome', 'createdAt', 'updatedAt'],
                    where: Sequelize.literal(`
                        DATE_FORMAT(data_inicio, '%b') = '${nomeMesConvertido}' AND
                        YEAR(data_inicio) = ${nomeAno} AND
                        idome = ${4, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49} AND
                        status = 'IMPEDIDO'`),
            });
            

            // INICIO BLOCO QUE CONTA A QUANTIDADE REMANESCENTE DE OFICIAS E PRAÇAS
            const SequelizeRem = require('sequelize');
            const total_cotadistRen = await db.pjes.findAll({
                attributes: [
                    'id', 'operacao', 'evento', 'cotaofdist', 'cotaprcdist', 'mes', 'idome', 'iduser', 'obs',
                    [SequelizeRem.literal('SUM(cotaofdist)'), 'total_cotaofdist'],
                    [SequelizeRem.literal('SUM(cotaprcdist)'), 'total_cotaprcdist'],
                    [SequelizeRem.literal('SUM(cotaofdist) * 300'), 'total_cotaofdist_multiplicado'],
                    [SequelizeRem.literal('SUM(cotaprcdist) * 200'), 'total_cotaprcdist_multiplicado']
                ],
                where: { 
                    mes,
                    ano,
                    idome:[4, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49],
                    operacao: "PJES GOVERNO REMANESCENTE",
                },
                
                raw: true,
            });

            const valorCotaOfDistRen = parseFloat(total_cotadistRen[0]?.total_cotaofdist_multiplicado) || 0;
            const valorCotaPrcDistRen = parseFloat(total_cotadistRen[0]?.total_cotaprcdist_multiplicado) || 0;
            const totalcotaOfDistRen = valorCotaOfDistRen/300;
            const totalcotaPrcDistRen = valorCotaPrcDistRen/200;

            const totalFinalDistRen = valorCotaOfDistRen + valorCotaPrcDistRen;
        
                SaldoAnualOfGov = ctGeralInicialOf - totalcotaOfExeGov;
                SaldoAnualPrcGov = ctGeralInicialPrc - totalcotaPrcExeGov;
            // FIM BLOCO QUE CONTA A QUANTIDADE REMANESCENTE DE OFICIAS E PRAÇAS


            const user = await db.users.findOne({
                attributes: ['id', 'name', 'email', 'image', 'situationId', 'omeId', 'createdAt'],
                where: {
                    id: req.user.dataValues.id
                },
                include: [{
                    model: db.situations,
                    attributes: ['nameSituation']
                }]
            });


            // Consulta para obter os Pjes com inclusão da soma de escalas onde pg = 'ST' ou 'CB' e 'CEL' ou 'MAJ'
            await db.pjes.findAll({
                attributes: [
                    'id', 'operacao', 'evento', 'cotaofdist', 'cotaprcdist', 'mes', 'idome', 'iduser', 'obs',
                    // Subconsulta para contar pg = 'ST' ou 'CB'
                    [
                        Sequelize.literal(`(
                            SELECT SUM(ttcota)
                            FROM escalas 
                            WHERE escalas.idevento = pjes.id
                            AND (escalas.pg = 'ST' OR escalas.pg = '1º SGT'
                                OR escalas.pg = '2º SGT'  OR escalas.pg = '3º SGT' 
                                OR escalas.pg = 'CB'  OR escalas.pg = 'SD')
                        )`),
                        'count_pg_prc'
                    ],
                    // Subconsulta para contar pg = 'CEL' ou 'MAJ'
                    [
                        Sequelize.literal(`(
                            SELECT SUM(ttcota)
                            FROM escalas 
                            WHERE escalas.idevento = pjes.id
                            AND (escalas.pg = 'CEL' OR escalas.pg = 'TC'
                                OR escalas.pg = 'MAJ'  OR escalas.pg = 'CAP' 
                                OR escalas.pg = '1º TEN'  OR escalas.pg = '2º TEN')
                        )`),
                        'count_pg_of'
                    ]
                ],
                where: {
                    ano, mes, idome:[4, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49],
                },
                order: [['id', 'DESC']],
                include: [
                    { model: db.omes, attributes: ['nome'] },
                    { model: db.users, attributes: ['name'] }
                ],
                
            })
            .then((pjes) => {

                if (pjes.length !== 0) {
                    
                        res.render("unidade/unidadepjes/list", {
                        layout: 'main', profile: req.user.dataValues, user, nomeMes, nomeAno, sidebarSituations: true,
                        pjes: pjes.map(id => id.toJSON()),
                        valorFinalDistUnidade, valorFinalExeUnidade, saldoFinalUnidade, total_cotadistunidade, total_cotaexeunidade, totalcotaOfDistUnidade,
                        totalcotaPrcDistUnidade, totalcotaOfExeUnidade, totalcotaPrcExeUnidade,

                        valorFinalDistPe, valorFinalExePe, saldoFinalPe, total_cotadistpe,
                        total_cotaexepe, totalcotaOfDistPe, totalcotaPrcDistPe, totalcotaOfExePe,
                        totalcotaPrcExePe,

                        valorFinalDistTi, valorFinalExeTi, saldoFinalTi, total_cotadistti,
                        total_cotaexeti, totalcotaOfDistTi, totalcotaPrcDistTi, totalcotaOfExeTi,
                        totalcotaPrcExeTi,

                        valorFinalDistEnem, valorFinalExeEnem, saldoFinalEnem, total_cotadistenem,
                        total_cotaexeenem, totalcotaOfDistEnem, totalcotaPrcDistEnem, totalcotaOfExeEnem,
                        totalcotaPrcExeEnem,

                        totalcotaOfDistGeral, queryPjes, contagemImpedidos, totalcotaPrcDistGeral, saldocotaOfGeral, saldocotaPrcGeral,

                        ctAtualOf,ctAtualPrc, valorGeralInicial, ctGeralInicialOf, ctGeralInicialPrc, valorGeralInicial,
                        totalcotaDistGov, totalcotaExeGov, totalcotaOfDistGov, totalcotaPrcDistGov, totalcotaOfExeGov,
                        totalcotaPrcExeGov, ttServExcOf, ttServExcPrc, valorttServExc, totalFinalDistRen, totalcotaOfDistRen,
                        totalcotaPrcDistRen, SaldoAnualOfGov, SaldoAnualPrcGov, saldoCtRenOfAnual, saldoCtRenPrcAnual,

                        
                    });
                } else {
                    res.render("unidade/unidadepjes/list", {
                        layout: 'main', profile: req.user.dataValues, sidebarSituations: true, danger_msg: 'Erro: Nenhum Evento Cadastrado!'
                    });
                }

            })
            .catch(() => {
                res.render("unidade/unidadepjes/list", {
                    layout: 'main', profile: req.user.dataValues, sidebarSituations: true, danger_msg: 'Erro: Nenhum Evento Cadastrado!'
                });
            });


    } // FIM IF DINTER I -------------------------------------------------------------------------------------------------------------------------------------------


    // INICIO DINTER II ---------------------------------------------------------------------------------------------------------------------------------------------
    if (req.user.dataValues.omeId == 5){ 

        const countPjes = await db.pjes.count();
                
                if (countPjes === 0) {
                    return res.render("unidade/unidadepjes/list", { layout: 'main', profile: req.user.dataValues, sidebarSituations: true, danger_msg: 'Erro: Nenhum pjes encontrada!' });
                }

            //---UNIDADES | INICIO TABELA DE COTAS DISTRIBUIDAS-------------------------------------------------------------------------
                const Sequelize = require('sequelize');
                const total_cotadistunidade = await db.pjes.findAll({
                    attributes: [
                        'id', 'operacao', 'evento', 'cotaofdist', 'cotaprcdist', 'mes', 'idome', 'iduser', 'obs',
                        [Sequelize.literal('SUM(cotaofdist)'), 'total_cotaofdist'],
                        [Sequelize.literal('SUM(cotaprcdist)'), 'total_cotaprcdist'],
                        [Sequelize.literal('SUM(cotaofdist) * 300'), 'total_cotaofdist_multiplicado'],
                        [Sequelize.literal('SUM(cotaprcdist) * 200'), 'total_cotaprcdist_multiplicado']
                    ],
                    where: 
                        {
                            idome:[5, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62],
                            ano,
                            mes,
                            operacao: {
                                [Sequelize.Op.like]: 'PJES GOVERNO%'
                            },
                    },
                    include: [
                        { model: db.omes, attributes: ['nome'] },
                        { model: db.users, attributes: ['name'] }
                    ],
                    group: ['idome', 'ome.nome', 'user.name'],
                    raw: true,
                });

            //----UNIDADES | INICIO TABELA DE COTAS EXECUTADAS-------------------------------------------------------------------------
                const SequelizeExecut = require('sequelize');
                const total_cotaexeunidade = await db.pjesgercota.findAll({
                    attributes: [
                        'id', 'operacao', 'id_ome', 'ttofexe', 'ttprcexe', 'status', 'mes', 'ano', 'obs',
                        [SequelizeExecut.literal('SUM(ttofexe)'), 'total_cotaofexe'],
                        [SequelizeExecut.literal('SUM(ttprcexe)'), 'total_cotaprcexe'],
                        [SequelizeExecut.literal('SUM(ttofexe) * 300'), 'total_cotaofexe_multiplicado'],
                        [SequelizeExecut.literal('SUM(ttprcexe) * 200'), 'total_cotaprcexe_multiplicado']
                    ],
                    where: 
                        {id_ome:[5, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62],
                        ano,
                        mes,
                        operacao: {
                            [SequelizeExecut.Op.like]: 'PJES GOVERNO%'
                            },
                        },
                    include: [
                        { model: db.omes, attributes: ['nome'] },
                    ],
                    group: ['id_ome', 'ome.nome'],
                    raw: true,
                });


            //--- UNIDADES | INICIO CALCULAR OS VALORES TOTAIS POR UNIDADES-------------------------------------------------------------------------

                //VALOR FINAL DE COTAS DISTRIBUIDAS OFICIAIS UNIDADES
                const SequelizeDistUnidade = require('sequelize');
                const valorfinal_cotadistunidade = await db.pjes.findAll({
                    attributes: [
                        [SequelizeDistUnidade.literal('SUM(cotaofdist) * 300'), 'valor_cotaofdist_multiplicado'],
                        [SequelizeDistUnidade.literal('SUM(cotaprcdist) * 200'), 'valor_cotaprcdist_multiplicado']
                    ],
                    where: {
                            idome:[5, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62],
                            ano,
                            mes,
                            operacao: {
                                [SequelizeDistUnidade.Op.like]: 'PJES GOVERNO%'
                            },
                            
                    },
                    raw: true,
                });

                //VALOR DE COTAS EXECUTADAS OFICIAIS UNIDADES
                const SequelizeExecutUnidade = require('sequelize');
                const valorfinal_cotaexeunidade = await db.pjesgercota.findAll({
                    attributes: [
                        [SequelizeExecutUnidade.literal('SUM(ttofexe) * 300'), 'valor_cotaofexe_multiplicado'],
                        [SequelizeExecutUnidade.literal('SUM(ttprcexe) * 200'), 'valor_cotaprcexe_multiplicado']
                    ],
                    where: {
                            id_ome:[5, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62],
                            ano,
                            mes,
                            operacao: {
                                [SequelizeExecutUnidade.Op.like]: 'PJES GOVERNO%'
                            },
                    },
                    raw: true,
                });

            //---UNIDADES | INICIO CALCULAR OS VALORES E COTAS TOTAIS POR UNIDADES-------------------------------------------------------------------------

                // CALCULO DO VALOR DISTRIBUIDO
                const valorCotaOfDistUnidade = parseFloat(valorfinal_cotadistunidade[0]?.valor_cotaofdist_multiplicado) || 0;
                const valorCotaPrcDistUnidade = parseFloat(valorfinal_cotadistunidade[0]?.valor_cotaprcdist_multiplicado) || 0;
                const valorFinalDistUnidade = valorCotaOfDistUnidade + valorCotaPrcDistUnidade;

                // CALCULO DO TOTAL DE COTAS DISTRIBUIDAS
                const totalcotaOfDistUnidade = valorCotaOfDistUnidade/300;
                const totalcotaPrcDistUnidade = valorCotaPrcDistUnidade/200;


                // CALCULO DO VALOR EXECUTADO
                const valorCotaOfExeUnidade = parseFloat(valorfinal_cotaexeunidade[0]?.valor_cotaofexe_multiplicado) || 0;
                const valorCotaPrcExeUnidade = parseFloat(valorfinal_cotaexeunidade[0]?.valor_cotaprcexe_multiplicado) || 0;
                const valorFinalExeUnidade = valorCotaOfExeUnidade + valorCotaPrcExeUnidade;

                // CALCULO DO TOTAL DE COTAS EXECUTADAS
                const totalcotaOfExeUnidade = valorCotaOfExeUnidade/300;
                const totalcotaPrcExeUnidade = valorCotaPrcExeUnidade/200;

                // CALCULO DO SALDO FINAL
                const saldoFinalUnidade = valorFinalDistUnidade-valorFinalExeUnidade;

            //---UNIDADES | FIM CALCULAR OS VALORES E COTAS TOTAIS POR DIRETORIA-------------------------------------------------------------------------


            //---PE | INICIO

        //---PE | INICIO TABELA DE COTAS DISTRIBUIDAS-------------------------------------------------------------------------
                const Sequelizepe = require('sequelize');
                const total_cotadistpe = await db.pjes.findAll({
                    attributes: [
                        'id', 'operacao', 'evento', 'cotaofdist', 'cotaprcdist', 'mes', 'idome', 'iduser', 'obs',
                        [Sequelizepe.literal('SUM(cotaofdist)'), 'total_cotaofdist'],
                        [Sequelizepe.literal('SUM(cotaprcdist)'), 'total_cotaprcdist'],
                        [Sequelizepe.literal('SUM(cotaofdist) * 300'), 'total_cotaofdist_multiplicado'],
                        [Sequelizepe.literal('SUM(cotaprcdist) * 200'), 'total_cotaprcdist_multiplicado']
                    ],
                    where: 
                        {
                        idome:[5, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62],
                        mes,
                        ano,
                        operacao: "PJES PATRULHA ESCOLAR",
                    },
                    include: [
                        { model: db.omes, attributes: ['nome'] },
                        { model: db.users, attributes: ['name'] }
                    ],
                    group: ['idome', 'ome.nome', 'user.name'],
                    raw: true,
                });

            //----PE | INICIO TABELA DE COTAS EXECUTADAS-------------------------------------------------------------------------
                const SequelizeExecutpe = require('sequelize');
                const total_cotaexepe = await db.pjesgercota.findAll({
                    attributes: [
                        'id', 'operacao', 'id_ome', 'ttofexe', 'ttprcexe', 'status', 'mes', 'ano', 'obs',
                        [SequelizeExecutpe.literal('SUM(ttofexe)'), 'total_cotaofexe'],
                        [SequelizeExecutpe.literal('SUM(ttprcexe)'), 'total_cotaprcexe'],
                        [SequelizeExecutpe.literal('SUM(ttofexe) * 300'), 'total_cotaofexe_multiplicado'],
                        [SequelizeExecutpe.literal('SUM(ttprcexe) * 200'), 'total_cotaprcexe_multiplicado']
                    ],
                    where: 
                        {
                        id_ome:[5, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62],
                        mes,
                        ano,
                        operacao: "PJES PATRULHA ESCOLAR",
                        },
                    include: [
                        { model: db.omes, attributes: ['nome'] },
                    ],
                    group: ['id_ome', 'ome.nome'],
                    raw: true,
                });

            //--- PE | INICIO CALCULAR OS VALORES TOTAIS POR DIRETORIA-------------------------------------------------------------------------

            //VALOR FINAL DE COTAS DISTRIBUIDAS OFICIAIS PE
                const SequelizeDistPe = require('sequelize');
                const valorfinal_cotadistpe = await db.pjes.findAll({
                    attributes: [
                        [SequelizeDistPe.literal('SUM(cotaofdist) * 300'), 'valor_cotaofdist_multiplicado'],
                        [SequelizeDistPe.literal('SUM(cotaprcdist) * 200'), 'valor_cotaprcdist_multiplicado']
                    ],
                    where: {
                            idome:[5, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62],
                            mes,
                            ano,
                            operacao: "PJES PATRULHA ESCOLAR",
                    },
                    raw: true,
                });

            //VALOR DE COTAS EXECUTADAS OFICIAIS PE
                const SequelizeExecutPe = require('sequelize');
                const valorfinal_cotaexepe = await db.pjesgercota.findAll({
                    attributes: [
                        [SequelizeExecutPe.literal('SUM(ttofexe) * 300'), 'valor_cotaofexe_multiplicado'],
                        [SequelizeExecutPe.literal('SUM(ttprcexe) * 200'), 'valor_cotaprcexe_multiplicado']
                    ],
                    where: {
                            id_ome:[5, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62],
                            mes,
                            ano,
                            operacao: "PJES PATRULHA ESCOLAR",
                    },
                    raw: true,
                });

            //---PE | INICIO CALCULAR OS VALORES E COTAS TOTAIS POR DIRETORIA-------------------------------------------------------------------------

            // CALCULO DO VALOR DISTRIBUIDO
                const valorCotaOfDistPe = parseFloat(valorfinal_cotadistpe[0]?.valor_cotaofdist_multiplicado) || 0;
                const valorCotaPrcDistPe = parseFloat(valorfinal_cotadistpe[0]?.valor_cotaprcdist_multiplicado) || 0;
                const valorFinalDistPe = valorCotaOfDistPe + valorCotaPrcDistPe;

            // CALCULO DO TOTAL DE COTAS DISTRIBUIDAS
                const totalcotaOfDistPe = valorCotaOfDistPe/300;
                const totalcotaPrcDistPe = valorCotaPrcDistPe/200;


            // CALCULO DO VALOR EXECUTADO
                const valorCotaOfExePe = parseFloat(valorfinal_cotaexepe[0]?.valor_cotaofexe_multiplicado) || 0;
                const valorCotaPrcExePe = parseFloat(valorfinal_cotaexepe[0]?.valor_cotaprcexe_multiplicado) || 0;
                const valorFinalExePe = valorCotaOfExePe + valorCotaPrcExePe;

            // CALCULO DO TOTAL DE COTAS EXECUTADAS
                const totalcotaOfExePe = valorCotaOfExePe/300;
                const totalcotaPrcExePe = valorCotaPrcExePe/200;

            // CALCULO DO SALDO FINAL
                const saldoFinalPe = valorFinalDistPe-valorFinalExePe;

        //---PE | FIM CALCULAR OS VALORES E COTAS TOTAIS POR DIRETORIA-------------------------------------------------------------------------

    //---PE | FIM

    //---TI | INICIO

                //---TI | INICIO TABELA DE COTAS DISTRIBUIDAS-------------------------------------------------------------------------
                const Sequelizeti = require('sequelize');
                const total_cotadistti = await db.pjes.findAll({
                    attributes: [
                        'id', 'operacao', 'evento', 'cotaofdist', 'cotaprcdist', 'mes', 'idome', 'iduser', 'obs',
                        [Sequelizeti.literal('SUM(cotaofdist)'), 'total_cotaofdist'],
                        [Sequelizeti.literal('SUM(cotaprcdist)'), 'total_cotaprcdist'],
                        [Sequelizeti.literal('SUM(cotaofdist) * 300'), 'total_cotaofdist_multiplicado'],
                        [Sequelizeti.literal('SUM(cotaprcdist) * 200'), 'total_cotaprcdist_multiplicado']
                    ],
                    where: 
                        {
                        idome:[5, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62],
                        mes,
                        ano,
                        operacao: "PJES CTM (BRT)",
                    },
                    include: [
                        { model: db.omes, attributes: ['nome'] },
                        { model: db.users, attributes: ['name'] }
                    ],
                    group: ['idome', 'ome.nome', 'user.name'],
                    raw: true,
                });

            //----TI | INICIO TABELA DE COTAS EXECUTADAS-------------------------------------------------------------------------
                const SequelizeExecutti = require('sequelize');
                const total_cotaexeti = await db.pjesgercota.findAll({
                    attributes: [
                        'id', 'operacao', 'id_ome', 'ttofexe', 'ttprcexe', 'status', 'mes', 'ano', 'obs',
                        [SequelizeExecutti.literal('SUM(ttofexe)'), 'total_cotaofexe'],
                        [SequelizeExecutti.literal('SUM(ttprcexe)'), 'total_cotaprcexe'],
                        [SequelizeExecutti.literal('SUM(ttofexe) * 300'), 'total_cotaofexe_multiplicado'],
                        [SequelizeExecutti.literal('SUM(ttprcexe) * 200'), 'total_cotaprcexe_multiplicado']
                    ],
                    where: 
                        {
                        id_ome:[5, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62],
                        mes,
                        ano,
                        operacao: "PJES CTM (BRT)",
                        },
                    include: [
                        { model: db.omes, attributes: ['nome'] },
                    ],
                    group: ['id_ome', 'ome.nome'],
                    raw: true,
                });

            //--- TI | INICIO CALCULAR OS VALORES TOTAIS POR DIRETORIA-------------------------------------------------------------------------

            //VALOR FINAL DE COTAS DISTRIBUIDAS OFICIAIS PE
                const SequelizeDistTi = require('sequelize');
                const valorfinal_cotadistti = await db.pjes.findAll({
                    attributes: [
                        [SequelizeDistTi.literal('SUM(cotaofdist) * 300'), 'valor_cotaofdist_multiplicado'],
                        [SequelizeDistTi.literal('SUM(cotaprcdist) * 200'), 'valor_cotaprcdist_multiplicado']
                    ],
                    where: {
                            idome:[5, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62],
                            mes,
                            ano,
                            operacao: "PJES CTM (BRT)",
                    },
                    raw: true,
                });

            //VALOR DE COTAS EXECUTADAS OFICIAIS TI
                const SequelizeExecutTi = require('sequelize');
                const valorfinal_cotaexeti = await db.pjesgercota.findAll({
                    attributes: [
                        [SequelizeExecutTi.literal('SUM(ttofexe) * 300'), 'valor_cotaofexe_multiplicado'],
                        [SequelizeExecutTi.literal('SUM(ttprcexe) * 200'), 'valor_cotaprcexe_multiplicado']
                    ],
                    where: {
                            id_ome:[5, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62],
                            mes,
                            ano,
                            operacao: "PJES CTM (BRT)",
                    },
                    raw: true,
                });

            //---TI | INICIO CALCULAR OS VALORES E COTAS TOTAIS POR DIRETORIA-------------------------------------------------------------------------

            // CALCULO DO VALOR DISTRIBUIDO
                const valorCotaOfDistTi = parseFloat(valorfinal_cotadistti[0]?.valor_cotaofdist_multiplicado) || 0;
                const valorCotaPrcDistTi = parseFloat(valorfinal_cotadistti[0]?.valor_cotaprcdist_multiplicado) || 0;
                const valorFinalDistTi = valorCotaOfDistTi + valorCotaPrcDistTi;

            // CALCULO DO TOTAL DE COTAS DISTRIBUIDAS
                const totalcotaOfDistTi = valorCotaOfDistTi/300;
                const totalcotaPrcDistTi = valorCotaPrcDistTi/200;


            // CALCULO DO VALOR EXECUTADO
                const valorCotaOfExeTi = parseFloat(valorfinal_cotaexeti[0]?.valor_cotaofexe_multiplicado) || 0;
                const valorCotaPrcExeTi = parseFloat(valorfinal_cotaexeti[0]?.valor_cotaprcexe_multiplicado) || 0;
                const valorFinalExeTi = valorCotaOfExeTi + valorCotaPrcExeTi;

            // CALCULO DO TOTAL DE COTAS EXECUTADAS
                const totalcotaOfExeTi = valorCotaOfExeTi/300;
                const totalcotaPrcExeTi = valorCotaPrcExeTi/200;

            // CALCULO DO SALDO FINAL
                const saldoFinalTi = valorFinalDistTi-valorFinalExeTi;

            //---TI | FIM CALCULAR OS VALORES E COTAS TOTAIS POR DIRETORIA-------------------------------------------------------------------------

    //---TI | FIM

    //---ENEM | INICIO

                //---ENEM | INICIO TABELA DE COTAS DISTRIBUIDAS-------------------------------------------------------------------------
                const Sequelizeenem = require('sequelize');
                const total_cotadistenem = await db.pjes.findAll({
                    attributes: [
                        'id', 'operacao', 'evento', 'cotaofdist', 'cotaprcdist', 'mes', 'idome', 'iduser', 'obs',
                        [Sequelizeenem.literal('SUM(cotaofdist)'), 'total_cotaofdist'],
                        [Sequelizeenem.literal('SUM(cotaprcdist)'), 'total_cotaprcdist'],
                        [Sequelizeenem.literal('SUM(cotaofdist) * 300'), 'total_cotaofdist_multiplicado'],
                        [Sequelizeenem.literal('SUM(cotaprcdist) * 200'), 'total_cotaprcdist_multiplicado']
                    ],
                    where: 
                        {
                        idome:[5, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62],
                        mes,
                        ano,
                        operacao: "PJES OP ENEM",
                    },
                    include: [
                        { model: db.omes, attributes: ['nome'] },
                        { model: db.users, attributes: ['name'] }
                    ],
                    group: ['idome', 'ome.nome', 'user.name'],
                    raw: true,
                });

            //----ENEM | INICIO TABELA DE COTAS EXECUTADAS-------------------------------------------------------------------------
                const SequelizeExecutenem = require('sequelize');
                const total_cotaexeenem = await db.pjesgercota.findAll({
                    attributes: [
                        'id', 'operacao', 'id_ome', 'ttofexe', 'ttprcexe', 'status', 'mes', 'ano', 'obs',
                        [SequelizeExecutenem.literal('SUM(ttofexe)'), 'total_cotaofexe'],
                        [SequelizeExecutenem.literal('SUM(ttprcexe)'), 'total_cotaprcexe'],
                        [SequelizeExecutenem.literal('SUM(ttofexe) * 300'), 'total_cotaofexe_multiplicado'],
                        [SequelizeExecutenem.literal('SUM(ttprcexe) * 200'), 'total_cotaprcexe_multiplicado']
                    ],
                    where: 
                        {
                        id_ome:[5, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62],
                        mes,
                        ano,
                        operacao: "PJES OP ENEM",
                        },
                    include: [
                        { model: db.omes, attributes: ['nome'] },
                    ],
                    group: ['id_ome', 'ome.nome'],
                    raw: true,
                });

            //--- ENEM | INICIO CALCULAR OS VALORES TOTAIS POR DIRETORIA-------------------------------------------------------------------------

            //VALOR FINAL DE COTAS DISTRIBUIDAS OFICIAIS ENEM
                const SequelizeDistEnem = require('sequelize');
                const valorfinal_cotadistenem = await db.pjes.findAll({
                    attributes: [
                        [SequelizeDistEnem.literal('SUM(cotaofdist) * 300'), 'valor_cotaofdist_multiplicado'],
                        [SequelizeDistEnem.literal('SUM(cotaprcdist) * 200'), 'valor_cotaprcdist_multiplicado']
                    ],
                    where: {
                            idome:[5, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62],
                            mes,
                            ano,
                            operacao: "PJES OP ENEM",
                    },
                    raw: true,
                });

            //VALOR DE COTAS EXECUTADAS OFICIAIS ENEM
                const SequelizeExecutEnem = require('sequelize');
                const valorfinal_cotaexeenem = await db.pjesgercota.findAll({
                    attributes: [
                        [SequelizeExecutEnem.literal('SUM(ttofexe) * 300'), 'valor_cotaofexe_multiplicado'],
                        [SequelizeExecutEnem.literal('SUM(ttprcexe) * 200'), 'valor_cotaprcexe_multiplicado']
                    ],
                    where: {
                            id_ome:[5, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62],
                            mes,
                            ano,
                            operacao: "PJES OP ENEM",
                    },
                    raw: true,
                });

            //---ENEM | INICIO CALCULAR OS VALORES E COTAS TOTAIS POR DIRETORIA-------------------------------------------------------------------------

            // CALCULO DO VALOR DISTRIBUIDO
                const valorCotaOfDistEnem = parseFloat(valorfinal_cotadistenem[0]?.valor_cotaofdist_multiplicado) || 0;
                const valorCotaPrcDistEnem = parseFloat(valorfinal_cotadistenem[0]?.valor_cotaprcdist_multiplicado) || 0;
                const valorFinalDistEnem = valorCotaOfDistTi + valorCotaPrcDistEnem;

            // CALCULO DO TOTAL DE COTAS DISTRIBUIDAS
                const totalcotaOfDistEnem = valorCotaOfDistEnem/300;
                const totalcotaPrcDistEnem = valorCotaPrcDistEnem/200;


            // CALCULO DO VALOR EXECUTADO
                const valorCotaOfExeEnem = parseFloat(valorfinal_cotaexeenem[0]?.valor_cotaofexe_multiplicado) || 0;
                const valorCotaPrcExeEnem = parseFloat(valorfinal_cotaexeenem[0]?.valor_cotaprcexe_multiplicado) || 0;
                const valorFinalExeEnem = valorCotaOfExeEnem + valorCotaPrcExeEnem;

            // CALCULO DO TOTAL DE COTAS EXECUTADAS
                const totalcotaOfExeEnem = valorCotaOfExeEnem/300;
                const totalcotaPrcExeEnem = valorCotaPrcExeEnem/200;

            // CALCULO DO SALDO FINAL
                const saldoFinalEnem = valorFinalDistEnem-valorFinalExeEnem;

            //---ENEM | FIM CALCULAR OS VALORES E COTAS TOTAIS POR DIRETORIA-------------------------------------------------------------------------

    //---ENEM | FIM



            // CALCULAR O SALDO GERAL DE COTAS PARA A UNIDADE

            function converterMesPTparaEN(nomeMesPT) {
                switch (nomeMesPT) {
                    case 'JAN':
                        return 'JAN';
                    case 'FEV':
                        return 'FEB';
                    case 'MAR':
                        return 'MAR';
                    case 'ABR':
                        return 'APR';
                    case 'MAI':
                        return 'MAY';
                    case 'JUN':
                        return 'JUN';
                    case 'JUL':
                        return 'JUL';
                    case 'AGO':
                        return 'AUG';
                    case 'SET':
                        return 'SEP';
                    case 'OUT':
                        return 'OCT';
                    case 'NOV':
                        return 'NOV';
                    case 'DEZ':
                        return 'DEC';
                    default:
                        return nomeMesPT;
                }
            }


            // BLOCO QUE CONTA A QUANTIDADE SERVIÇO EM EXCESSO DE OFICIAS E PRAÇAS
            const nomeMesConvert = converterMesPTparaEN(nomeMes);
            const ttServOf = await db.escalas.findAll({
                attributes: [
                    'matricula',
                    [Sequelize.fn('SUM', Sequelize.col('ttcota')), 'count']
                ],
                where: {
                    data_inicio: {
                        [Op.and]: [
                            Sequelize.literal(`DATE_FORMAT(data_inicio, '%b') = '${nomeMesConvert}'`),
                            Sequelize.literal(`YEAR(data_inicio) = ${nomeAno}`)
                        ]
                    },
                    pg: ['2º TEN', '1º TEN', 'CAP', 'MAJ', 'TC', 'CEL'],
                    idome:[5, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62],
                },
                group: ['matricula'],
                
            });
            const ttServicoOf = ttServOf.length;

            
            // BLOCO QUE CONTA A QUANTIDADE SERVIÇO EM EXCESSO DE OFICIAS E PRAÇAS
            const ttServPrc = await db.escalas.findAll({
                attributes: [
                    'matricula',
                    [Sequelize.fn('SUM', Sequelize.col('ttcota')), 'count']
                ],
                where: {
                    data_inicio: {
                        [Op.and]: [
                            Sequelize.literal(`DATE_FORMAT(data_inicio, '%b') = '${nomeMesConvert}'`),
                            Sequelize.literal(`YEAR(data_inicio) = ${nomeAno}`)
                        ]
                    },
                    pg: ['SD', 'CB', '3º SGT', '2º SGT', '1º SGT', 'ST'],
                    idome:[5, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62],
                },
                group: ['matricula'],
                
            });
            const ttServicoPrc = ttServPrc.length;

            const totalcotaOfDistGeral = totalcotaOfDistUnidade + totalcotaOfDistPe + totalcotaOfDistTi + totalcotaOfDistEnem;
            const totalcotaPrcDistGeral = totalcotaPrcDistUnidade + totalcotaPrcDistPe + totalcotaPrcDistTi + totalcotaPrcDistEnem;

            const saldocotaOfGeral = totalcotaOfDistGeral - ttServicoOf;
            const saldocotaPrcGeral = totalcotaPrcDistGeral - ttServicoPrc;



            // INICIO -  CONSULTA PARA TRAZER O REMANESCENTE DE OFICIAIS ANUAL
            const dataAtual = new Date();
            const anoAtual = dataAtual.getFullYear();
            const mesAtual = dataAtual.getMonth() + 1; // Mês atual (janeiro é 0, fevereiro é 1, ..., dezembro é 11)

            const somaCtgeralinicialof = await db.tetopjes.sum('ctgeralinicialof', {
                where: {
                    ano: anoAtual,
                    mes: {[Sequelize.Op.lte]: mesAtual},
                }
            });
            
            const somaTtofexe = await db.pjesgercota.sum('ttofexe', {
                    where: {
                        ano: anoAtual,
                        mes: {[Sequelize.Op.lte]: mesAtual},
                        operacao: {[Sequelize.Op.like]: 'PJES GOVERNO%'}
                    }
                });

            const saldoCtRenOfAnual = somaCtgeralinicialof - somaTtofexe;
            // FIM -  CONSULTA PARA TRAZER O REMANESCENTE DE OFICIAIS ANUAL
            

            // INICIO -  CONSULTA PARA TRAZER O REMANESCENTE DE PRAÇAS ANUAL
            const somaCtgeralinicialprc = await db.tetopjes.sum('ctgeralinicialprc', {
                where: {
                    ano: anoAtual,
                    mes: { [Sequelize.Op.lte]: mesAtual } // A soma é Somente até o mês atual
                }});
            const somaTtprcexe = await db.pjesgercota.sum('ttprcexe', {
                where: {
                    ano:anoAtual,
                    mes: { [Sequelize.Op.lte]: mesAtual },
                    operacao: {[Sequelize.Op.like]: 'PJES GOVERNO%'},
                }
            });
            const saldoCtRenPrcAnual = somaCtgeralinicialprc - somaTtprcexe;
            // FIM -  CONSULTA PARA TRAZER O REMANESCENTE DE PRAÇAS ANUAL



            // INICIO -  CONSULTA PARA TRAZER O TETO DE OFICIAIS E PRAÇAS DA TABELA tetopjes
            const ttgeralinicialofmes = await db.tetopjes.findOne({
                attributes: ['id', 'ctgeralinicialof', 'ctgeralinicialprc', 'mes', 'ano'],
                where: {
                    ano: anoAtual,
                    mes: { [Sequelize.Op.lte]: mesAtual } // A soma é Somente até o mês atual
                }});


            //---CALCULO TOTAL - PARTE SUPERIOR DA TELA PJES | INICIO
            const ctGeralInicialOf = ttgeralinicialofmes.ctgeralinicialof; //Passando os valores da consulta acima
            const ctGeralInicialPrc = ttgeralinicialofmes.ctgeralinicialprc; //Passando os valores da consulta acima
            const valorGeralInicial = ctGeralInicialOf*300 + ctGeralInicialPrc*200;

            const totalcotaOfDistGov = totalcotaOfDistUnidade;
            const totalcotaPrcDistGov = totalcotaPrcDistUnidade; 
            const totalcotaDistGov = totalcotaOfDistGov + totalcotaPrcDistGov;

            const totalcotaOfExeGov = totalcotaOfExeUnidade;
            const totalcotaPrcExeGov = totalcotaPrcExeUnidade; 
            const totalcotaExeGov = totalcotaOfExeGov + totalcotaPrcExeGov;

            const ctAtualOf = ctGeralInicialOf - totalcotaOfDistGov;
            const ctAtualPrc = ctGeralInicialPrc - totalcotaPrcDistGov;


            //TOTAL DE EVENTOS CADASTRADOS PARA A OME | COUNT
            const queryPjes = await db.pjes.count({
                where: {idome:[5, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62], mes, ano, },
            });


            function converterMesPTparaEN(nomeMesPT) {
                switch (nomeMesPT) {
                    case 'JAN':
                        return 'JAN';
                    case 'FEV':
                        return 'FEB';
                    case 'MAR':
                        return 'MAR';
                    case 'ABR':
                        return 'APR';
                    case 'MAI':
                        return 'MAY';
                    case 'JUN':
                        return 'JUN';
                    case 'JUL':
                        return 'JUL';
                    case 'AGO':
                        return 'AUG';
                    case 'SET':
                        return 'SEP';
                    case 'OUT':
                        return 'OCT';
                    case 'NOV':
                        return 'NOV';
                    case 'DEZ':
                        return 'DEC';
                    default:
                        return nomeMesPT;
                }
            }

            // BLOCO QUE CONTA A QUANTIDADE SERVIÇO EM EXCESSO DE OFICIAS E PRAÇAS
            const nomeMesConvertido = converterMesPTparaEN(nomeMes);

            const ttServExcessoOf = await db.escalas.findAll({
                attributes: [
                    'matricula',
                    [Sequelize.fn('SUM', Sequelize.col('ttcota')), 'count']
                ],
                where: {
                    data_inicio: {
                        [Op.and]: [
                            Sequelize.literal(`DATE_FORMAT(data_inicio, '%b') = '${nomeMesConvertido}'`),
                            Sequelize.literal(`YEAR(data_inicio) = ${nomeAno}`)
                        ]
                    },
                    pg: ['2º TEN', '1º TEN', 'CAP', 'MAJ', 'TC', 'CEL']
                },
                group: ['matricula'],
                having: Sequelize.literal('count > 12') // Condição para contar mais de 12 vezes
            });
            const ttServExcOf = ttServExcessoOf.length;
        
            // BLOCO QUE CONTA A QUANTIDADE SERVIÇO EM EXCESSO DE OFICIAS E PRAÇAS
            const ttServExcessoPrc = await db.escalas.findAll({
                attributes: [
                    'matricula',
                    [Sequelize.fn('SUM', Sequelize.col('ttcota')), 'count']
                ],
                where: {
                    data_inicio: {
                        [Op.and]: [
                            Sequelize.literal(`DATE_FORMAT(data_inicio, '%b') = '${nomeMesConvertido}'`),
                            Sequelize.literal(`YEAR(data_inicio) = ${nomeAno}`)
                        ]
                    },
                    pg: ['SD', 'CB', '3º SGT', '2º SGT', '1º SGT', 'ST']
                },
                group: ['matricula'],
                having: Sequelize.literal('count > 12') // Condição para contar mais de 12 vezes
            });
            const ttServExcPrc = ttServExcessoPrc.length;

            // MOSTRA O VALOR TOTAL DE EXCESSO DE OFICIAIS E PRAÇAS
            const valorttServExc = (parseFloat(ttServExcOf) * 300) + (parseFloat(ttServExcPrc) * 200);

            //TOTAL DE POLICIAIS IMPEDIDOS COM COTA NA OME | COUNT   
            const contagemImpedidos = await db.escalas.count({
                attributes: ['id','operacao', 'cod', 'nunfunc', 'pg', 'matricula', 'nome','telefone','status', 'modalidade', 'data_inicio', 'hora_inicio', 'data_fim', 'hora_fim', 'ome_sgpm', 'localap', 'anotacoes', 'idevento', 'idome', 'createdAt', 'updatedAt'],
                    where: Sequelize.literal(`
                        DATE_FORMAT(data_inicio, '%b') = '${nomeMesConvertido}' AND
                        YEAR(data_inicio) = ${nomeAno} AND
                        idome = ${5, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62} AND
                        status = 'IMPEDIDO'`),
            });
            

            // INICIO BLOCO QUE CONTA A QUANTIDADE REMANESCENTE DE OFICIAS E PRAÇAS
            const SequelizeRem = require('sequelize');
            const total_cotadistRen = await db.pjes.findAll({
                attributes: [
                    'id', 'operacao', 'evento', 'cotaofdist', 'cotaprcdist', 'mes', 'idome', 'iduser', 'obs',
                    [SequelizeRem.literal('SUM(cotaofdist)'), 'total_cotaofdist'],
                    [SequelizeRem.literal('SUM(cotaprcdist)'), 'total_cotaprcdist'],
                    [SequelizeRem.literal('SUM(cotaofdist) * 300'), 'total_cotaofdist_multiplicado'],
                    [SequelizeRem.literal('SUM(cotaprcdist) * 200'), 'total_cotaprcdist_multiplicado']
                ],
                where: { 
                    mes,
                    ano,
                    idome:[5, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62],
                    operacao: "PJES GOVERNO REMANESCENTE",
                },
                
                raw: true,
            });

            const valorCotaOfDistRen = parseFloat(total_cotadistRen[0]?.total_cotaofdist_multiplicado) || 0;
            const valorCotaPrcDistRen = parseFloat(total_cotadistRen[0]?.total_cotaprcdist_multiplicado) || 0;
            const totalcotaOfDistRen = valorCotaOfDistRen/300;
            const totalcotaPrcDistRen = valorCotaPrcDistRen/200;

            const totalFinalDistRen = valorCotaOfDistRen + valorCotaPrcDistRen;
        
                SaldoAnualOfGov = ctGeralInicialOf - totalcotaOfExeGov;
                SaldoAnualPrcGov = ctGeralInicialPrc - totalcotaPrcExeGov;
            // FIM BLOCO QUE CONTA A QUANTIDADE REMANESCENTE DE OFICIAS E PRAÇAS


            const user = await db.users.findOne({
                attributes: ['id', 'name', 'email', 'image', 'situationId', 'omeId', 'createdAt'],
                where: {
                    id: req.user.dataValues.id
                },
                include: [{
                    model: db.situations,
                    attributes: ['nameSituation']
                }]
            });


            // Consulta para obter os Pjes com inclusão da soma de escalas onde pg = 'ST' ou 'CB' e 'CEL' ou 'MAJ'
            await db.pjes.findAll({
                attributes: [
                    'id', 'operacao', 'evento', 'cotaofdist', 'cotaprcdist', 'mes', 'idome', 'iduser', 'obs',
                    // Subconsulta para contar pg = 'ST' ou 'CB'
                    [
                        Sequelize.literal(`(
                            SELECT SUM(ttcota)
                            FROM escalas 
                            WHERE escalas.idevento = pjes.id
                            AND (escalas.pg = 'ST' OR escalas.pg = '1º SGT'
                                OR escalas.pg = '2º SGT'  OR escalas.pg = '3º SGT' 
                                OR escalas.pg = 'CB'  OR escalas.pg = 'SD')
                        )`),
                        'count_pg_prc'
                    ],
                    // Subconsulta para contar pg = 'CEL' ou 'MAJ'
                    [
                        Sequelize.literal(`(
                            SELECT SUM(ttcota)
                            FROM escalas 
                            WHERE escalas.idevento = pjes.id
                            AND (escalas.pg = 'CEL' OR escalas.pg = 'TC'
                                OR escalas.pg = 'MAJ'  OR escalas.pg = 'CAP' 
                                OR escalas.pg = '1º TEN'  OR escalas.pg = '2º TEN')
                        )`),
                        'count_pg_of'
                    ]
                ],
                where: {
                    ano, mes, idome:[4, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49],
                },
                order: [['id', 'DESC']],
                include: [
                    { model: db.omes, attributes: ['nome'] },
                    { model: db.users, attributes: ['name'] }
                ],
                
            })
            .then((pjes) => {

                if (pjes.length !== 0) {
                    
                        res.render("unidade/unidadepjes/list", {
                        layout: 'main', profile: req.user.dataValues, user, nomeMes, nomeAno, sidebarSituations: true,
                        pjes: pjes.map(id => id.toJSON()),
                        valorFinalDistUnidade, valorFinalExeUnidade, saldoFinalUnidade, total_cotadistunidade, total_cotaexeunidade, totalcotaOfDistUnidade,
                        totalcotaPrcDistUnidade, totalcotaOfExeUnidade, totalcotaPrcExeUnidade,

                        valorFinalDistPe, valorFinalExePe, saldoFinalPe, total_cotadistpe,
                        total_cotaexepe, totalcotaOfDistPe, totalcotaPrcDistPe, totalcotaOfExePe,
                        totalcotaPrcExePe,

                        valorFinalDistTi, valorFinalExeTi, saldoFinalTi, total_cotadistti,
                        total_cotaexeti, totalcotaOfDistTi, totalcotaPrcDistTi, totalcotaOfExeTi,
                        totalcotaPrcExeTi,

                        valorFinalDistEnem, valorFinalExeEnem, saldoFinalEnem, total_cotadistenem,
                        total_cotaexeenem, totalcotaOfDistEnem, totalcotaPrcDistEnem, totalcotaOfExeEnem,
                        totalcotaPrcExeEnem,

                        totalcotaOfDistGeral, queryPjes, contagemImpedidos, totalcotaPrcDistGeral, saldocotaOfGeral, saldocotaPrcGeral,

                        ctAtualOf,ctAtualPrc, valorGeralInicial, ctGeralInicialOf, ctGeralInicialPrc, valorGeralInicial,
                        totalcotaDistGov, totalcotaExeGov, totalcotaOfDistGov, totalcotaPrcDistGov, totalcotaOfExeGov,
                        totalcotaPrcExeGov, ttServExcOf, ttServExcPrc, valorttServExc, totalFinalDistRen, totalcotaOfDistRen,
                        totalcotaPrcDistRen, SaldoAnualOfGov, SaldoAnualPrcGov, saldoCtRenOfAnual, saldoCtRenPrcAnual,

                        
                    });
                } else {
                    res.render("unidade/unidadepjes/list", {
                        layout: 'main', profile: req.user.dataValues, sidebarSituations: true, danger_msg: 'Erro: Nenhum Evento Cadastrado!'
                    });
                }

            })
            .catch(() => {
                res.render("unidade/unidadepjes/list", {
                    layout: 'main', profile: req.user.dataValues, sidebarSituations: true, danger_msg: 'Erro: Nenhum Evento Cadastrado!'
                });
            });


    } // FIM IF DINTER II -------------------------------------------------------------------------------------------------------------------------------------------


            const countPjes = await db.pjes.count();            
            if (countPjes === 0) {
                return res.render("unidade/unidadepjes/list", { layout: 'main', profile: req.user.dataValues, sidebarSituations: true, danger_msg: 'Erro: Nenhum pjes encontrada!' });
            }

        //---UNIDADES | INICIO TABELA DE COTAS DISTRIBUIDAS-------------------------------------------------------------------------
            const Sequelize = require('sequelize');
            const total_cotadistunidade = await db.pjes.findAll({
                attributes: [
                    'id', 'operacao', 'evento', 'cotaofdist', 'cotaprcdist', 'mes', 'idome', 'iduser', 'obs',
                    [Sequelize.literal('SUM(cotaofdist)'), 'total_cotaofdist'],
                    [Sequelize.literal('SUM(cotaprcdist)'), 'total_cotaprcdist'],
                    [Sequelize.literal('SUM(cotaofdist) * 300'), 'total_cotaofdist_multiplicado'],
                    [Sequelize.literal('SUM(cotaprcdist) * 200'), 'total_cotaprcdist_multiplicado']
                ],
                where: 
                    {
                        idome:req.user.dataValues.omeId,
                        ano,
                        mes,
                        operacao: {
                            [Sequelize.Op.like]: 'PJES GOVERNO%'
                        },
                },
                include: [
                    { model: db.omes, attributes: ['nome'] },
                    { model: db.users, attributes: ['name'] }
                ],
                group: ['idome', 'ome.nome', 'user.name'],
                raw: true,
            });

        //----UNIDADES | INICIO TABELA DE COTAS EXECUTADAS-------------------------------------------------------------------------
            const SequelizeExecut = require('sequelize');
            const total_cotaexeunidade = await db.pjesgercota.findAll({
                attributes: [
                    'id', 'operacao', 'id_ome', 'ttofexe', 'ttprcexe', 'status', 'mes', 'ano', 'obs',
                    [SequelizeExecut.literal('SUM(ttofexe)'), 'total_cotaofexe'],
                    [SequelizeExecut.literal('SUM(ttprcexe)'), 'total_cotaprcexe'],
                    [SequelizeExecut.literal('SUM(ttofexe) * 300'), 'total_cotaofexe_multiplicado'],
                    [SequelizeExecut.literal('SUM(ttprcexe) * 200'), 'total_cotaprcexe_multiplicado']
                ],
                where: 
                    {id_ome:req.user.dataValues.omeId,
                    ano,
                    mes,
                    operacao: {
                        [SequelizeExecut.Op.like]: 'PJES GOVERNO%'
                        },
                    },
                include: [
                    { model: db.omes, attributes: ['nome'] },
                ],
                group: ['id_ome', 'ome.nome'],
                raw: true,
            });


        //--- UNIDADES | INICIO CALCULAR OS VALORES TOTAIS POR UNIDADES-------------------------------------------------------------------------

            //VALOR FINAL DE COTAS DISTRIBUIDAS OFICIAIS UNIDADES
            const SequelizeDistUnidade = require('sequelize');
            const valorfinal_cotadistunidade = await db.pjes.findAll({
                attributes: [
                    [SequelizeDistUnidade.literal('SUM(cotaofdist) * 300'), 'valor_cotaofdist_multiplicado'],
                    [SequelizeDistUnidade.literal('SUM(cotaprcdist) * 200'), 'valor_cotaprcdist_multiplicado']
                ],
                where: {
                        idome:req.user.dataValues.omeId,
                        ano,
                        mes,
                        operacao: {
                            [SequelizeDistUnidade.Op.like]: 'PJES GOVERNO%'
                        },
                        
                },
                raw: true,
            });

            //VALOR DE COTAS EXECUTADAS OFICIAIS UNIDADES
            const SequelizeExecutUnidade = require('sequelize');
            const valorfinal_cotaexeunidade = await db.pjesgercota.findAll({
                attributes: [
                    [SequelizeExecutUnidade.literal('SUM(ttofexe) * 300'), 'valor_cotaofexe_multiplicado'],
                    [SequelizeExecutUnidade.literal('SUM(ttprcexe) * 200'), 'valor_cotaprcexe_multiplicado']
                ],
                where: {
                        id_ome:req.user.dataValues.omeId,
                        ano,
                        mes,
                        operacao: {
                            [SequelizeExecutUnidade.Op.like]: 'PJES GOVERNO%'
                        },
                },
                raw: true,
            });

        //---UNIDADES | INICIO CALCULAR OS VALORES E COTAS TOTAIS POR UNIDADES-------------------------------------------------------------------------

            // CALCULO DO VALOR DISTRIBUIDO
            const valorCotaOfDistUnidade = parseFloat(valorfinal_cotadistunidade[0]?.valor_cotaofdist_multiplicado) || 0;
            const valorCotaPrcDistUnidade = parseFloat(valorfinal_cotadistunidade[0]?.valor_cotaprcdist_multiplicado) || 0;
            const valorFinalDistUnidade = valorCotaOfDistUnidade + valorCotaPrcDistUnidade;

            // CALCULO DO TOTAL DE COTAS DISTRIBUIDAS
            const totalcotaOfDistUnidade = valorCotaOfDistUnidade/300;
            const totalcotaPrcDistUnidade = valorCotaPrcDistUnidade/200;


            // CALCULO DO VALOR EXECUTADO
            const valorCotaOfExeUnidade = parseFloat(valorfinal_cotaexeunidade[0]?.valor_cotaofexe_multiplicado) || 0;
            const valorCotaPrcExeUnidade = parseFloat(valorfinal_cotaexeunidade[0]?.valor_cotaprcexe_multiplicado) || 0;
            const valorFinalExeUnidade = valorCotaOfExeUnidade + valorCotaPrcExeUnidade;

            // CALCULO DO TOTAL DE COTAS EXECUTADAS
            const totalcotaOfExeUnidade = valorCotaOfExeUnidade/300;
            const totalcotaPrcExeUnidade = valorCotaPrcExeUnidade/200;

            // CALCULO DO SALDO FINAL
            const saldoFinalUnidade = valorFinalDistUnidade-valorFinalExeUnidade;

        //---UNIDADES | FIM CALCULAR OS VALORES E COTAS TOTAIS POR DIRETORIA-------------------------------------------------------------------------


        //---PE | INICIO

    //---PE | INICIO TABELA DE COTAS DISTRIBUIDAS-------------------------------------------------------------------------
            const Sequelizepe = require('sequelize');
            const total_cotadistpe = await db.pjes.findAll({
                attributes: [
                    'id', 'operacao', 'evento', 'cotaofdist', 'cotaprcdist', 'mes', 'idome', 'iduser', 'obs',
                    [Sequelizepe.literal('SUM(cotaofdist)'), 'total_cotaofdist'],
                    [Sequelizepe.literal('SUM(cotaprcdist)'), 'total_cotaprcdist'],
                    [Sequelizepe.literal('SUM(cotaofdist) * 300'), 'total_cotaofdist_multiplicado'],
                    [Sequelizepe.literal('SUM(cotaprcdist) * 200'), 'total_cotaprcdist_multiplicado']
                ],
                where: 
                    {
                    idome:req.user.dataValues.omeId,
                    mes,
                    ano,
                    operacao: "PJES PATRULHA ESCOLAR",
                },
                include: [
                    { model: db.omes, attributes: ['nome'] },
                    { model: db.users, attributes: ['name'] }
                ],
                group: ['idome', 'ome.nome', 'user.name'],
                raw: true,
            });

        //----PE | INICIO TABELA DE COTAS EXECUTADAS-------------------------------------------------------------------------
            const SequelizeExecutpe = require('sequelize');
            const total_cotaexepe = await db.pjesgercota.findAll({
                attributes: [
                    'id', 'operacao', 'id_ome', 'ttofexe', 'ttprcexe', 'status', 'mes', 'ano', 'obs',
                    [SequelizeExecutpe.literal('SUM(ttofexe)'), 'total_cotaofexe'],
                    [SequelizeExecutpe.literal('SUM(ttprcexe)'), 'total_cotaprcexe'],
                    [SequelizeExecutpe.literal('SUM(ttofexe) * 300'), 'total_cotaofexe_multiplicado'],
                    [SequelizeExecutpe.literal('SUM(ttprcexe) * 200'), 'total_cotaprcexe_multiplicado']
                ],
                where: 
                    {
                    id_ome:req.user.dataValues.omeId,
                    mes,
                    ano,
                    operacao: "PJES PATRULHA ESCOLAR",
                    },
                include: [
                    { model: db.omes, attributes: ['nome'] },
                ],
                group: ['id_ome', 'ome.nome'],
                raw: true,
            });

        //--- PE | INICIO CALCULAR OS VALORES TOTAIS POR DIRETORIA-------------------------------------------------------------------------

        //VALOR FINAL DE COTAS DISTRIBUIDAS OFICIAIS PE
            const SequelizeDistPe = require('sequelize');
            const valorfinal_cotadistpe = await db.pjes.findAll({
                attributes: [
                    [SequelizeDistPe.literal('SUM(cotaofdist) * 300'), 'valor_cotaofdist_multiplicado'],
                    [SequelizeDistPe.literal('SUM(cotaprcdist) * 200'), 'valor_cotaprcdist_multiplicado']
                ],
                where: {
                        idome:req.user.dataValues.omeId,
                        mes,
                        ano,
                        operacao: "PJES PATRULHA ESCOLAR",
                },
                raw: true,
            });

        //VALOR DE COTAS EXECUTADAS OFICIAIS PE
            const SequelizeExecutPe = require('sequelize');
            const valorfinal_cotaexepe = await db.pjesgercota.findAll({
                attributes: [
                    [SequelizeExecutPe.literal('SUM(ttofexe) * 300'), 'valor_cotaofexe_multiplicado'],
                    [SequelizeExecutPe.literal('SUM(ttprcexe) * 200'), 'valor_cotaprcexe_multiplicado']
                ],
                where: {
                        id_ome:req.user.dataValues.omeId,
                        mes,
                        ano,
                        operacao: "PJES PATRULHA ESCOLAR",
                },
                raw: true,
            });

        //---PE | INICIO CALCULAR OS VALORES E COTAS TOTAIS POR DIRETORIA-------------------------------------------------------------------------

        // CALCULO DO VALOR DISTRIBUIDO
            const valorCotaOfDistPe = parseFloat(valorfinal_cotadistpe[0]?.valor_cotaofdist_multiplicado) || 0;
            const valorCotaPrcDistPe = parseFloat(valorfinal_cotadistpe[0]?.valor_cotaprcdist_multiplicado) || 0;
            const valorFinalDistPe = valorCotaOfDistPe + valorCotaPrcDistPe;

        // CALCULO DO TOTAL DE COTAS DISTRIBUIDAS
            const totalcotaOfDistPe = valorCotaOfDistPe/300;
            const totalcotaPrcDistPe = valorCotaPrcDistPe/200;


        // CALCULO DO VALOR EXECUTADO
            const valorCotaOfExePe = parseFloat(valorfinal_cotaexepe[0]?.valor_cotaofexe_multiplicado) || 0;
            const valorCotaPrcExePe = parseFloat(valorfinal_cotaexepe[0]?.valor_cotaprcexe_multiplicado) || 0;
            const valorFinalExePe = valorCotaOfExePe + valorCotaPrcExePe;

        // CALCULO DO TOTAL DE COTAS EXECUTADAS
            const totalcotaOfExePe = valorCotaOfExePe/300;
            const totalcotaPrcExePe = valorCotaPrcExePe/200;

        // CALCULO DO SALDO FINAL
            const saldoFinalPe = valorFinalDistPe-valorFinalExePe;

    //---PE | FIM CALCULAR OS VALORES E COTAS TOTAIS POR DIRETORIA-------------------------------------------------------------------------

    //---PE | FIM

    //---TI | INICIO

            //---TI | INICIO TABELA DE COTAS DISTRIBUIDAS-------------------------------------------------------------------------
            const Sequelizeti = require('sequelize');
            const total_cotadistti = await db.pjes.findAll({
                attributes: [
                    'id', 'operacao', 'evento', 'cotaofdist', 'cotaprcdist', 'mes', 'idome', 'iduser', 'obs',
                    [Sequelizeti.literal('SUM(cotaofdist)'), 'total_cotaofdist'],
                    [Sequelizeti.literal('SUM(cotaprcdist)'), 'total_cotaprcdist'],
                    [Sequelizeti.literal('SUM(cotaofdist) * 300'), 'total_cotaofdist_multiplicado'],
                    [Sequelizeti.literal('SUM(cotaprcdist) * 200'), 'total_cotaprcdist_multiplicado']
                ],
                where: 
                    {
                    idome:req.user.dataValues.omeId,
                    mes,
                    ano,
                    operacao: "PJES CTM (BRT)",
                },
                include: [
                    { model: db.omes, attributes: ['nome'] },
                    { model: db.users, attributes: ['name'] }
                ],
                group: ['idome', 'ome.nome', 'user.name'],
                raw: true,
            });

        //----TI | INICIO TABELA DE COTAS EXECUTADAS-------------------------------------------------------------------------
            const SequelizeExecutti = require('sequelize');
            const total_cotaexeti = await db.pjesgercota.findAll({
                attributes: [
                    'id', 'operacao', 'id_ome', 'ttofexe', 'ttprcexe', 'status', 'mes', 'ano', 'obs',
                    [SequelizeExecutti.literal('SUM(ttofexe)'), 'total_cotaofexe'],
                    [SequelizeExecutti.literal('SUM(ttprcexe)'), 'total_cotaprcexe'],
                    [SequelizeExecutti.literal('SUM(ttofexe) * 300'), 'total_cotaofexe_multiplicado'],
                    [SequelizeExecutti.literal('SUM(ttprcexe) * 200'), 'total_cotaprcexe_multiplicado']
                ],
                where: 
                    {
                    id_ome:req.user.dataValues.omeId,
                    mes,
                    ano,
                    operacao: "PJES CTM (BRT)",
                    },
                include: [
                    { model: db.omes, attributes: ['nome'] },
                ],
                group: ['id_ome', 'ome.nome'],
                raw: true,
            });

        //--- TI | INICIO CALCULAR OS VALORES TOTAIS POR DIRETORIA-------------------------------------------------------------------------

        //VALOR FINAL DE COTAS DISTRIBUIDAS OFICIAIS PE
            const SequelizeDistTi = require('sequelize');
            const valorfinal_cotadistti = await db.pjes.findAll({
                attributes: [
                    [SequelizeDistTi.literal('SUM(cotaofdist) * 300'), 'valor_cotaofdist_multiplicado'],
                    [SequelizeDistTi.literal('SUM(cotaprcdist) * 200'), 'valor_cotaprcdist_multiplicado']
                ],
                where: {
                        idome:req.user.dataValues.omeId,
                        mes,
                        ano,
                        operacao: "PJES CTM (BRT)",
                },
                raw: true,
            });

        //VALOR DE COTAS EXECUTADAS OFICIAIS TI
            const SequelizeExecutTi = require('sequelize');
            const valorfinal_cotaexeti = await db.pjesgercota.findAll({
                attributes: [
                    [SequelizeExecutTi.literal('SUM(ttofexe) * 300'), 'valor_cotaofexe_multiplicado'],
                    [SequelizeExecutTi.literal('SUM(ttprcexe) * 200'), 'valor_cotaprcexe_multiplicado']
                ],
                where: {
                        id_ome:req.user.dataValues.omeId,
                        mes,
                        ano,
                        operacao: "PJES CTM (BRT)",
                },
                raw: true,
            });

        //---TI | INICIO CALCULAR OS VALORES E COTAS TOTAIS POR DIRETORIA-------------------------------------------------------------------------

        // CALCULO DO VALOR DISTRIBUIDO
            const valorCotaOfDistTi = parseFloat(valorfinal_cotadistti[0]?.valor_cotaofdist_multiplicado) || 0;
            const valorCotaPrcDistTi = parseFloat(valorfinal_cotadistti[0]?.valor_cotaprcdist_multiplicado) || 0;
            const valorFinalDistTi = valorCotaOfDistTi + valorCotaPrcDistTi;

        // CALCULO DO TOTAL DE COTAS DISTRIBUIDAS
            const totalcotaOfDistTi = valorCotaOfDistTi/300;
            const totalcotaPrcDistTi = valorCotaPrcDistTi/200;


        // CALCULO DO VALOR EXECUTADO
            const valorCotaOfExeTi = parseFloat(valorfinal_cotaexeti[0]?.valor_cotaofexe_multiplicado) || 0;
            const valorCotaPrcExeTi = parseFloat(valorfinal_cotaexeti[0]?.valor_cotaprcexe_multiplicado) || 0;
            const valorFinalExeTi = valorCotaOfExeTi + valorCotaPrcExeTi;

        // CALCULO DO TOTAL DE COTAS EXECUTADAS
            const totalcotaOfExeTi = valorCotaOfExeTi/300;
            const totalcotaPrcExeTi = valorCotaPrcExeTi/200;

        // CALCULO DO SALDO FINAL
            const saldoFinalTi = valorFinalDistTi-valorFinalExeTi;

        //---TI | FIM CALCULAR OS VALORES E COTAS TOTAIS POR DIRETORIA-------------------------------------------------------------------------

    //---TI | FIM

    //---ENEM | INICIO

            //---ENEM | INICIO TABELA DE COTAS DISTRIBUIDAS-------------------------------------------------------------------------
            const Sequelizeenem = require('sequelize');
            const total_cotadistenem = await db.pjes.findAll({
                attributes: [
                    'id', 'operacao', 'evento', 'cotaofdist', 'cotaprcdist', 'mes', 'idome', 'iduser', 'obs',
                    [Sequelizeenem.literal('SUM(cotaofdist)'), 'total_cotaofdist'],
                    [Sequelizeenem.literal('SUM(cotaprcdist)'), 'total_cotaprcdist'],
                    [Sequelizeenem.literal('SUM(cotaofdist) * 300'), 'total_cotaofdist_multiplicado'],
                    [Sequelizeenem.literal('SUM(cotaprcdist) * 200'), 'total_cotaprcdist_multiplicado']
                ],
                where: 
                    {
                    idome:req.user.dataValues.omeId,
                    mes,
                    ano,
                    operacao: "PJES OP ENEM",
                },
                include: [
                    { model: db.omes, attributes: ['nome'] },
                    { model: db.users, attributes: ['name'] }
                ],
                group: ['idome', 'ome.nome', 'user.name'],
                raw: true,
            });

        //----ENEM | INICIO TABELA DE COTAS EXECUTADAS-------------------------------------------------------------------------
            const SequelizeExecutenem = require('sequelize');
            const total_cotaexeenem = await db.pjesgercota.findAll({
                attributes: [
                    'id', 'operacao', 'id_ome', 'ttofexe', 'ttprcexe', 'status', 'mes', 'ano', 'obs',
                    [SequelizeExecutenem.literal('SUM(ttofexe)'), 'total_cotaofexe'],
                    [SequelizeExecutenem.literal('SUM(ttprcexe)'), 'total_cotaprcexe'],
                    [SequelizeExecutenem.literal('SUM(ttofexe) * 300'), 'total_cotaofexe_multiplicado'],
                    [SequelizeExecutenem.literal('SUM(ttprcexe) * 200'), 'total_cotaprcexe_multiplicado']
                ],
                where: 
                    {
                    id_ome:req.user.dataValues.omeId,
                    mes,
                    ano,
                    operacao: "PJES OP ENEM",
                    },
                include: [
                    { model: db.omes, attributes: ['nome'] },
                ],
                group: ['id_ome', 'ome.nome'],
                raw: true,
            });

        //--- ENEM | INICIO CALCULAR OS VALORES TOTAIS POR DIRETORIA-------------------------------------------------------------------------

        //VALOR FINAL DE COTAS DISTRIBUIDAS OFICIAIS ENEM
            const SequelizeDistEnem = require('sequelize');
            const valorfinal_cotadistenem = await db.pjes.findAll({
                attributes: [
                    [SequelizeDistEnem.literal('SUM(cotaofdist) * 300'), 'valor_cotaofdist_multiplicado'],
                    [SequelizeDistEnem.literal('SUM(cotaprcdist) * 200'), 'valor_cotaprcdist_multiplicado']
                ],
                where: {
                        idome:req.user.dataValues.omeId,
                        mes,
                        ano,
                        operacao: "PJES OP ENEM",
                },
                raw: true,
            });

        //VALOR DE COTAS EXECUTADAS OFICIAIS ENEM
            const SequelizeExecutEnem = require('sequelize');
            const valorfinal_cotaexeenem = await db.pjesgercota.findAll({
                attributes: [
                    [SequelizeExecutEnem.literal('SUM(ttofexe) * 300'), 'valor_cotaofexe_multiplicado'],
                    [SequelizeExecutEnem.literal('SUM(ttprcexe) * 200'), 'valor_cotaprcexe_multiplicado']
                ],
                where: {
                        id_ome:req.user.dataValues.omeId,
                        mes,
                        ano,
                        operacao: "PJES OP ENEM",
                },
                raw: true,
            });

        //---ENEM | INICIO CALCULAR OS VALORES E COTAS TOTAIS POR DIRETORIA-------------------------------------------------------------------------

        // CALCULO DO VALOR DISTRIBUIDO
            const valorCotaOfDistEnem = parseFloat(valorfinal_cotadistenem[0]?.valor_cotaofdist_multiplicado) || 0;
            const valorCotaPrcDistEnem = parseFloat(valorfinal_cotadistenem[0]?.valor_cotaprcdist_multiplicado) || 0;
            const valorFinalDistEnem = valorCotaOfDistTi + valorCotaPrcDistEnem;

        // CALCULO DO TOTAL DE COTAS DISTRIBUIDAS
            const totalcotaOfDistEnem = valorCotaOfDistEnem/300;
            const totalcotaPrcDistEnem = valorCotaPrcDistEnem/200;


        // CALCULO DO VALOR EXECUTADO
            const valorCotaOfExeEnem = parseFloat(valorfinal_cotaexeenem[0]?.valor_cotaofexe_multiplicado) || 0;
            const valorCotaPrcExeEnem = parseFloat(valorfinal_cotaexeenem[0]?.valor_cotaprcexe_multiplicado) || 0;
            const valorFinalExeEnem = valorCotaOfExeEnem + valorCotaPrcExeEnem;

        // CALCULO DO TOTAL DE COTAS EXECUTADAS
            const totalcotaOfExeEnem = valorCotaOfExeEnem/300;
            const totalcotaPrcExeEnem = valorCotaPrcExeEnem/200;

        // CALCULO DO SALDO FINAL
            const saldoFinalEnem = valorFinalDistEnem-valorFinalExeEnem;

        //---ENEM | FIM CALCULAR OS VALORES E COTAS TOTAIS POR DIRETORIA-------------------------------------------------------------------------

    //---ENEM | FIM


        // CALCULAR O SALDO GERAL DE COTAS PARA A UNIDADE

        function converterMesPTparaEN(nomeMesPT) {
            switch (nomeMesPT) {
                case 'JAN':
                    return 'JAN';
                case 'FEV':
                    return 'FEB';
                case 'MAR':
                    return 'MAR';
                case 'ABR':
                    return 'APR';
                case 'MAI':
                    return 'MAY';
                case 'JUN':
                    return 'JUN';
                case 'JUL':
                    return 'JUL';
                case 'AGO':
                    return 'AUG';
                case 'SET':
                    return 'SEP';
                case 'OUT':
                    return 'OCT';
                case 'NOV':
                    return 'NOV';
                case 'DEZ':
                    return 'DEC';
                default:
                    return nomeMesPT;
            }
        }

        // BLOCO QUE CONTA A QUANTIDADE SERVIÇO EM EXCESSO DE OFICIAS E PRAÇAS
        const nomeMesConvert = converterMesPTparaEN(nomeMes);
        const ttServOf = await db.escalas.findAll({
            attributes: [
                'matricula',
                [Sequelize.fn('SUM', Sequelize.col('ttcota')), 'count']
            ],
            where: {
                data_inicio: {
                    [Op.and]: [
                        Sequelize.literal(`DATE_FORMAT(data_inicio, '%b') = '${nomeMesConvert}'`),
                        Sequelize.literal(`YEAR(data_inicio) = ${nomeAno}`)
                    ]
                },
                pg: ['2º TEN', '1º TEN', 'CAP', 'MAJ', 'TC', 'CEL'],
                idome:req.user.dataValues.omeId,
            },
            group: ['matricula'],
            
        });
        const ttServicoOf = ttServOf.length;

        
        // BLOCO QUE CONTA A QUANTIDADE SERVIÇO EM EXCESSO DE OFICIAS E PRAÇAS
        const ttServPrc = await db.escalas.findAll({
            attributes: [
                'matricula',
                [Sequelize.fn('SUM', Sequelize.col('ttcota')), 'count']
            ],
            where: {
                data_inicio: {
                    [Op.and]: [
                        Sequelize.literal(`DATE_FORMAT(data_inicio, '%b') = '${nomeMesConvert}'`),
                        Sequelize.literal(`YEAR(data_inicio) = ${nomeAno}`)
                    ]
                },
                pg: ['SD', 'CB', '3º SGT', '2º SGT', '1º SGT', 'ST'],
                idome:req.user.dataValues.omeId,
            },
            group: ['matricula'],
            
        });
        const ttServicoPrc = ttServPrc.length;

        const totalcotaOfDistGeral = totalcotaOfDistUnidade + totalcotaOfDistPe + totalcotaOfDistTi + totalcotaOfDistEnem;
        const totalcotaPrcDistGeral = totalcotaPrcDistUnidade + totalcotaPrcDistPe + totalcotaPrcDistTi + totalcotaPrcDistEnem;

        const saldocotaOfGeral = totalcotaOfDistGeral - ttServicoOf;
        const saldocotaPrcGeral = totalcotaPrcDistGeral - ttServicoPrc;



        // INICIO -  CONSULTA PARA TRAZER O REMANESCENTE DE OFICIAIS ANUAL
        const dataAtual = new Date();
        const anoAtual = dataAtual.getFullYear();
        const mesAtual = dataAtual.getMonth() + 1; // Mês atual (janeiro é 0, fevereiro é 1, ..., dezembro é 11)

        const somaCtgeralinicialof = await db.tetopjes.sum('ctgeralinicialof', {
            where: {
                ano: anoAtual,
                mes: {[Sequelize.Op.lte]: mesAtual},
            }
        });
        
        const somaTtofexe = await db.pjesgercota.sum('ttofexe', {
                where: {
                    ano: anoAtual,
                    mes: {[Sequelize.Op.lte]: mesAtual},
                    operacao: {[Sequelize.Op.like]: 'PJES GOVERNO%'}
                }
            });

        const saldoCtRenOfAnual = somaCtgeralinicialof - somaTtofexe;
        // FIM -  CONSULTA PARA TRAZER O REMANESCENTE DE OFICIAIS ANUAL
        

        // INICIO -  CONSULTA PARA TRAZER O REMANESCENTE DE PRAÇAS ANUAL
        const somaCtgeralinicialprc = await db.tetopjes.sum('ctgeralinicialprc', {
            where: {
                ano: anoAtual,
                mes: { [Sequelize.Op.lte]: mesAtual } // A soma é Somente até o mês atual
            }});
        const somaTtprcexe = await db.pjesgercota.sum('ttprcexe', {
            where: {
                ano:anoAtual,
                mes: { [Sequelize.Op.lte]: mesAtual },
                operacao: {[Sequelize.Op.like]: 'PJES GOVERNO%'},
            }
        });
        const saldoCtRenPrcAnual = somaCtgeralinicialprc - somaTtprcexe;
        // FIM -  CONSULTA PARA TRAZER O REMANESCENTE DE PRAÇAS ANUAL



        // INICIO -  CONSULTA PARA TRAZER O TETO DE OFICIAIS E PRAÇAS DA TABELA tetopjes
        const ttgeralinicialofmes = await db.tetopjes.findOne({
            attributes: ['id', 'ctgeralinicialof', 'ctgeralinicialprc', 'mes', 'ano'],
            where: {
                ano: anoAtual,
                mes: { [Sequelize.Op.lte]: mesAtual } // A soma é Somente até o mês atual
            }});


        //---CALCULO TOTAL - PARTE SUPERIOR DA TELA PJES | INICIO
        const ctGeralInicialOf = ttgeralinicialofmes.ctgeralinicialof; //Passando os valores da consulta acima
        const ctGeralInicialPrc = ttgeralinicialofmes.ctgeralinicialprc; //Passando os valores da consulta acima
        const valorGeralInicial = ctGeralInicialOf*300 + ctGeralInicialPrc*200;

        const totalcotaOfDistGov = totalcotaOfDistUnidade;
        const totalcotaPrcDistGov = totalcotaPrcDistUnidade; 
        const totalcotaDistGov = totalcotaOfDistGov + totalcotaPrcDistGov;

        const totalcotaOfExeGov = totalcotaOfExeUnidade;
        const totalcotaPrcExeGov = totalcotaPrcExeUnidade; 
        const totalcotaExeGov = totalcotaOfExeGov + totalcotaPrcExeGov;

        const ctAtualOf = ctGeralInicialOf - totalcotaOfDistGov;
        const ctAtualPrc = ctGeralInicialPrc - totalcotaPrcDistGov;


        //TOTAL DE EVENTOS CADASTRADOS PARA A OME | COUNT
        const queryPjes = await db.pjes.count({
            where: {idome:req.user.dataValues.omeId, mes, ano, },
        });


        function converterMesPTparaEN(nomeMesPT) {
            switch (nomeMesPT) {
                case 'JAN':
                    return 'JAN';
                case 'FEV':
                    return 'FEB';
                case 'MAR':
                    return 'MAR';
                case 'ABR':
                    return 'APR';
                case 'MAI':
                    return 'MAY';
                case 'JUN':
                    return 'JUN';
                case 'JUL':
                    return 'JUL';
                case 'AGO':
                    return 'AUG';
                case 'SET':
                    return 'SEP';
                case 'OUT':
                    return 'OCT';
                case 'NOV':
                    return 'NOV';
                case 'DEZ':
                    return 'DEC';
                default:
                    return nomeMesPT;
            }
        }

        // BLOCO QUE CONTA A QUANTIDADE SERVIÇO EM EXCESSO DE OFICIAS E PRAÇAS
        const nomeMesConvertido = converterMesPTparaEN(nomeMes);

        const ttServExcessoOf = await db.escalas.findAll({
            attributes: [
                'matricula',
                [Sequelize.fn('SUM', Sequelize.col('ttcota')), 'count']
            ],
            where: {
                data_inicio: {
                    [Op.and]: [
                        Sequelize.literal(`DATE_FORMAT(data_inicio, '%b') = '${nomeMesConvertido}'`),
                        Sequelize.literal(`YEAR(data_inicio) = ${nomeAno}`)
                    ]
                },
                pg: ['2º TEN', '1º TEN', 'CAP', 'MAJ', 'TC', 'CEL']
            },
            group: ['matricula'],
            having: Sequelize.literal('count > 12') // Condição para contar mais de 12 vezes
        });
        const ttServExcOf = ttServExcessoOf.length;
    
        // BLOCO QUE CONTA A QUANTIDADE SERVIÇO EM EXCESSO DE OFICIAS E PRAÇAS
        const ttServExcessoPrc = await db.escalas.findAll({
            attributes: [
                'matricula',
                [Sequelize.fn('SUM', Sequelize.col('ttcota')), 'count']
            ],
            where: {
                data_inicio: {
                    [Op.and]: [
                        Sequelize.literal(`DATE_FORMAT(data_inicio, '%b') = '${nomeMesConvertido}'`),
                        Sequelize.literal(`YEAR(data_inicio) = ${nomeAno}`)
                    ]
                },
                pg: ['SD', 'CB', '3º SGT', '2º SGT', '1º SGT', 'ST']
            },
            group: ['matricula'],
            having: Sequelize.literal('count > 12') // Condição para contar mais de 12 vezes
        });
        const ttServExcPrc = ttServExcessoPrc.length;

        // MOSTRA O VALOR TOTAL DE EXCESSO DE OFICIAIS E PRAÇAS
        const valorttServExc = (parseFloat(ttServExcOf) * 300) + (parseFloat(ttServExcPrc) * 200);

        //TOTAL DE POLICIAIS IMPEDIDOS COM COTA NA OME | COUNT   
        const contagemImpedidos = await db.escalas.count({
            attributes: ['id','operacao', 'cod', 'nunfunc', 'pg', 'matricula', 'nome','telefone','status', 'modalidade', 'data_inicio', 'hora_inicio', 'data_fim', 'hora_fim', 'ome_sgpm', 'localap', 'anotacoes', 'idevento', 'idome', 'createdAt', 'updatedAt'],
                where: Sequelize.literal(`
                    DATE_FORMAT(data_inicio, '%b') = '${nomeMesConvertido}' AND
                    YEAR(data_inicio) = ${nomeAno} AND
                    idome = ${req.user.dataValues.omeId} AND
                    status = 'IMPEDIDO'`),
        });
        

        // INICIO BLOCO QUE CONTA A QUANTIDADE REMANESCENTE DE OFICIAS E PRAÇAS
        const SequelizeRem = require('sequelize');
        const total_cotadistRen = await db.pjes.findAll({
            attributes: [
                'id', 'operacao', 'evento', 'cotaofdist', 'cotaprcdist', 'mes', 'idome', 'iduser', 'obs',
                [SequelizeRem.literal('SUM(cotaofdist)'), 'total_cotaofdist'],
                [SequelizeRem.literal('SUM(cotaprcdist)'), 'total_cotaprcdist'],
                [SequelizeRem.literal('SUM(cotaofdist) * 300'), 'total_cotaofdist_multiplicado'],
                [SequelizeRem.literal('SUM(cotaprcdist) * 200'), 'total_cotaprcdist_multiplicado']
            ],
            where: { 
                mes,
                ano,
                idome:req.user.dataValues.omeId,
                operacao: "PJES GOVERNO REMANESCENTE",
            },
            
            raw: true,
        });

        const valorCotaOfDistRen = parseFloat(total_cotadistRen[0]?.total_cotaofdist_multiplicado) || 0;
        const valorCotaPrcDistRen = parseFloat(total_cotadistRen[0]?.total_cotaprcdist_multiplicado) || 0;
        const totalcotaOfDistRen = valorCotaOfDistRen/300;
        const totalcotaPrcDistRen = valorCotaPrcDistRen/200;

        const totalFinalDistRen = valorCotaOfDistRen + valorCotaPrcDistRen;
    
            SaldoAnualOfGov = ctGeralInicialOf - totalcotaOfExeGov;
            SaldoAnualPrcGov = ctGeralInicialPrc - totalcotaPrcExeGov;
        // FIM BLOCO QUE CONTA A QUANTIDADE REMANESCENTE DE OFICIAS E PRAÇAS


        const user = await db.users.findOne({
            attributes: ['id', 'name', 'email', 'image', 'situationId', 'omeId', 'createdAt'],
            where: {
                id: req.user.dataValues.id
            },
            include: [{
                model: db.situations,
                attributes: ['nameSituation']
            }]
        });


        // Consulta para obter os Pjes com inclusão da soma de escalas onde pg = 'ST' ou 'CB' e 'CEL' ou 'MAJ'
        await db.pjes.findAll({
            attributes: [
                'id', 'operacao', 'evento', 'cotaofdist', 'cotaprcdist', 'mes', 'idome', 'iduser', 'obs',
                // Subconsulta para contar pg = 'ST' ou 'CB'
                [
                    Sequelize.literal(`(
                        SELECT SUM(ttcota)
                        FROM escalas 
                        WHERE escalas.idevento = pjes.id
                        AND (escalas.pg = 'ST' OR escalas.pg = '1º SGT'
                            OR escalas.pg = '2º SGT'  OR escalas.pg = '3º SGT' 
                            OR escalas.pg = 'CB'  OR escalas.pg = 'SD')
                    )`),
                    'count_pg_prc'
                ],
                // Subconsulta para contar pg = 'CEL' ou 'MAJ'
                [
                    Sequelize.literal(`(
                        SELECT SUM(ttcota)
                        FROM escalas 
                        WHERE escalas.idevento = pjes.id
                        AND (escalas.pg = 'CEL' OR escalas.pg = 'TC'
                            OR escalas.pg = 'MAJ'  OR escalas.pg = 'CAP' 
                            OR escalas.pg = '1º TEN'  OR escalas.pg = '2º TEN')
                    )`),
                    'count_pg_of'
                ]
            ],
            where: {
                ano, mes, idome:req.user.dataValues.omeId
            },
            order: [['id', 'DESC']],
            include: [
                { model: db.omes, attributes: ['nome'] },
                { model: db.users, attributes: ['name'] }
            ],
            
        })
        .then((pjes) => {

            if (pjes.length !== 0) {
                
                    res.render("unidade/unidadepjes/list", {
                    layout: 'main', profile: req.user.dataValues, user, nomeMes, nomeAno, sidebarSituations: true,
                    pjes: pjes.map(id => id.toJSON()),
                    valorFinalDistUnidade, valorFinalExeUnidade, saldoFinalUnidade, total_cotadistunidade, total_cotaexeunidade, totalcotaOfDistUnidade,
                    totalcotaPrcDistUnidade, totalcotaOfExeUnidade, totalcotaPrcExeUnidade,

                    valorFinalDistPe, valorFinalExePe, saldoFinalPe, total_cotadistpe,
                    total_cotaexepe, totalcotaOfDistPe, totalcotaPrcDistPe, totalcotaOfExePe,
                    totalcotaPrcExePe,

                    valorFinalDistTi, valorFinalExeTi, saldoFinalTi, total_cotadistti,
                    total_cotaexeti, totalcotaOfDistTi, totalcotaPrcDistTi, totalcotaOfExeTi,
                    totalcotaPrcExeTi,

                    valorFinalDistEnem, valorFinalExeEnem, saldoFinalEnem, total_cotadistenem,
                    total_cotaexeenem, totalcotaOfDistEnem, totalcotaPrcDistEnem, totalcotaOfExeEnem,
                    totalcotaPrcExeEnem,

                    totalcotaOfDistGeral, queryPjes, contagemImpedidos, totalcotaPrcDistGeral, saldocotaOfGeral, saldocotaPrcGeral,

                    ctAtualOf,ctAtualPrc, valorGeralInicial, ctGeralInicialOf, ctGeralInicialPrc, valorGeralInicial,
                    totalcotaDistGov, totalcotaExeGov, totalcotaOfDistGov, totalcotaPrcDistGov, totalcotaOfExeGov,
                    totalcotaPrcExeGov, ttServExcOf, ttServExcPrc, valorttServExc, totalFinalDistRen, totalcotaOfDistRen,
                    totalcotaPrcDistRen, SaldoAnualOfGov, SaldoAnualPrcGov, saldoCtRenOfAnual, saldoCtRenPrcAnual,

                    
                });
            } else {
                res.render("unidade/unidadepjes/list", {
                    layout: 'main', profile: req.user.dataValues, sidebarSituations: true, danger_msg: 'Erro: Nenhum Evento Cadastrado!'
                });
            }

        })
        .catch(() => {
            res.render("unidade/unidadepjes/list", {
                layout: 'main', profile: req.user.dataValues, sidebarSituations: true, danger_msg: 'Erro: Nenhum Evento Cadastrado!'
            });
        });

});



// Criar a rota para página visualizar os detalhes do registro, usar a função eAdmin com middleware para verificar se o usuário está logado
router.get('/view/:id', eAdmin, async (req, res) => {

    const nomeMes = req.session.mes;
    const { id } = req.params;
    const pjes = await db.pjes.findOne({
        attributes: ['id', 'operacao', 'evento', 'cotaofdist', 'cotaprcdist', 'mes', 'idome', 'iduser', 'obs','sei', 'ano', 'createdAt', 'updatedAt'],
        where: {
            id
        },
        include: [
            {model: db.omes, attributes: ['nome'],},
            {model: db.users, attributes: ['name'],}
        ],
    });

    const { Op } = require('sequelize');
    const escalas = await db.escalas.findAll({
        attributes: ['id', 'operacao', 'pg', 'matricula', 'nome', 'telefone', 'status', 'modalidade', 'data_inicio', 'hora_inicio', 'data_fim', 'hora_fim', 'ome_sgpm', 'localap', 'anotacoes', 'idevento', 'createdAt', 'updatedAt'],
        where: {
            idevento: id
        },
    });

    // Função para mapear abreviações de meses em português para inglês
    function converterMesPTparaEN(nomeMesPT) {
        switch (nomeMesPT) {
            case 'JAN':
                return 'JAN';
            case 'FEV':
                return 'FEB';
            case 'MAR':
                return 'MAR';
            case 'ABR':
                return 'APR';
            case 'MAI':
                return 'MAY';
            case 'JUN':
                return 'JUN';
            case 'JUL':
                return 'JUL';
            case 'AGO':
                return 'AUG';
            case 'SET':
                return 'SEP';
            case 'OUT':
                return 'OCT';
            case 'NOV':
                return 'NOV';
            case 'DEZ':
                return 'DEC';
            default:
                return nomeMesPT;
        }
    }

    const nomeMesConvertido = converterMesPTparaEN(nomeMes);
    const ttservMes = await db.escalas.findAll({
        attributes: [
            'matricula',
            [
                Sequelize.literal(`'${nomeMesConvertido}'`),
                'ttservMes'
            ],
            [Sequelize.fn('SUM', Sequelize.col('ttcota')), 'totalRegistros']
        ],
        where: Sequelize.literal(`DATE_FORMAT(data_inicio, '%b') = '${nomeMesConvertido}'`),
        group: ['matricula']
    });
    
    // Criar um mapa para mapear matrícula para totalRegistros
    const totalRegistrosPorMatricula = {};
    ttservMes.forEach(item => {
        totalRegistrosPorMatricula[item.matricula] = item.dataValues.totalRegistros;
    });

    // Atualizar escalas com totalRegistros
    escalas.forEach(escala => {
        const matricula = escala.matricula.toString();
        escala.dataValues.ttservMes = totalRegistrosPorMatricula[matricula] || 0;
    });

    const cotaofexe = await db.escalas.sum('ttcota', {
        where: {
            idevento:id,
            pg: ['2º TEN', '1º TEN', 'CAP', 'MAJ', 'TC', 'CEL'],
        }
    });
    
    const cotaprcexe = await db.escalas.sum('ttcota', {
        where: {
            idevento:id,
            pg: ['SD', 'CB', '3º SGT', '2º SGT', '1º SGT', 'ST']
        }
    });
    
    const valorofexe =  cotaofexe * 300;
    const valorprcexe = cotaprcexe * 200;

    // Acessa o IF se encontrar o registro no banco de dados
    if (pjes) {
        const valorofdist = pjes.dataValues.cotaofdist * 300;
        const valorprcdist = pjes.dataValues.cotaprcdist * 200;

        const valorttdist = valorofdist+valorprcdist;
        const valorttexe = valorofexe+valorprcexe;

        const formatoMoedaBrasileira = new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
          });

        const valortotaldistribuido = formatoMoedaBrasileira.format(valorttdist);
        const valortotalexecutado = formatoMoedaBrasileira.format(valorttexe);

        res.render("unidade/unidadepjes/view", { layout: 'main', profile: req.user.dataValues, nomeMes, sidebarSituations: true, pjes, ttservMes, escalas: escalas.map(id => id.toJSON()), valorofdist, valorprcdist, valortotaldistribuido, cotaofexe, cotaprcexe, valortotalexecutado, id: id  });
        
    } else {
        // Criar a mensagem de erro
        req.flash("danger_msg", "Erro: PJES não encontrado!");
        // Redirecionar o usuário
        res.redirect('/unidadepjes');
    }
});


// Criar a rota para página com formulário cadastrar situação, usar a função eAdmin com middleware para verificar se o usuário está logado
router.get('/escalas', eAdmin, async (req, res) => {

    const nomeMes = req.session.mes;    
    var dataForm = [];
    const omes = await db.omes.findAll({
        attributes: ['id', 'nome'],
        order: [['nome', 'ASC']]
    });

    if (omes) {
        dataForm['omes'] = omes;
    }


    
    res.render('unidade/unidadepjes/add', { layout: 'main', profile: req.user.dataValues, nomeMes, data: dataForm, sidebarSituations: true });

});


const moment = require('moment');
moment.locale('pt-br');

router.post('/escalas/:id', eAdmin, async (req, res) => {
    const nomeMes = req.session.mes;
    const { data_inicio, hora_inicio, hora_fim, data_fim, ...dataFormulario } = req.body;

    // Adicionar `hora_inicio`, `hora_fim`, e `data_fim` ao `dataFormulario`
    dataFormulario.hora_inicio = hora_inicio;
    dataFormulario.hora_fim = hora_fim;
    dataFormulario.data_fim = data_fim;

    const schema = yup.object().shape({
        nome: yup.string().required("Erro: Necessário preencher o campo nome!")
    });

    const escalas = await db.pjes.findOne({
        attributes: ['id', 'operacao', 'evento', 'cotaofdist', 'cotaprcdist', 'mes', 'idome', 'iduser', 'obs', 'sei', 'ano', 'createdAt', 'updatedAt'],
        where: {
            id: req.params.id
        },
        include: [
            { model: db.omes, attributes: ['nome'] },
            { model: db.users, attributes: ['name'] }
        ]
    });

    // Mapear o código para operação
    const operationCodes = {
        'PJES GOVERNO REGULAR': 247,
        'PJES CTM (BRT)': 255,
        'PJES PATRULHA ESCOLAR': 263,
        'PJES GOVERNO REMANESCENTE': 248,
        'PJES OPER CONVIVÊNCIA': 249,
        'PJES GOVERNO OP ENEM': 250,
        'PJES ALEPE': 251,
        'PJES TJPE': 252,
        'PJES MPPE': 253,
        'PJES PREFEITURA DE RECIFE': 254,
        'PJES CBTU': 256,
        'PJES CPRH': 257,
        'PJES SEMOC PCR': 265
    };
    
    dataFormulario.cod = operationCodes[dataFormulario.operacao] || null;

    if (!escalas) {
        return res.status(404).send('Evento não encontrado.');
    }

    // Calcular a data limite para cadastro (60 dias após a criação do evento)
    const dataLimiteCadastro = moment(escalas.createdAt).add(60, 'days');
    const dataInicioMoment = moment(data_inicio, 'YYYY-MM-DD');

    // Verificar se a data de início está dentro do período permitido
    if (dataInicioMoment.isAfter(dataLimiteCadastro)) {
        return res.redirect('/unidade/unidadepjes/view/' + escalas.id);
    }

    // Calcular a diferença total entre data_inicio + hora_inicio e data_fim + hora_fim
    const dataInicioHoraMoment = moment(`${data_inicio} ${hora_inicio}`, 'YYYY-MM-DD HH:mm');
    const dataFimHoraMoment = moment(`${data_fim} ${hora_fim}`, 'YYYY-MM-DD HH:mm');

    // Calcular a duração total em horas
    const duracaoHoras = dataFimHoraMoment.diff(dataInicioHoraMoment, 'hours', true);

    // Definir o valor de ttcota baseado na hora_inicio e hora_fim
    if (hora_inicio === hora_fim) {
        dataFormulario.ttcota = 2;
    } else {
        dataFormulario.ttcota = 1;
    }

    // Verificar se todos os campos passaram pela validação
    try {
        await schema.validate(dataFormulario);
    } catch (error) {
        return res.render('/unidade/unidadepjes/view/' + escalas.id, { 
            layout: 'main', 
            profile: req.user.dataValues, 
            nomeMes, 
            sidebarSituations: true, 
            data: { ...dataFormulario, data_inicio }, 
            danger_msg: error.errors 
        });
    }

    //CONSULTA PARA VERIFICAR O LIMITE DE COTA DE OFICIAIS DISTRIBUIDA POR EVENTO
    const ttLimitctof = await db.pjes.sum('cotaofdist', {where: {id: req.params.id,}});

    //CONSULTA PARA VERIFICAR O LIMITE DE COTA DE OFICIAIS EXECUTADAS POR EVENTO
    const cotaofexe = await db.escalas.sum('ttcota', {where: { idevento: req.params.id, pg: ['2º TEN', '1º TEN', 'CAP', 'MAJ', 'TC', 'CEL'] }});

    //CONSULTA PARA VERIFICAR O LIMITE DE COTA DE OFICIAIS DISTRIBUIDA POR EVENTO
    const ttLimitctprc = await db.pjes.sum('cotaprcdist', {where: {id: req.params.id,}});

    //CONSULTA PARA VERIFICAR O LIMITE DE COTA DE OFICIAIS EXECUTADAS POR EVENTO
    const cotaprcexe = await db.escalas.sum('ttcota', {where: { idevento: req.params.id, pg: ['ST', '1º SGT', '2º SGT', '3º SGT', 'CB', 'SD'] }});

    let errorMessage = "";

    if (dataFormulario.pg === 'CEL' || dataFormulario.pg === 'TC' ||
        dataFormulario.pg === 'MAJ' || dataFormulario.pg === 'CAP' ||
        dataFormulario.pg === '1º TEN' || dataFormulario.pg === '2º TEN' ||
        dataFormulario.pg === 'ASP') {
        if (dataFormulario.ttcota + cotaofexe > ttLimitctof) {
            console.log("Limite de Cotas das oficiais atingido");
            errorMessage += "Atenção. Limite de Cotas de Oficiais foi atingido. ";
        }
    }

    if (dataFormulario.pg === 'ST' || dataFormulario.pg === '1º SGT' ||
        dataFormulario.pg === '2º SGT' || dataFormulario.pg === '3º SGT' ||
        dataFormulario.pg === 'CB' || dataFormulario.pg === 'SD') {
        if (dataFormulario.ttcota + cotaprcexe > ttLimitctprc) {
            console.log("Limite de Cotas das Praças foi atingido");
            errorMessage += "Atenção. Limite de Cotas de Praças foi atingido. ";
        }
    }

    if (errorMessage) {
        req.flash("danger_msg", errorMessage);
        return res.redirect('/unidade/unidadepjes/view/' + req.params.id);
    }
    
    // Extrair o mês do campo data_inicio e converter para o formato abreviado em português (FEV, MAR, etc.)
    const mesSelecionado = moment(data_inicio, 'YYYY-MM-DD').format('MMM').toUpperCase();

    // Comparar o mês do formulário com o mês da sessão
    if (mesSelecionado !== nomeMes) {
        return res.render("unidade/unidadepjes/list", { 
            layout: 'main', 
            profile: req.user.dataValues, 
            sidebarSituations: true, 
            data: { ...dataFormulario, data_inicio }, 
            danger_msg: "Erro: Mês diferente do selecionado!" 
        });
    }

    // Preparar os dados para salvar
    const dataSalvar = {
        ...dataFormulario,
        data_inicio: dataInicioMoment.format('YYYY-MM-DD'),
        idome: escalas.idome
    };

    // Cadastrar no banco de dados
    db.escalas.create(dataSalvar)
        .then(() => {
            req.flash("success_msg", "Policial Adicionado!");
            res.redirect('/unidade/unidadepjes/view/' + escalas.id);
        })
        .catch(error => {
            console.error("Erro ao salvar no banco de dados:", error);
            return res.render("unidade/unidadepjes/list", { 
                layout: 'main', 
                profile: req.user.dataValues, 
                nomeMes, 
                sidebarSituations: true, 
                data: { ...dataFormulario, data_inicio }, 
                danger_msg: "Erro: Pjes não cadastrado com sucesso!" 
            });
        });
});


// Criar a rota apagar situação no BD, usar a função eAdmin com middleware para verificar se o usuário está logado
router.get('/deleteEscala/:id', eAdmin, async (req, res) => {

    // Recuperar o registro do banco de dados para verificar se a situação está sendo utilizada por algum usuário
    const escalas = await db.escalas.findOne({
        // Indicar quais colunas recuperar
        
        attributes: ['id'],
        // Acrescentar condição para indicar qual registro deve ser retornado do banco de dados
        where: {
            id:req.params.id
        }
    });

    // Apagar usuário no banco de dados utilizando a MODELS situations
    db.escalas.destroy({
        // Acrescentar o WHERE na instrução SQL indicando qual registro excluir no BD
        where: {
            id: req.params.id
        }

    }).then(() => {

        // Criar a mensagem de situação apagada com sucesso
        req.flash("success_msg", "Policial apagado com sucesso!");

        // Redirecionar o usuário após apagar com sucesso
        res.redirect('/unidade/unidadepjes/view/');
        
    }).catch(() => {
        // Criar a mensagem de situação não apagada
        req.flash("danger_msg", "Policial não apagado com sucesso!");

        // Redirecionar o usuário após não apagar
        res.redirect('/unidade/unidadepjes/view/');
    })    
});

//SQL para buscar os dados do PM na tabela SGPM e retornar para o AJAX
let dadosSgpms = {};
router.get('/buscarSgpm/:matricula', async (req, res) => {
    const matricula = req.params.matricula;

    try {
        const dadoSgpm = await db.sgpms.findOne({
            where: { matricula: matricula },
            attributes: ['id', 'pg', 'nome', 'ome', 'status', 'nunfunc','localap', 'createdAt', 'updatedAt']
        });

        if (dadoSgpm) {
            // Preenche o objeto dadosSgpms com os dados encontrados no banco de dados
            dadosSgpms[matricula] = {
                pg: dadoSgpm.pg,
                nome: dadoSgpm.nome,
                ome: dadoSgpm.ome,
                status: dadoSgpm.status,
                nunfunc: dadoSgpm.nunfunc,
                localap: dadoSgpm.localap    
            };
            res.json(dadoSgpm); // Retorna o dadoSgpm encontrado como JSON (opcional)
        } else {
            res.status(404).send('dadoSgpm não encontrado');
        }
    } catch (error) {
        console.error('Erro ao buscar dadoSgpm:', error);
        res.status(500).send('Erro interno ao buscar dadoSgpm');
    }
});


router.get('/gerar-arquivo-xls', eAdmin, async (req, res) => {    
    const idEvento = req.query.id;
    const nomeMes = req.session.mes;
    const nomeAno = req.session.ano;
    const idOmePrestCont = req.user.dataValues.omeId;

    function converterMesPTparaEN(nomeMesPT) {
        switch (nomeMesPT) {
            case 'JAN':
                return 'JAN';
            case 'FEV':
                return 'FEB';
            case 'MAR':
                return 'MAR';
            case 'ABR':
                return 'APR';
            case 'MAI':
                return 'MAY';
            case 'JUN':
                return 'JUN';
            case 'JUL':
                return 'JUL';
            case 'AGO':
                return 'AUG';
            case 'SET':
                return 'SEP';
            case 'OUT':
                return 'OCT';
            case 'NOV':
                return 'NOV';
            case 'DEZ':
                return 'DEC';
            default:
                return nomeMesPT;
        }
    }
    
    try {

        const nomeMesConvertido = converterMesPTparaEN(nomeMes);
        const escalas = await db.escalas.findAll({
            attributes: ['id','operacao', 'cod', 'nunfunc', 'pg', 'matricula', 'nome','telefone','status', 'modalidade', 'data_inicio', 'hora_inicio', 'data_fim', 'hora_fim', 'ome_sgpm', 'localap', 'anotacoes', 'idevento', 'idome', 'createdAt', 'updatedAt'],
            where: Sequelize.literal(`DATE_FORMAT(data_inicio, '%b') = '${nomeMesConvertido}' AND YEAR(data_inicio) = ${nomeAno} AND idome = ${idOmePrestCont}`),
        });
    
        // Verificação dos dados retornados
        if (!escalas || escalas.length === 0) {
            throw new Error('Nenhuma escala encontrada para os critérios especificados.');
        }


        // CONTAGEM DO PJES GOVERNO REGULAR
        let countD2 = 0;
        let countD3 = 0;
        escalas.forEach(escala => {
            if ((escala.pg === 'CEL' || escala.pg === 'TC'|| escala.pg === 'MAJ'|| escala.pg === 'CAP'|| escala.pg === '1º TEN'|| escala.pg === '2º TEN'|| escala.pg === 'ASP') && escala.cod === 247) {
                countD2++;
            }
            if ((escala.pg === 'SUBTEN' || escala.pg === '1º SGT' || escala.pg === '2º SGT'|| escala.pg === '3º SGT'|| escala.pg === 'CB'|| escala.pg === 'SD') && escala.cod === 247) {
                countD3++;
            }
        });

        // CONTAGEM PJES CTM (BRT)
        let countG2 = 0;
        let countG3 = 0;
        escalas.forEach(escala => {
            if ((escala.pg === 'CEL' || escala.pg === 'TC'|| escala.pg === 'MAJ'|| escala.pg === 'CAP'|| escala.pg === '1º TEN'|| escala.pg === '2º TEN'|| escala.pg === 'ASP') && escala.cod === 255) {
                countG2++;
            }
            if ((escala.pg === 'SUBTEN' || escala.pg === '1º SGT' || escala.pg === '2º SGT'|| escala.pg === '3º SGT'|| escala.pg === 'CB'|| escala.pg === 'SD') && escala.cod === 255) {
                countG3++;
            }
        });


        // CONTAGEM DO PJES GOVERNO OP ENEM
        let countJ2 = 0;
        let countJ3 = 0;
        escalas.forEach(escala => {
            if ((escala.pg === 'CEL' || escala.pg === 'TC'|| escala.pg === 'MAJ'|| escala.pg === 'CAP'|| escala.pg === '1º TEN'|| escala.pg === '2º TEN'|| escala.pg === 'ASP') && escala.cod === 250) {
                countJ2++;
            }
            if ((escala.pg === 'SUBTEN' || escala.pg === '1º SGT' || escala.pg === '2º SGT'|| escala.pg === '3º SGT'|| escala.pg === 'CB'|| escala.pg === 'SD') && escala.cod === 250) {
                countJ3++;
            }
        });


        // CONTAGEM DO PJES PATRULHA ESCOLAR
        let countM2 = 0;
        let countM3 = 0;
        escalas.forEach(escala => {
            if ((escala.pg === 'CEL' || escala.pg === 'TC'|| escala.pg === 'MAJ'|| escala.pg === 'CAP'|| escala.pg === '1º TEN'|| escala.pg === '2º TEN'|| escala.pg === 'ASP') && escala.cod === 263) {
                countM2++;
            }
            if ((escala.pg === 'SUBTEN' || escala.pg === '1º SGT' || escala.pg === '2º SGT'|| escala.pg === '3º SGT'|| escala.pg === 'CB'|| escala.pg === 'SD') && escala.cod === 263) {
                countM3++;
            }
        });

        
        const workbook = new Excel.Workbook();
        const worksheet = workbook.addWorksheet('PJES_'+`${req.user.ome.dataValues.nome} - ${nomeMes}_${nomeAno}`);

        const fs = require('fs');
        const path = require('path');

        // Carregar a imagem
        const imagePath = path.join('public', 'images', 'logo', 'pmpe_logo.png');
        const image = fs.readFileSync(imagePath);

        // Adicionar a imagem ao workbook
        const imageId = workbook.addImage({
            buffer: image,
            extension: 'png',
        });

        // Adicionar a imagem ao worksheet
        worksheet.addImage(imageId, {
            tl: { col: 0, row: 0 },
            ext: { width: 60, height: 70 },
        });

        // Adicionando o nome no topo
        worksheet.mergeCells('A5:K5'); // Mescla as células de A1 até K1
        const headerCell = worksheet.getCell('A5');
        headerCell.value = 'PRESTAÇÃO DE CONTAS - PJES |'+`${req.user.ome.dataValues.nome} - ${nomeMes}_${nomeAno} | ${req.user.dataValues.name} - ${req.user.dataValues.telefone}`; // Substitua com o nome desejado
        headerCell.font = { size: 12, bold: true };
        headerCell.alignment = { horizontal: 'center' };
        headerCell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFF00' } // Cor de fundo amarela, substitua conforme necessário
    };

    
    // Adicionando cabeçalhos das colunas
    worksheet.addRow(['MATRICULA','OPERATIVA','NUNFUNC','NUNVINC', 'DT INICIO', 'DT TERMINO', 'QTD COTA', 'COD', 'TITULO', 'CARGO', 'NOME EXTENSO']);

    // Definindo o estilo dos cabeçalhos
    const headerRow = worksheet.getRow(6);
    headerRow.font = { color: { argb: 'FFFFFFFF' }, bold: true }; // Texto branco e negrito
    headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF000000' } // Fundo preto
    };
    headerRow.alignment = { horizontal: 'center' };

            // Definindo largura das colunas específicas
        worksheet.getColumn(1).width = 12;
        worksheet.getColumn(2).width = 25;
        worksheet.getColumn(3).width = 12;
        worksheet.getColumn(4).width = 12;
        worksheet.getColumn(5).width = 12;
        worksheet.getColumn(6).width = 12;
        worksheet.getColumn(7).width = 12;
        worksheet.getColumn(8).width = 12;
        worksheet.getColumn(9).width = 12;
        worksheet.getColumn(10).width = 12;
        worksheet.getColumn(11).width = 20;

        // Adicionando os dados das escalas ao arquivo XLS
        escalas.forEach(escala => {
            worksheet.addRow([
                escala.matricula,
                escala.operacao,
                escala.nunfunc,
                1,
                escala.data_inicio,
                escala.data_inicio, // Por padrão, estou assumindo que data_inicio e data_fim são formatados corretamente
                1,
                escala.cod,
                ' ',
                escala.pg,
                escala.nome,
            ]);
        });

        worksheet.getCell('C1:D1').value = 'PJES GOVERNO REGULAR';
        worksheet.getCell('C2').value = 'Oficiais';
        worksheet.getCell('C3').value = 'Praças';

        worksheet.getCell('D2').value = countD2;
        worksheet.getCell('D3').value = countD3;



        worksheet.getCell('F1:G1').value = 'PJES CTM (BRT)';
        worksheet.getCell('F2').value = 'Oficiais';
        worksheet.getCell('F3').value = 'Praças';

        worksheet.getCell('G2').value = countG2;
        worksheet.getCell('G3').value = countG3;


        worksheet.getCell('I1:J1').value = 'PJES GOVERNO OP ENEM';
        worksheet.getCell('I2').value = 'Oficiais';
        worksheet.getCell('I3').value = 'Praças';

        worksheet.getCell('J2').value = countJ2;
        worksheet.getCell('J3').value = countJ3;


        worksheet.getCell('L1:M1').value = 'PJES PATRULHA ESCOLAR';
        worksheet.getCell('L2').value = 'Oficiais';
        worksheet.getCell('L3').value = 'Praças';

        worksheet.getCell('M2').value = countM2;
        worksheet.getCell('M3').value = countM3;
    
        // Gerando o arquivo XLS
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=consulta_${idEvento}.xlsx`);
    
        // Escrevendo o arquivo XLS para a resposta
        await workbook.xlsx.write(res);
        res.end();
    
    } catch (error) {
        console.error('Erro ao gerar arquivo XLS:', error);
        res.status(500).send(`Erro ao gerar arquivo XLS: ${error.message}`);
    }
    
});

// Exportar a instrução que está dentro da constante router 
module.exports = router;
