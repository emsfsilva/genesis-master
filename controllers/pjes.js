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

    const countPjes = await db.pjes.count();
    
    if (countPjes === 0) {
        return res.render("admin/pjes/list", { layout: 'main', profile: req.user.dataValues, sidebarSituations: true, danger_msg: 'Erro: Nenhum pjes encontrada!' });
    }



//---DPO | INICIO

            //---DPO | INICIO TABELA DE COTAS DISTRIBUIDAS-------------------------------------------------------------------------
            const Sequelizedpo = require('sequelize');
            const total_cotadistdpo = await db.pjes.findAll({
            attributes: [
                'id', 'operacao', 'evento', 'cotaofdist', 'cotaprcdist', 'mes', 'idome', 'iduser', 'obs', 'ano',
                [Sequelizedpo.literal('SUM(cotaofdist)'), 'total_cotaofdist'],
                [Sequelizedpo.literal('SUM(cotaprcdist)'), 'total_cotaprcdist'],
                [Sequelizedpo.literal('SUM(cotaofdist) * 300'), 'total_cotaofdist_multiplicado'],
                [Sequelizedpo.literal('SUM(cotaprcdist) * 200'), 'total_cotaprcdist_multiplicado']
            ],
            where: {
                idome: [1, 65, 66, 67, 68, 69, 70, 71, 72, 73],
                mes,
                ano,
                operacao: {
                    [Sequelizedpo.Op.like]: 'PJES GOVERNO%'
                },
            },
            include: [
                { model: db.omes, attributes: ['nome'] },
                { model: db.users, attributes: ['name'] }
            ],
            group: ['idome', 'ome.nome', 'user.name'],
            raw: true,
        });


        //----DPO | INICIO TABELA DE COTAS EXECUTADAS-------------------------------------------------------------------------
            const SequelizeExecutdpo = require('sequelize');
            const total_cotaexedpo = await db.pjesgercota.findAll({
                attributes: [
                    'id', 'operacao', 'id_ome', 'ttofexe', 'ttprcexe', 'status', 'mes', 'ano', 'obs',
                    [SequelizeExecutdpo.literal('SUM(ttofexe)'), 'total_cotaofexe'],
                    [SequelizeExecutdpo.literal('SUM(ttprcexe)'), 'total_cotaprcexe'],
                    [SequelizeExecutdpo.literal('SUM(ttofexe) * 300'), 'total_cotaofexe_multiplicado'],
                    [SequelizeExecutdpo.literal('SUM(ttprcexe) * 200'), 'total_cotaprcexe_multiplicado']
                ],
                where: 
                    {id_ome:[1, 65, 66, 67, 68, 69, 70, 71, 72, 73],
                    mes,
                    ano,
                    operacao: {
                        [SequelizeExecutdpo.Op.like]: 'PJES GOVERNO%'
                    },
                },
                include: [
                    { model: db.omes, attributes: ['nome'] },
                ],
                group: ['id_ome', 'ome.nome'],
                raw: true,
            });

        //--- DPO | INICIO CALCULAR OS VALORES TOTAIS POR DIRETORIA-------------------------------------------------------------------------

        //VALOR FINAL DE COTAS DISTRIBUIDAS OFICIAIS DPO
            const SequelizeDistDpo = require('sequelize');
            const valorfinal_cotadistdpo = await db.pjes.findAll({
                attributes: [
                    [SequelizeDistDpo.literal('SUM(cotaofdist) * 300'), 'valor_cotaofdist_multiplicado'],
                    [SequelizeDistDpo.literal('SUM(cotaprcdist) * 200'), 'valor_cotaprcdist_multiplicado']
                ],
                where: {idome:[1, 65, 66, 67, 68, 69, 70, 71, 72, 73],
                        mes,
                        ano,
                        operacao: {
                            [SequelizeDistDpo.Op.like]: 'PJES GOVERNO%'
                        },
                },
                raw: true,
            });

        //VALOR DE COTAS EXECUTADAS OFICIAIS DPO
            const SequelizeExecutDpo = require('sequelize');
            const valorfinal_cotaexedpo = await db.pjesgercota.findAll({
                attributes: [
                    [SequelizeExecutDpo.literal('SUM(ttofexe) * 300'), 'valor_cotaofexe_multiplicado'],
                    [SequelizeExecutDpo.literal('SUM(ttprcexe) * 200'), 'valor_cotaprcexe_multiplicado']
                ],
                where: {id_ome:[1, 65, 66, 67, 68, 69, 70, 71, 72, 73],
                        mes,
                        ano,
                        operacao: {
                            [SequelizeExecutdpo.Op.like]: 'PJES GOVERNO%'
                        },
                },
                raw: true,
            });

        //---DPO | INICIO CALCULAR OS VALORES E COTAS TOTAIS POR DIRETORIA-------------------------------------------------------------------------

        // CALCULO DO VALOR DISTRIBUIDO
            const valorCotaOfDistDpo = parseFloat(valorfinal_cotadistdpo[0]?.valor_cotaofdist_multiplicado) || 0;
            const valorCotaPrcDistDpo = parseFloat(valorfinal_cotadistdpo[0]?.valor_cotaprcdist_multiplicado) || 0;
            const valorFinalDistDpo = valorCotaOfDistDpo + valorCotaPrcDistDpo;

        // CALCULO DO TOTAL DE COTAS DISTRIBUIDAS
            const totalcotaOfDistDpo = valorCotaOfDistDpo/300;
            const totalcotaPrcDistDpo = valorCotaPrcDistDpo/200;


        // CALCULO DO VALOR EXECUTADO
            const valorCotaOfExeDpo = parseFloat(valorfinal_cotaexedpo[0]?.valor_cotaofexe_multiplicado) || 0;
            const valorCotaPrcExeDpo = parseFloat(valorfinal_cotaexedpo[0]?.valor_cotaprcexe_multiplicado) || 0;
            const valorFinalExeDpo = valorCotaOfExeDpo + valorCotaPrcExeDpo;

        // CALCULO DO TOTAL DE COTAS EXECUTADAS
            const totalcotaOfExeDpo = valorCotaOfExeDpo/300;
            const totalcotaPrcExeDpo = valorCotaPrcExeDpo/200;

        // CALCULO DO SALDO FINAL
            const saldoFinalDpo = valorFinalDistDpo-valorFinalExeDpo;

        //---DPO | FIM CALCULAR OS VALORES E COTAS TOTAIS POR DIRETORIA-------------------------------------------------------------------------

//---DPO | FIM

//---DIM | INICIO

            //---DIM | INICIO TABELA DE COTAS DISTRIBUIDAS-------------------------------------------------------------------------
            const Sequelize = require('sequelize');
            const total_cotadistdim = await db.pjes.findAll({
                attributes: [
                    'id', 'operacao', 'evento', 'cotaofdist', 'cotaprcdist', 'mes', 'idome', 'iduser', 'obs',
                    [Sequelize.literal('SUM(cotaofdist)'), 'total_cotaofdist'],
                    [Sequelize.literal('SUM(cotaprcdist)'), 'total_cotaprcdist'],
                    [Sequelize.literal('SUM(cotaofdist) * 300'), 'total_cotaofdist_multiplicado'],
                    [Sequelize.literal('SUM(cotaprcdist) * 200'), 'total_cotaprcdist_multiplicado']
                ],
                where: 
                    {idome:[2, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17],
                    mes,
                    ano,
                    operacao: {
                        [SequelizeExecutdpo.Op.like]: 'PJES GOVERNO%'
                    },
                },
                include: [
                    { model: db.omes, attributes: ['nome'] },
                    { model: db.users, attributes: ['name'] }
                ],
                group: ['idome', 'ome.nome', 'user.name'],
                raw: true,
            });

        //----DIM | INICIO TABELA DE COTAS EXECUTADAS-------------------------------------------------------------------------
            const SequelizeExecut = require('sequelize');
            const total_cotaexedim = await db.pjesgercota.findAll({
                attributes: [
                    'id', 'operacao', 'id_ome', 'ttofexe', 'ttprcexe', 'status', 'mes', 'ano', 'obs',
                    [SequelizeExecut.literal('SUM(ttofexe)'), 'total_cotaofexe'],
                    [SequelizeExecut.literal('SUM(ttprcexe)'), 'total_cotaprcexe'],
                    [SequelizeExecut.literal('SUM(ttofexe) * 300'), 'total_cotaofexe_multiplicado'],
                    [SequelizeExecut.literal('SUM(ttprcexe) * 200'), 'total_cotaprcexe_multiplicado']
                ],
                where: 
                    {id_ome:[2, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17],
                    mes,
                    ano,
                    operacao: {
                        [SequelizeExecutdpo.Op.like]: 'PJES GOVERNO%'
                    },
                },
                include: [
                    { model: db.omes, attributes: ['nome'] },
                ],
                group: ['id_ome', 'ome.nome'],
                raw: true,
            });

        //--- DIM | INICIO CALCULAR OS VALORES TOTAIS POR DIRETORIA-------------------------------------------------------------------------

        //VALOR FINAL DE COTAS DISTRIBUIDAS OFICIAIS DIM
            const SequelizeDistDim = require('sequelize');
            const valorfinal_cotadistdim = await db.pjes.findAll({
                attributes: [
                    [SequelizeDistDim.literal('SUM(cotaofdist) * 300'), 'valor_cotaofdist_multiplicado'],
                    [SequelizeDistDim.literal('SUM(cotaprcdist) * 200'), 'valor_cotaprcdist_multiplicado']
                ],
                where: {idome:[2, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17],
                        mes,
                        ano,
                        operacao: {
                            [SequelizeExecutdpo.Op.like]: 'PJES GOVERNO%'
                        },
                },
                raw: true,
            });

        //VALOR DE COTAS EXECUTADAS OFICIAIS DIM
            const SequelizeExecutDim = require('sequelize');
            const valorfinal_cotaexedim = await db.pjesgercota.findAll({
                attributes: [
                    [SequelizeExecutDim.literal('SUM(ttofexe) * 300'), 'valor_cotaofexe_multiplicado'],
                    [SequelizeExecutDim.literal('SUM(ttprcexe) * 200'), 'valor_cotaprcexe_multiplicado']
                ],
                where: {id_ome:[2, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17],
                        mes,
                        ano,
                        operacao: {
                            [SequelizeExecutdpo.Op.like]: 'PJES GOVERNO%'
                        },
                },
                raw: true,
            });

        //---DIM | INICIO CALCULAR OS VALORES E COTAS TOTAIS POR DIRETORIA-------------------------------------------------------------------------

        // CALCULO DO VALOR DISTRIBUIDO
            const valorCotaOfDistDim = parseFloat(valorfinal_cotadistdim[0]?.valor_cotaofdist_multiplicado) || 0;
            const valorCotaPrcDistDim = parseFloat(valorfinal_cotadistdim[0]?.valor_cotaprcdist_multiplicado) || 0;
            const valorFinalDistDim = valorCotaOfDistDim + valorCotaPrcDistDim;

        // CALCULO DO TOTAL DE COTAS DISTRIBUIDAS
            const totalcotaOfDistDim = valorCotaOfDistDim/300;
            const totalcotaPrcDistDim = valorCotaPrcDistDim/200;


        // CALCULO DO VALOR EXECUTADO
            const valorCotaOfExeDim = parseFloat(valorfinal_cotaexedim[0]?.valor_cotaofexe_multiplicado) || 0;
            const valorCotaPrcExeDim = parseFloat(valorfinal_cotaexedim[0]?.valor_cotaprcexe_multiplicado) || 0;
            const valorFinalExeDim = valorCotaOfExeDim + valorCotaPrcExeDim;

        // CALCULO DO TOTAL DE COTAS EXECUTADAS
            const totalcotaOfExeDim = valorCotaOfExeDim/300;
            const totalcotaPrcExeDim = valorCotaPrcExeDim/200;

        // CALCULO DO SALDO FINAL
            const saldoFinalDim = valorFinalDistDim-valorFinalExeDim;

        //---DIM | FIM CALCULAR OS VALORES E COTAS TOTAIS POR DIRETORIA-------------------------------------------------------------------------

//---DIM | FIM

//---DIRESP | INICIO

        //---DIRESP | INICIO TABELA DE COTAS DISTRIBUIDAS-------------------------------------------------------------------------
            const SequelizeDistDiresp = require('sequelize');
            const total_cotadistdiresp = await db.pjes.findAll({
                attributes: [
                    'id', 'operacao', 'evento', 'cotaofdist', 'cotaprcdist', 'mes', 'idome', 'iduser', 'obs',
                    [SequelizeDistDiresp.literal('SUM(cotaofdist)'), 'total_cotaofdist'],
                    [SequelizeDistDiresp.literal('SUM(cotaprcdist)'), 'total_cotaprcdist'],
                    [SequelizeDistDiresp.literal('SUM(cotaofdist) * 300'), 'total_cotaofdist_multiplicado'],
                    [SequelizeDistDiresp.literal('SUM(cotaprcdist) * 200'), 'total_cotaprcdist_multiplicado']
                ],
                where: 
                    {idome:[3, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33],
                    mes,
                    ano,
                    operacao: {
                        [SequelizeExecutdpo.Op.like]: 'PJES GOVERNO%'
                    },
                },
                include: [
                    { model: db.omes, attributes: ['nome'] },
                    { model: db.users, attributes: ['name'] }
                ],
                group: ['idome', 'ome.nome', 'user.name'],
                raw: true,
            });

        //----DIRESP | INICIO TABELA DE COTAS EXECUTADAS-------------------------------------------------------------------------
            const SequelizeExecutDiresp = require('sequelize');
            const total_cotaexediresp = await db.pjesgercota.findAll({
                attributes: [
                    'id', 'operacao', 'id_ome', 'ttofexe', 'ttprcexe', 'status', 'mes', 'ano', 'obs',
                    [SequelizeExecutDiresp.literal('SUM(ttofexe)'), 'total_cotaofexe'],
                    [SequelizeExecutDiresp.literal('SUM(ttprcexe)'), 'total_cotaprcexe'],
                    [SequelizeExecutDiresp.literal('SUM(ttofexe) * 300'), 'total_cotaofexe_multiplicado'],
                    [SequelizeExecutDiresp.literal('SUM(ttprcexe) * 200'), 'total_cotaprcexe_multiplicado']
                ],
                where: 
                    {id_ome:[3, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33],
                    mes,
                    ano,
                    operacao: {
                        [SequelizeExecutdpo.Op.like]: 'PJES GOVERNO%'
                    },
                },
                include: [
                    { model: db.omes, attributes: ['nome'] },
                ],
                group: ['id_ome', 'ome.nome'],
                raw: true,
            });


        //--- DIRESP | INICIO CALCULAR OS VALORES TOTAIS POR DIRETORIA-------------------------------------------------------------------------

        //VALOR FINAL DE COTAS DISTRIBUIDAS OFICIAIS DIRESP
            const SequelizeValorDistDiresp = require('sequelize');
            const valorfinal_cotadistdiresp = await db.pjes.findAll({
                attributes: [
                    [SequelizeValorDistDiresp.literal('SUM(cotaofdist) * 300'), 'valor_cotaofdist_multiplicado'],
                    [SequelizeValorDistDiresp.literal('SUM(cotaprcdist) * 200'), 'valor_cotaprcdist_multiplicado']
                ],
                where: {idome:[3, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33],
                        mes,
                        ano,
                        operacao: {
                            [SequelizeExecutdpo.Op.like]: 'PJES GOVERNO%'
                        },
                },
                raw: true,
            });

        //VALOR DE COTAS EXECUTADAS OFICIAIS DIRESP
            const SequelizeValorExecutDiresp = require('sequelize');
            const valorfinal_cotaexediresp = await db.pjesgercota.findAll({
                attributes: [
                    [SequelizeValorExecutDiresp.literal('SUM(ttofexe) * 300'), 'valor_cotaofexe_multiplicado'],
                    [SequelizeValorExecutDiresp.literal('SUM(ttprcexe) * 200'), 'valor_cotaprcexe_multiplicado']
                ],
                where: {id_ome:[3, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33],
                        mes,
                        ano,
                        operacao: {
                            [SequelizeExecutdpo.Op.like]: 'PJES GOVERNO%'
                        },
                },
                raw: true,
            });

            


        //---DIRESP | INICIO CALCULAR OS VALORES E COTAS TOTAIS POR DIRETORIA-------------------------------------------------------------------------

        // CALCULO DO VALOR DISTRIBUIDO
        const valorCotaOfDistDiresp = parseFloat(valorfinal_cotadistdiresp[0]?.valor_cotaofdist_multiplicado) || 0;
        const valorCotaPrcDistDiresp = parseFloat(valorfinal_cotadistdiresp[0]?.valor_cotaprcdist_multiplicado) || 0;
        const valorFinalDistDiresp = valorCotaOfDistDiresp + valorCotaPrcDistDiresp;

        // CALCULO DO TOTAL DE COTAS DISTRIBUIDAS
        const totalcotaOfDistDiresp = valorCotaOfDistDiresp/300;
        const totalcotaPrcDistDiresp = valorCotaPrcDistDiresp/200;

        // CALCULO DO VALOR EXECUTADO
        const valorCotaOfExeDiresp = parseFloat(valorfinal_cotaexediresp[0]?.valor_cotaofexe_multiplicado) || 0;
        const valorCotaPrcExeDiresp = parseFloat(valorfinal_cotaexediresp[0]?.valor_cotaprcexe_multiplicado) || 0;
        const valorFinalExeDiresp = valorCotaOfExeDiresp + valorCotaPrcExeDiresp;

        // CALCULO DO TOTAL DE COTAS EXECUTADAS
        const totalcotaOfExeDiresp = valorCotaOfExeDiresp/300;
        const totalcotaPrcExeDiresp = valorCotaPrcExeDiresp/200;

        // CALCULO DO SALDO FINAL
        const saldoFinalDiresp = valorFinalDistDiresp-valorFinalExeDiresp;

        //---DIRESP | FIM CALCULAR OS VALORES E COTAS TOTAIS POR DIRETORIA-------------------------------------------------------------------------

//---DIRESP | FIM

//---DINTERI | INICIO

            //---DINTERI | INICIO TABELA DE COTAS DISTRIBUIDAS-------------------------------------------------------------------------
            const Sequelizedinteri = require('sequelize');
            const total_cotadistdinteri = await db.pjes.findAll({
                attributes: [
                    'id', 'operacao', 'evento', 'cotaofdist', 'cotaprcdist', 'mes', 'idome', 'iduser', 'obs',
                    [Sequelizedinteri.literal('SUM(cotaofdist)'), 'total_cotaofdist'],
                    [Sequelizedinteri.literal('SUM(cotaprcdist)'), 'total_cotaprcdist'],
                    [Sequelizedinteri.literal('SUM(cotaofdist) * 300'), 'total_cotaofdist_multiplicado'],
                    [Sequelizedinteri.literal('SUM(cotaprcdist) * 200'), 'total_cotaprcdist_multiplicado']
                ],
                where: 
                    {idome:[4, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49],
                    mes,
                    ano,
                    operacao: {
                        [SequelizeExecutdpo.Op.like]: 'PJES GOVERNO%'
                    },
                },
                include: [
                    { model: db.omes, attributes: ['nome'] },
                    { model: db.users, attributes: ['name'] }
                ],
                group: ['idome', 'ome.nome', 'user.name'],
                raw: true,
            });

        //----DINTERI | INICIO TABELA DE COTAS EXECUTADAS-------------------------------------------------------------------------
            const SequelizeExecutdinteri = require('sequelize');
            const total_cotaexedinteri = await db.pjesgercota.findAll({
                attributes: [
                    'id', 'operacao', 'id_ome', 'ttofexe', 'ttprcexe', 'status', 'mes', 'ano', 'obs',
                    [SequelizeExecutdinteri.literal('SUM(ttofexe)'), 'total_cotaofexe'],
                    [SequelizeExecutdinteri.literal('SUM(ttprcexe)'), 'total_cotaprcexe'],
                    [SequelizeExecutdinteri.literal('SUM(ttofexe) * 300'), 'total_cotaofexe_multiplicado'],
                    [SequelizeExecutdinteri.literal('SUM(ttprcexe) * 200'), 'total_cotaprcexe_multiplicado']
                ],
                where: 
                    {id_ome:[4, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49],
                    mes,
                    ano,
                    operacao: {
                        [SequelizeExecutdpo.Op.like]: 'PJES GOVERNO%'
                    },
                },
                include: [
                    { model: db.omes, attributes: ['nome'] },
                ],
                group: ['id_ome', 'ome.nome'],
                raw: true,
            });

        //--- DINTERI | INICIO CALCULAR OS VALORES TOTAIS POR DIRETORIA-------------------------------------------------------------------------

        //VALOR FINAL DE COTAS DISTRIBUIDAS OFICIAIS DINTERI
            const SequelizeDistDinteri = require('sequelize');
            const valorfinal_cotadistdinteri = await db.pjes.findAll({
                attributes: [
                    [SequelizeDistDinteri.literal('SUM(cotaofdist) * 300'), 'valor_cotaofdist_multiplicado'],
                    [SequelizeDistDinteri.literal('SUM(cotaprcdist) * 200'), 'valor_cotaprcdist_multiplicado']
                ],
                where: {idome:[4, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49],
                        mes,
                        ano,
                        operacao: {
                            [SequelizeExecutdpo.Op.like]: 'PJES GOVERNO%'
                        },
                },
                raw: true,
            });

        //VALOR DE COTAS EXECUTADAS OFICIAIS DINTERI
            const SequelizeExecutDinteri = require('sequelize');
            const valorfinal_cotaexedinteri = await db.pjesgercota.findAll({
                attributes: [
                    [SequelizeExecutDinteri.literal('SUM(ttofexe) * 300'), 'valor_cotaofexe_multiplicado'],
                    [SequelizeExecutDinteri.literal('SUM(ttprcexe) * 200'), 'valor_cotaprcexe_multiplicado']
                ],
                where: {id_ome:[4, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49],
                        mes,
                        ano,
                        operacao: {
                            [SequelizeExecutdpo.Op.like]: 'PJES GOVERNO%'
                        },
                },
                raw: true,
            });

        //---DINTERI | INICIO CALCULAR OS VALORES E COTAS TOTAIS POR DIRETORIA-------------------------------------------------------------------------

        // CALCULO DO VALOR DISTRIBUIDO
            const valorCotaOfDistDinteri = parseFloat(valorfinal_cotadistdinteri[0]?.valor_cotaofdist_multiplicado) || 0;
            const valorCotaPrcDistDinteri = parseFloat(valorfinal_cotadistdinteri[0]?.valor_cotaprcdist_multiplicado) || 0;
            const valorFinalDistDinteri = valorCotaOfDistDinteri + valorCotaPrcDistDinteri;

        // CALCULO DO TOTAL DE COTAS DISTRIBUIDAS
            const totalcotaOfDistDinteri = valorCotaOfDistDinteri/300;
            const totalcotaPrcDistDinteri = valorCotaPrcDistDinteri/200;


        // CALCULO DO VALOR EXECUTADO
            const valorCotaOfExeDinteri = parseFloat(valorfinal_cotaexedinteri[0]?.valor_cotaofexe_multiplicado) || 0;
            const valorCotaPrcExeDinteri = parseFloat(valorfinal_cotaexedinteri[0]?.valor_cotaprcexe_multiplicado) || 0;
            const valorFinalExeDinteri = valorCotaOfExeDinteri + valorCotaPrcExeDinteri;

        // CALCULO DO TOTAL DE COTAS EXECUTADAS
            const totalcotaOfExeDinteri = valorCotaOfExeDinteri/300;
            const totalcotaPrcExeDinteri = valorCotaPrcExeDinteri/200;

        // CALCULO DO SALDO FINAL
            const saldoFinalDinteri = valorFinalDistDinteri-valorFinalExeDinteri;

        //---DINTERI | FIM CALCULAR OS VALORES E COTAS TOTAIS POR DIRETORIA-------------------------------------------------------------------------

//---DINTERI | FIM

//---DINTERII | INICIO

            //---DINTERII | INICIO TABELA DE COTAS DISTRIBUIDAS-------------------------------------------------------------------------
            const Sequelizedinterii = require('sequelize');
            const total_cotadistdinterii = await db.pjes.findAll({
                attributes: [
                    'id', 'operacao', 'evento', 'cotaofdist', 'cotaprcdist', 'mes', 'idome', 'iduser', 'obs',
                    [Sequelizedinterii.literal('SUM(cotaofdist)'), 'total_cotaofdist'],
                    [Sequelizedinterii.literal('SUM(cotaprcdist)'), 'total_cotaprcdist'],
                    [Sequelizedinterii.literal('SUM(cotaofdist) * 300'), 'total_cotaofdist_multiplicado'],
                    [Sequelizedinterii.literal('SUM(cotaprcdist) * 200'), 'total_cotaprcdist_multiplicado']
                ],
                where: 
                    {idome:[5, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62],
                    mes,
                    ano,
                    operacao: {
                        [Sequelizedinterii.Op.like]: 'PJES GOVERNO%'
                    },
                },
                include: [
                    { model: db.omes, attributes: ['nome'] },
                    { model: db.users, attributes: ['name'] }
                ],
                group: ['idome', 'ome.nome', 'user.name'],
                raw: true,
            });
            
        //----DINTERII | INICIO TABELA DE COTAS EXECUTADAS-------------------------------------------------------------------------
            const SequelizeExecutdinterii = require('sequelize');
            const total_cotaexedinterii = await db.pjesgercota.findAll({
                attributes: [
                    'id', 'operacao', 'id_ome', 'ttofexe', 'ttprcexe', 'status', 'mes', 'ano', 'obs',
                    [SequelizeExecutdinterii.literal('SUM(ttofexe)'), 'total_cotaofexe'],
                    [SequelizeExecutdinterii.literal('SUM(ttprcexe)'), 'total_cotaprcexe'],
                    [SequelizeExecutdinterii.literal('SUM(ttofexe) * 300'), 'total_cotaofexe_multiplicado'],
                    [SequelizeExecutdinterii.literal('SUM(ttprcexe) * 200'), 'total_cotaprcexe_multiplicado']
                ],
                where: 
                    {id_ome:[5, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62],
                    mes,
                    ano,
                    operacao: {
                        [Sequelizedinterii.Op.like]: 'PJES GOVERNO%'
                    },
                },
                include: [
                    { model: db.omes, attributes: ['nome'] },
                ],
                group: ['id_ome', 'ome.nome'],
                raw: true,
            });

        //--- DINTERII | INICIO CALCULAR OS VALORES TOTAIS POR DIRETORIA-------------------------------------------------------------------------

        //VALOR FINAL DE COTAS DISTRIBUIDAS OFICIAIS DINTERII
            const SequelizeDistDinterii = require('sequelize');
            const valorfinal_cotadistdinterii = await db.pjes.findAll({
                attributes: [
                    [SequelizeDistDinterii.literal('SUM(cotaofdist) * 300'), 'valor_cotaofdist_multiplicado'],
                    [SequelizeDistDinterii.literal('SUM(cotaprcdist) * 200'), 'valor_cotaprcdist_multiplicado']
                ],
                where: {idome:[5, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62],
                        mes,
                        ano,
                        operacao: {
                            [Sequelizedinterii.Op.like]: 'PJES GOVERNO%'
                        },
                },
                raw: true,
            });

        //VALOR DE COTAS EXECUTADAS OFICIAIS DINTERII
            const SequelizeExecutDinterii = require('sequelize');
            const valorfinal_cotaexedinterii = await db.pjesgercota.findAll({
                attributes: [
                    [SequelizeExecutDinterii.literal('SUM(ttofexe) * 300'), 'valor_cotaofexe_multiplicado'],
                    [SequelizeExecutDinterii.literal('SUM(ttprcexe) * 200'), 'valor_cotaprcexe_multiplicado']
                ],
                where: {id_ome:[5, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62],
                        mes,
                        ano,
                        operacao: {
                            [SequelizeExecutdpo.Op.like]: 'PJES GOVERNO%'
                        },
                },
                raw: true,
            });

        //---DINTERII | INICIO CALCULAR OS VALORES E COTAS TOTAIS POR DIRETORIA-------------------------------------------------------------------------

        // CALCULO DO VALOR DISTRIBUIDO
            const valorCotaOfDistDinterii = parseFloat(valorfinal_cotadistdinterii[0]?.valor_cotaofdist_multiplicado) || 0;
            const valorCotaPrcDistDinterii = parseFloat(valorfinal_cotadistdinterii[0]?.valor_cotaprcdist_multiplicado) || 0;
            const valorFinalDistDinterii = valorCotaOfDistDinterii + valorCotaPrcDistDinterii;

        // CALCULO DO TOTAL DE COTAS DISTRIBUIDAS
            const totalcotaOfDistDinterii = valorCotaOfDistDinterii/300;
            const totalcotaPrcDistDinterii = valorCotaPrcDistDinterii/200;


        // CALCULO DO VALOR EXECUTADO
            const valorCotaOfExeDinterii = parseFloat(valorfinal_cotaexedinterii[0]?.valor_cotaofexe_multiplicado) || 0;
            const valorCotaPrcExeDinterii = parseFloat(valorfinal_cotaexedinteri[0]?.valor_cotaprcexe_multiplicado) || 0;
            const valorFinalExeDinterii = valorCotaOfExeDinterii + valorCotaPrcExeDinterii;

        // CALCULO DO TOTAL DE COTAS EXECUTADAS
            const totalcotaOfExeDinterii = valorCotaOfExeDinterii/300;
            const totalcotaPrcExeDinterii = valorCotaPrcExeDinterii/200;

        // CALCULO DO SALDO FINAL
            const saldoFinalDinterii = valorFinalDistDinterii-valorFinalExeDinterii;

        //---DINTERII | FIM CALCULAR OS VALORES E COTAS TOTAIS POR DIRETORIA-------------------------------------------------------------------------

//---DINTERII | FIM

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
                    {idome:[70, 72], //DASDH E PE
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
                    {id_ome:[70, 72], //DASDH E PE
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
                where: {idome:[70, 72], //DASDH E PE
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
                where: {id_ome:[70, 72], //DASDH E PE
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
                    {idome:[1, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17], //DPO + OMES da DIM
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
                    {id_ome:[1, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17], //DPO + OMES da DIM
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
                where: {idome:[1, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17], //DPO + OMES da DIM
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
                where: {id_ome:[1, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17], //DPO + OMES da DIM
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
                    {idome:[1, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17], //DPO + OMES da DIM
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
                    {id_ome:[1, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17], //DPO + OMES da DIM
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
                where: {idome:[1, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17],
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
                where: {id_ome:[1, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17], //DPO + OMES da DIM
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






    // INICIO -  CONSULTA PARA TRAZER O REMANESCENTE DE OFICIAIS ANUAL
    const dataAtual = new Date();
    const anoAtual = dataAtual.getFullYear();
    const mesAtual = dataAtual.getMonth() + 1; // Mês atual (janeiro é 0, fevereiro é 1, ..., dezembro é 11)

    const somaCtgeralinicialof = await db.tetopjes.sum('ctgeralinicialof', {
        where: {
            ano: anoAtual,
            mes: {[Sequelize.Op.lte]: mesAtual}
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

    const totalcotaOfDistGov = totalcotaOfDistDpo + totalcotaOfDistDim + totalcotaOfDistDiresp + totalcotaOfDistDinteri + totalcotaOfDistDinterii;
    const totalcotaPrcDistGov = totalcotaPrcDistDpo + totalcotaPrcDistDim + totalcotaPrcDistDiresp + totalcotaPrcDistDinteri + totalcotaPrcDistDinterii; 
    const totalcotaDistGov = totalcotaOfDistGov + totalcotaPrcDistGov;

    const totalcotaOfExeGov = totalcotaOfExeDpo + totalcotaOfExeDim + totalcotaOfExeDiresp + totalcotaOfExeDinteri + totalcotaOfExeDinterii;
    const totalcotaPrcExeGov = totalcotaPrcExeDpo + totalcotaPrcExeDim + totalcotaPrcExeDiresp + totalcotaPrcExeDinteri + totalcotaPrcExeDinterii; 
    const totalcotaExeGov = totalcotaOfExeGov + totalcotaPrcExeGov;

    const ctAtualOf = ctGeralInicialOf - totalcotaOfDistGov;
    const ctAtualPrc = ctGeralInicialPrc - totalcotaPrcDistGov;


    // BLOCO QUE CONSTA A QUANTIDADE DE OMES PARA PRESTAR CONTA
    let totalPrestarContaPendente = 0;
    try {
            // Consulta para obter o total de eventos do governo onde cotaofdist ou cotaprcdist são maiores que zero
            const querypjes = await db.pjes.findAll({
                attributes: ['idome', 'ano'],
                where: {
                    idome: [
                        1, 65, 66, 67, 68, 69, 70, 71, 72, 73, 2, 6, 7, 8, 9,
                        10, 11, 12, 13, 14, 15, 16, 17, 3, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29,
                        30, 31, 32, 33, 4, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49,
                        5, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62
                    ],
                    mes,
                    ano,
                    [Sequelize.Op.or]: [
                        { cotaofdist: { [Sequelize.Op.gt]: 0 } },
                        { cotaprcdist: { [Sequelize.Op.gt]: 0 } }
                    ]
                },
                    group: ['idome'],
                    raw: true
            });

            // Consulta para obter os valores de ttofexe e ttprcexe da tabela diariasgercota onde são maiores que zero
            const querypjesgercota = await db.pjesgercota.findAll({
                attributes: ['id_ome', 'ano'],
                where: {
                    id_ome: [
                        1, 65, 66, 67, 68, 69, 70, 71, 72, 73, 2, 6, 7, 8, 9,
                        10, 11, 12, 13, 14, 15, 16, 17, 3, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29,
                        30, 31, 32, 33, 4, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49,
                        5, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62
                    ],
                    [Sequelize.Op.or]: [
                        { ttofexe: { [Sequelize.Op.gt]: 0 } },
                        { ttprcexe: { [Sequelize.Op.gt]: 0 } }
                    ],
                    mes,
                    ano,
                },
                group: ['id_ome'],
                raw: true
            });

        const countPjess = querypjes.length;
        const countPjesGercota = querypjesgercota.length;
        totalPrestarContaPendente = countPjess - countPjesGercota;

    } catch (error) {
        console.error('Erro ao contar eventos do governo:', error);
    }

    
    //const { Op } = require('sequelize');
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
            [Sequelize.fn('COUNT', Sequelize.col('matricula')), 'count']
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
    console.log('Registros encontrados para oficiais:', ttServExcessoOf.length);
    const ttServExcOf = ttServExcessoOf.length;

    
    // BLOCO QUE CONTA A QUANTIDADE SERVIÇO EM EXCESSO DE OFICIAS E PRAÇAS
    const ttServExcessoPrc = await db.escalas.findAll({
        attributes: [
            'matricula',
            [Sequelize.fn('COUNT', Sequelize.col('matricula')), 'count']
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
    console.log('Registros encontrados para praças:', ttServExcessoPrc.length);
    const ttServExcPrc = ttServExcessoPrc.length;
    const valorttServExc = (parseFloat(ttServExcOf) * 300) + (parseFloat(ttServExcPrc) * 200);


    // BLOCO QUE CONTA A QUANTIDADE REMANESCENTE DE OFICIAS E PRAÇAS
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
                    operacao: "PJES GOVERNO REMANESCENTE",
                },
                
                raw: true,
            });

            // CALCULO DO VALOR DISTRIBUIDO
            const valorCotaOfDistRen = parseFloat(total_cotadistRen[0]?.total_cotaofdist_multiplicado) || 0;
            const valorCotaPrcDistRen = parseFloat(total_cotadistRen[0]?.total_cotaprcdist_multiplicado) || 0;
            const totalcotaOfDistRen = valorCotaOfDistRen/300;
            const totalcotaPrcDistRen = valorCotaPrcDistRen/200;

            const totalFinalDistRen = valorCotaOfDistRen + valorCotaPrcDistRen;

    // BLOCO QUE CONTA A QUANTIDADE REMANESCENTE DE OFICIAS E PRAÇAS

    // INICIO BLOCO QUE CONTA O SALDO ANUAL REMANESCENTE DE OFICIAS E PRAÇAS
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
            'id', 'operacao', 'evento', 'cotaofdist', 'cotaprcdist', 'mes', 'ano', 'idome', 'iduser', 'obs',
            // Subconsulta para contar pg = 'ST' ou 'CB'
            [
                Sequelize.literal(`(
                    SELECT COUNT(*)
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
                    SELECT COUNT(*)
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
            mes,
            ano,
        },
        order: [['id', 'DESC']],
        include: [
            { model: db.omes, attributes: ['nome'] },
            { model: db.users, attributes: ['name'] }
        ],
        offset: Number((page * limit) - limit),
        limit: limit

    })
    .then((pjes) => {
        if (pjes.length !== 0) {
            var pagination = {
                path: '/pjes',
                page,
                prev_page_url: ((Number(page) - Number(1)) >= 1) ? Number(page) - Number(1) : false,
                next_page_url: ((Number(page) + Number(1)) > Number(lastPage)) ? false : Number(page) + Number(1),
                lastPage
            }
            res.render("admin/pjes/list", {
                layout: 'main', profile: req.user.dataValues, user, nomeMes, nomeAno, pagination, sidebarSituations: true,
                pjes: pjes.map(id => id.toJSON()),

                valorFinalDistDpo, valorFinalExeDpo, saldoFinalDpo, total_cotadistdpo,
                total_cotaexedpo, totalcotaOfDistDpo, totalcotaPrcDistDpo, totalcotaOfExeDpo,
                totalcotaPrcExeDpo,

                valorFinalDistDim, valorFinalExeDim, saldoFinalDim, total_cotadistdim,
                total_cotaexedim, totalcotaOfDistDim, totalcotaPrcDistDim, totalcotaOfExeDim,
                totalcotaPrcExeDim,

                valorFinalDistDiresp, valorFinalExeDiresp, saldoFinalDiresp, total_cotadistdiresp,
                total_cotaexediresp, totalcotaOfDistDiresp, totalcotaPrcDistDiresp, totalcotaOfExeDiresp,
                totalcotaPrcExeDiresp,

                valorFinalDistDinteri, valorFinalExeDinteri, saldoFinalDinteri, total_cotadistdinteri,
                total_cotaexedinteri, totalcotaOfDistDinteri, totalcotaPrcDistDinteri, totalcotaOfExeDinteri,
                totalcotaPrcExeDinteri,

                valorFinalDistDinterii, valorFinalExeDinterii, saldoFinalDinterii, total_cotadistdinterii,
                total_cotaexedinterii, totalcotaOfDistDinterii, totalcotaPrcDistDinterii, totalcotaOfExeDinterii,
                totalcotaPrcExeDinterii,

                valorFinalDistPe, valorFinalExePe, saldoFinalPe, total_cotadistpe,
                total_cotaexepe, totalcotaOfDistPe, totalcotaPrcDistPe, totalcotaOfExePe,
                totalcotaPrcExePe,

                valorFinalDistTi, valorFinalExeTi, saldoFinalTi, total_cotadistti,
                total_cotaexeti, totalcotaOfDistTi, totalcotaPrcDistTi, totalcotaOfExeTi,
                totalcotaPrcExeTi,

                valorFinalDistEnem, valorFinalExeEnem, saldoFinalEnem, total_cotadistenem,
                total_cotaexeenem, totalcotaOfDistEnem, totalcotaPrcDistEnem, totalcotaOfExeEnem,
                totalcotaPrcExeEnem,

                ctAtualOf,ctAtualPrc, valorGeralInicial, ctGeralInicialOf, ctGeralInicialPrc, valorGeralInicial,
                totalcotaDistGov, totalPrestarContaPendente, totalcotaExeGov, totalcotaOfDistGov, totalcotaPrcDistGov, totalcotaOfExeGov,
                totalcotaPrcExeGov, ttServExcOf, ttServExcPrc, valorttServExc, totalFinalDistRen, totalcotaOfDistRen,
                totalcotaPrcDistRen, SaldoAnualOfGov, SaldoAnualPrcGov, saldoCtRenOfAnual, saldoCtRenPrcAnual,

            });
        } else {
            res.render("admin/pjes/list", {
                layout: 'main', profile: req.user.dataValues, sidebarSituations: true, danger_msg: 'Erro: Nenhum Evento Cadastrado!'
            });
        }

    })
    .catch(() => {
        res.render("admin/pjes/list", {
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

    //Inicio do Metodo para contar o total de serviço por mes por policial
    //const { Op } = require('sequelize');
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
    const nomeAno = req.session.ano;
    const ttservMes = await db.escalas.findAll({
        attributes: [
            'matricula',
            [
                Sequelize.literal(`'${nomeMesConvertido}'`),
                'ttservMes'
            ],
            [Sequelize.fn('COUNT', Sequelize.col('*')), 'totalRegistros']
        ],
        where: Sequelize.literal(
            `
            DATE_FORMAT(data_inicio, '%b') = '${nomeMesConvertido}'
            AND YEAR(data_inicio) = '${nomeAno}'
            
            `),
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

    const cotaofexe = await db.escalas.count({
        where: {
            idevento:id,
            pg: ['2º TEN', '1º TEN', 'CAP', 'MAJ', 'TC', 'CEL']
        }
    });
    const cotaprcexe = await db.escalas.count({
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

        res.render("admin/pjes/view", { layout: 'main', profile: req.user.dataValues, nomeMes, sidebarSituations: true, pjes, ttservMes, escalas: escalas.map(id => id.toJSON()), valorofdist, valorprcdist, valortotaldistribuido, cotaofexe, cotaprcexe, valortotalexecutado });
        
    } else {
        // Criar a mensagem de erro
        req.flash("danger_msg", "Erro: PJES não encontrado!");
        // Redirecionar o usuário
        res.redirect('/pjes');
    }
});

// TELA QUE VISUALIZA O FORM DO EVENTO PJES PARA ADCIONAR
router.get('/add', eAdmin, async (req, res) => {

    const nomeMes = req.session.mes;
    const nomeAno = req.session.ano;
    var dataForm = [];
    const Sequelize = require('sequelize');
    const Op = Sequelize.Op;
    const omes = await db.omes.findAll({
        attributes: ['id', 'nome'],
        where: {
            id: {
                [Op.in]: [2, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 3, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33,
                    4, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 5, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61,
                    62, 1, 65, 66, 67, 68, 69, 70, 71, 72, 73
                ]
            }
        },
        order: [
            [Sequelize.literal(`FIELD(id, ${[2, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 3, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33,
                4, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 5, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61,
                62, 1, 65, 66, 67, 68, 69, 70, 71, 72, 73].join(',')})`)],
        ]
    });

    if (omes) {
        dataForm['omes'] = omes;
       // dataForm['diretorias'] = diretorias;
    }

    // Pausar o processamento, carregar a view, carregar o layout main, indicar qual item de menu deve ficar ativo
    res.render('admin/pjes/add', { layout: 'main', profile: req.user.dataValues, data: dataForm, nomeMes, nomeAno, sidebarSituations: true });

});

// TELA QUE ADCIONA (CREATE) O EVENTO PJES
router.post('/add', eAdmin, async (req, res) => {

    const nomeMes = req.session.mes;
    const nomeAno = req.session.ano;
    
    // Receber os dados do formulário
    var data = req.body;

    if (data.idome === '1') {
        data.iddiretoria = '1';
    } else if (data.idome === '2') {
        data.iddiretoria = '2';
    } else if (data.idome === '3') {
        data.iddiretoria = '3';
    } else if (data.idome === '4') {
        data.iddiretoria = '4';
    } else if (data.idome === '5') {
        data.iddiretoria = '5';
    }else if (data.idome === '6') {
        data.iddiretoria = '2';
    }else if (data.idome === '7') {
        data.iddiretoria = '2';
    }else if (data.idome === '8') {
        data.iddiretoria = '2';
    }else if (data.idome === '9') {
        data.iddiretoria = '2';
    }else if (data.idome === '10') {
        data.iddiretoria = '2';
    }else if (data.idome === '11') {
        data.iddiretoria = '2';
    }else if (data.idome === '12') {
        data.iddiretoria = '2';
    }else if (data.idome === '13') {
        data.iddiretoria = '2';
    }else if (data.idome === '14') {
        data.iddiretoria = '2';
    }else if (data.idome === '15') {
        data.iddiretoria = '2';
    }else if (data.idome === '16') {
        data.iddiretoria = '2';
    }else if (data.idome === '17') {
        data.iddiretoria = '2';
    }else if (data.idome === '18') {
        data.iddiretoria = '2';
    }else if (data.idome === '19') {
        data.iddiretoria = '2';
    }else if (data.idome === '20') {
        data.iddiretoria = '3';
    }else if (data.idome === '21') {
        data.iddiretoria = '3';
    }else if (data.idome === '22') {
        data.iddiretoria = '3';
    }else if (data.idome === '23') {
        data.iddiretoria = '3';
    }else if (data.idome === '24') {
        data.iddiretoria = '3';
    }else if (data.idome === '25') {
        data.iddiretoria = '3';
    }else if (data.idome === '26') {
        data.iddiretoria = '3';
    }else if (data.idome === '27') {
        data.iddiretoria = '3';
    }else if (data.idome === '28') {
        data.iddiretoria = '3';
    }else if (data.idome === '29') {
        data.iddiretoria = '3';
    }else if (data.idome === '30') {
        data.iddiretoria = '3';
    }else if (data.idome === '31') {
        data.iddiretoria = '3';
    }else if (data.idome === '32') {
        data.iddiretoria = '3';
    }else if (data.idome === '33') {
        data.iddiretoria = '3';
    }else if (data.idome === '34') {
        data.iddiretoria = '3';
    }else if (data.idome === '35') {
        data.iddiretoria = '3';
    }else if (data.idome === '36') {
        data.iddiretoria = '4';
    }else if (data.idome === '37') {
        data.iddiretoria = '4';
    }else if (data.idome === '38') {
        data.iddiretoria = '4';
    }else if (data.idome === '39') {
        data.iddiretoria = '4';
    }else if (data.idome === '40') {
        data.iddiretoria = '4';
    }else if (data.idome === '41') {
        data.iddiretoria = '4';
    }else if (data.idome === '42') {
        data.iddiretoria = '4';
    }else if (data.idome === '43') {
        data.iddiretoria = '4';
    }else if (data.idome === '44') {
        data.iddiretoria = '4';
    }else if (data.idome === '45') {
        data.iddiretoria = '4';
    }else if (data.idome === '46') {
        data.iddiretoria = '4';
    }else if (data.idome === '47') {
        data.iddiretoria = '4';
    }else if (data.idome === '48') {
        data.iddiretoria = '4';
    }else if (data.idome === '49') {
        data.iddiretoria = '4';
    }else if (data.idome === '50') {
        data.iddiretoria = '4';
    }else if (data.idome === '51') {
        data.iddiretoria = '4';
    }else if (data.idome === '52') {
        data.iddiretoria = '5';
    }else if (data.idome === '53') {
        data.iddiretoria = '5';
    }else if (data.idome === '54') {
        data.iddiretoria = '5';
    }else if (data.idome === '55') {
        data.iddiretoria = '5';
    }else if (data.idome === '56') {
        data.iddiretoria = '5';
    }else if (data.idome === '57') {
        data.iddiretoria = '5';
    }else if (data.idome === '58') {
        data.iddiretoria = '5';
    }else if (data.idome === '59') {
        data.iddiretoria = '5';
    }else if (data.idome === '60') {
        data.iddiretoria = '5';
    }else if (data.idome === '61') {
        data.iddiretoria = '5';
    }else if (data.idome === '62') {
        data.iddiretoria = '5';
    }else if (data.idome === '63') {
        data.iddiretoria = '5';
    }else if (data.idome === '64') {
        data.iddiretoria = '5';
    }else if (data.idome === '65') {
        data.iddiretoria = '1';
    }else if (data.idome === '66') {
        data.iddiretoria = '1';
    }else if (data.idome === '67') {
        data.iddiretoria = '1';
    }else if (data.idome === '68') {
        data.iddiretoria = '1';
    }else if (data.idome === '69') {
        data.iddiretoria = '1';
    }else if (data.idome === '70') {
        data.iddiretoria = '1';
    }else if (data.idome === '71') {
        data.iddiretoria = '1';
    }else if (data.idome === '72') {
        data.iddiretoria = '1';
    }else if (data.idome === '73') {
        data.iddiretoria = '1';
    }else if (data.idome === '74') {
        data.iddiretoria = '1';
    }else if (data.idome === '75') {
        data.iddiretoria = '1';
    }else if (data.idome === '76') {
        data.iddiretoria = '1';
    }else if (data.idome === '77') {
        data.iddiretoria = '1';
    }else if (data.idome === '78') {
        data.iddiretoria = '1';
    }else if (data.idome === '79') {
        data.iddiretoria = '1';
    }else if (data.idome === '80') {
        data.iddiretoria = '1';
    } else {
        // Defina um valor padrão ou tratamento para outros casos, se necessário
    }


    if (data.operacao === 'PJES GOVERNO REGULAR') {
        data.cod = '247';
    } else if (data.operacao === 'PJES GOVERNO REGULAR') {
        data.cod = '248';
    }else if (data.operacao === 'PJES CTM (BRT)') {
        data.cod = '255';
    }else if (data.operacao === 'PJES PATULHA ESCOLAR') {
        data.cod = '263';
    }else if (data.operacao === 'PJES OP ENEM') {
        data.cod = '250';
    } else {
    }


    // Validar os campos utilizando o yup   
    const schema = yup.object().shape({

        evento: yup.string("Erro: Necessário preencher o evento!")
            .required("Erro: Necessário preencher o campo nome!")
    });

    // Verificar se todos os campos passaram pela validação
    try {
        await schema.validate(data);
    } catch (error) {
        // Pausar o processamento e carregar a view enviando os dados que o usuário havia preenchido no formulário
        return res.render("admin/pjes/add", { layout: 'main', profile: req.user.dataValues, sidebarSituations: true, data, danger_msg: error.errors });
    }

    // Cadastrar no banco de dados
    db.pjes.create(data).then(() => {

        // Criar a mensagem de situação cadastrado com sucesso, e-mail enviado
        req.flash("success_msg", "Evento cadastrado!");
        

        res.redirect(`/pjes?mes=${nomeMes}&ano=${nomeAno}`);
        //res.redirect('/pjes?mes=' + req.session.mes);
    }).catch(() => {
        // Pausar o processamento e carregar a view enviando os dados que o usuário havia preenchido no formulário
        return res.render("admin/pjes/add", { layout: 'main', profile: req.user.dataValues, sidebarSituations: true, data: req.body, danger_msg: "Erro: Pjes não cadastrado com sucesso!" });

    });

});

// TELA QUE VISUALIZA O FORM DA EDIÇÃO DO EVENTO
router.get('/edit/:id', eAdmin, async (req, res) => {

    const nomeMes = req.session.mes;
    const nomeAno = req.session.ano;

    // Receber o id enviado na URL
    const { id } = req.params;

    // Recuperar o registro do banco de dados
    const pje = await db.pjes.findOne({
        // Indicar quais colunas recuperar
        attributes: ['id', 'evento', 'operacao', 'cotaofdist', 'cotaprcdist', 'mes', 'ano', 'idome', 'obs', 'sei'],
        // Acrescentar condição para indicar qual registro deve ser retornado do banco de dados
        where: {
            id
        },
        // Buscar dados na tabela secundária
        include: [{
            model: db.omes,
            attributes: ['id', 'nome']
        }]
    });

    // Acessa o IF se encontrar o registro no banco de dados
    if (pje) {
        // Enviar dados para o formulário
        var dataForm = pje.dataValues;

        const Sequelize = require('sequelize');
        const Op = Sequelize.Op;
        const omes = await db.omes.findAll({
            attributes: ['id', 'nome'],
            where: {
                id: {
                    [Op.in]: [2, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 3, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33,
                        4, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 5, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61,
                        62, 1, 65, 66, 67, 68, 69, 70, 71, 72, 73
                    ]
                }
            },
            order: [
                [Sequelize.literal(`FIELD(id, ${[2, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 3, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33,
                    4, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 5, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61,
                    62, 1, 65, 66, 67, 68, 69, 70, 71, 72, 73].join(',')})`)],
            ]
        });

        // Acessa o IF quando encontrar situações no banco de dados e atribui para variável enviar dados para o formulário
        if (omes) {
            dataForm['omes'] = omes;
        }
        

        // Pausar o processamento, carregar a view, carregar o layout main, indicar qual item de menu deve ficar ativo
        res.render('admin/pjes/edit', { layout: 'main', profile: req.user.dataValues, nomeMes, nomeAno, data: dataForm, sidebarSituations: true });
        
    } else {
        // Criar a mensagem de erro
        req.flash("danger_msg", "Erro: PJES não encontrado!");
        // Redirecionar o usuário
        res.redirect('/pjes?page=1');
    }
});

//TELA QUE EDITA (UPDATE) O EVENTO PJES
router.post('/edit', eAdmin, async (req, res) => {
    // Receber os dados do formulário
    var data = req.body;
    const nomeMes = req.session.mes;
    const nomeAno = req.session.ano;
    // Validar os campos utilizando o yup
    const schema = yup.object().shape({
        evento: yup.string().required("Erro: Necessário preencher o campo nome!")
    });
    try {
        await schema.validate(data);
        // Editar no banco de dados
        await db.pjes.update(data, { where: { id: data.id } });
        // Atualizar idome na tabela escala onde idevento é igual ao id do evento editado
        await db.escalas.update({ idome: data.idome }, { where: { idevento: data.id } });

        // Mensagem de sucesso e redirecionamento
        req.flash("success_msg", "PJES editado com sucesso!");
        res.redirect(`/pjes?mes=${nomeMes}&ano=${nomeAno}`);
    } catch (error) {
        // Em caso de erro ao editar no banco de dados
        console.error("Erro ao editar PJES:", error);
        res.render('admin/pjes/edit', { 
            layout: 'main', 
            profile: req.user.dataValues, 
            data: data, 
            sidebarSituations: true, 
            danger_msg: "PJES não editada com sucesso!" 
        });
    }
    
});


// TELA QUE VISUALIZA (GET) A ESCALA
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

    res.render('admin/pjes/add', { layout: 'main', profile: req.user.dataValues, nomeMes, data: dataForm, sidebarSituations: true });

});


// TELA QUE MANDA PRA SALVAR (POST) A ESCALA
const moment = require('moment');
moment.locale('pt-br');

router.post('/escalas/:id', eAdmin, async (req, res) => {
    const nomeMes = req.session.mes;

    // Receber os dados do formulário
    const { data_inicio, ...dataFormulario } = req.body;

    // Validar os campos utilizando o yup   
    const schema = yup.object().shape({
        nome: yup.string().required("Erro: Necessário preencher o campo nome!")
    });

    // Recuperar o registro do banco de dados
    const escalas = await db.pjes.findOne({
        attributes: ['id', 'operacao', 'evento', 'cotaofdist', 'cotaprcdist', 'mes', 'idome', 'iduser', 'obs','sei', 'ano', 'createdAt', 'updatedAt'],
        where: {
            id: req.params.id
        },
        include: [
            { model: db.omes, attributes: ['nome'] },
            { model: db.users, attributes: ['name'] }
        ]
    });


    if (dataFormulario.operacao === 'PJES GOVERNO REGULAR') {
        dataFormulario.cod = 247;
    } else if (dataFormulario.operacao === 'PJES CTM (BRT)') {
        dataFormulario.cod = 255;
    } else if (dataFormulario.operacao === 'PJES PATRULHA ESCOLAR') {
        dataFormulario.cod = 263;
    } else if (dataFormulario.operacao === 'PJES GOVERNO REMANESCENTE') {
        dataFormulario.cod = 248;
    } else if (dataFormulario.operacao === 'PJES OPER CONVIVÊNCIA') {
        dataFormulario.cod = 249;
    } else if (dataFormulario.operacao === 'PJES GOVERNO OP ENEM') {
        dataFormulario.cod = 250;
    } else if (dataFormulario.operacao === 'PJES ALEPE') {
        dataFormulario.cod = 251;
    } else if (dataFormulario.operacao === 'PJES TJPE') {
        dataFormulario.cod = 252;
    } else if (dataFormulario.operacao === 'PJES MPPE') {
        dataFormulario.cod = 253;
    } else if (dataFormulario.operacao === 'PJES PREFEITURA DE RECIFE') {
        dataFormulario.cod = 254;
    } else if (dataFormulario.operacao === 'PJES CBTU') {
        dataFormulario.cod = 256;
    } else if (dataFormulario.operacao === 'PJES CPRH') {
        dataFormulario.cod = 257;
    } else if (dataFormulario.operacao === 'PJES SEMOC PCR') {
        dataFormulario.cod = 265;
    }else {
        // Defina um valor padrão ou tratamento para outros casos, se necessário
    }


    // Verificar se todos os campos passaram pela validação
    try {
        await schema.validate(dataFormulario);
    } catch (error) {
        return res.render("admin/pjes/list", { layout: 'main', profile: req.user.dataValues, nomeMes, sidebarSituations: true, data: { ...dataFormulario, data_inicio }, danger_msg: error.errors });
    }


    //CONSULTA PARA VERIFICAR O LIMITE DE COTA DE OFICIAIS DISTRIBUIDA POR EVENTO
    const ttLimitctof = await db.pjes.sum('cotaofdist', {where: {id: req.params.id,}});

    //CONSULTA PARA VERIFICAR O LIMITE DE COTA DE OFICIAIS EXECUTADAS POR EVENTO
    const cotaofexe = await db.escalas.count({where: { idevento: req.params.id, pg: ['2º TEN', '1º TEN', 'CAP', 'MAJ', 'TC', 'CEL'] }});

    //NÃO PERMITIR SALVAR SE O VALOR EXECUTADO DE COTAS DE OFICIAIS FOR MAIOR DO QUE O DISTRIBUIDO
    if (cotaofexe >= ttLimitctof) {
        req.flash("danger_msg", "Atenção. Limite de Cotas de Oficiais foi atingido. ");
        res.redirect('/pjes/view/' + escalas.id);
        return;
    }

    //CONSULTA PARA VERIFICAR O LIMITE DE COTA DE OFICIAIS DISTRIBUIDA POR EVENTO
    const ttLimitctprc = await db.pjes.sum('cotaprcdist', {where: {id: req.params.id,}});

    //CONSULTA PARA VERIFICAR O LIMITE DE COTA DE OFICIAIS EXECUTADAS POR EVENTO
    const cotaprcexe = await db.escalas.count({where: { idevento: req.params.id, pg: ['ST', '1º SGT', '2º SGT', '3º SGT', 'CB', 'SD'] }});

    //NÃO PERMITIR SALVAR SE O VALOR EXECUTADO DE COTAS DAS PRAÇAS FOR MAIOR DO QUE O DISTRIBUIDO
    if (cotaprcexe >= ttLimitctprc) {
        req.flash("danger_msg", "Atenção. Limite de Cotas das Praças foi atingido. ");
        res.redirect('/pjes/view/' + escalas.id);
        return;
    }

    // Extrair o mês do campo data_inicio e converter para o formato abreviado em português (FEV, MAR, etc.)
    const mesSelecionado = moment(data_inicio, 'YYYY-MM-DD').format('MMM').toUpperCase();

    // Comparar o mês do formulário com o mês da sessão
    if (escalas && mesSelecionado !== nomeMes) {
        return res.render("admin/pjes/list", { layout: 'main', profile: req.user.dataValues, sidebarSituations: true, data: { ...dataFormulario, data_inicio }, danger_msg: "Erro: Mês diferente do selecionado!" });
    }

    // Se os meses forem iguais ou não houver registro encontrado
    if (escalas) {
        const dataSalvar = {
            ...dataFormulario,
            data_inicio: moment(data_inicio).format('YYYY-MM-DD'),
            idome: escalas.idome
        };
        
        // Cadastrar no banco de dados
        db.escalas.create(dataSalvar)
            .then(() => {
                req.flash("success_msg", "Policial Adicionado!");
                res.redirect('/pjes/view/' + escalas.id);
            })
            .catch(() => {
                return res.render("admin/pjes/list", { layout: 'main', profile: req.user.dataValues, nomeMes, sidebarSituations: true, data: { ...dataFormulario, data_inicio }, danger_msg: "Erro: Pjes não cadastrado com sucesso!" });
            });
    }
});

// Criar a rota apagar situação no BD, usar a função eAdmin com middleware para verificar se o usuário está logado
router.get('/delete/:id', async (req, res) => {
    // Recuperar o registro do banco de dados para verificar se a situação está sendo utilizada por algum usuário
    const pjes = await db.pjes.findOne({
        // Indicar quais colunas recuperar
        attributes: ['id'],
        // Acrescentar condição para indicar qual registro deve ser retornado do banco de dados
        where: {
            id:req.params.id
        }
    });

    // Apagar usuário no banco de dados utilizando a MODELS situations
    db.pjes.destroy({
        // Acrescentar o WHERE na instrução SQL indicando qual registro excluir no BD
        where: {id: req.params.id}

    }).then(() => {

        // Criar a mensagem de situação apagada com sucesso
        req.flash("success_msg", "Evento excluido com sucesso!");

        // Redirecionar o usuário após apagar com sucesso
        res.redirect('/pjes?page=1');
    }).catch(() => {
        // Criar a mensagem de situação não apagada
        req.flash("danger_msg", "Evento não pode ser Excluído devido a ter Policiais Escalados");

        // Redirecionar o usuário após não apagar
        res.redirect('/pjes/view/' + req.params.id);
    })    
});

// Criar a rota para página com formulário cadastrar situação, usar a função eAdmin com middleware para verificar se o usuário está logado
router.get('/pjesgercota/:id', eAdmin, async (req, res) => {

   // Receber o id enviado na URL
   const { id } = req.params;
   const mes = req.session.mes;
   const ano = req.session.ano;
   
   //Recuperar o registro do banco de dados
   const pjes = await db.pjesgercota.findOne({
       //Indicar quais colunas recuperar
        attributes: ['id', 'operacao', 'id_ome', 'ttofexe', 'ttprcexe', 'status', 'mes', 'ano', 'obs', 'createdAt', 'updatedAt'],
        //Acrescentado condição para indicar qual registro deve ser retornado do banco de dados
        where: {id},
        //Buscar dados na tabela secundária
       include: [
           {model: db.omes, attributes: ['nome'],}
       ],
   });

   
   //SQL PARA TRAZER A LISTA DOS EVENTOS POR OME
   const SequelizeNomesEventos = require('sequelize');
   const nomesEventosporome = await db.pjes.findAll({
    attributes: [
            'id', 'operacao', 'evento', 'cotaofdist', 'cotaprcdist', 'mes', 'idome', 'iduser', 'obs', 'sei', 'ano',],
       where: 
           {idome:pjes.id_ome, mes, ano,},
   });

   //SQL PARA TRAZER A DISTRIBUIÇÃO GERAL DE COTAS
   const Sequelize = require('sequelize');
   const total_prestarconta = await db.pjes.findAll({
    attributes: [
            'id', 'operacao', 'evento', 'cotaofdist', 'cotaprcdist', 'mes', 'idome', 'iduser', 'obs', 'sei', 'ano',
            [Sequelize.literal('SUM(cotaofdist)'), 'total_cotaofdist'],
            [Sequelize.literal('SUM(cotaprcdist)'), 'total_cotaprcdist'],
            [Sequelize.literal('SUM(cotaofdist) * 300'), 'total_cotaofdist_multiplicado'],
            [Sequelize.literal('SUM(cotaprcdist) * 200'), 'total_cotaprcdist_multiplicado']
        ],
       where: 
           {idome:pjes.id_ome, mes, ano},
       include: [
           { model: db.omes, attributes: ['nome'] },
           { model: db.users, attributes: ['name'] }
       ],
       group: ['idome', 'ome.nome', 'user.name'],
       raw: true,
   });


    // Acessa o IF se encontrar o registro no banco de dados
    if (pjes) {
        // Enviar dados para o formulário
        var dataForm = pjes.dataValues;

        // Pausar o processamento, carregar a view, carregar o layout main, indicar qual item de menu deve ficar ativo
        res.render('admin/pjes/pjesgercota', { layout: 'main', profile: req.user.dataValues, pjes, data: dataForm, total_prestarconta, nomesEventosporome, sidebarSituations: true });

    } else {
        // Criar a mensagem de erro
        req.flash("danger_msg", "Erro: Prestação de conta com Erro!");
        // Redirecionar o usuário
        res.redirect('/pjes?page=1');
    }

});

// SALVAR PRESTAÇÃO CONTA
router.post('/pjesgercota', eAdmin, async (req, res) => {
    var data = req.body;
    var dataForm = req.body;

    db.pjesgercota.update(data, { where: {id: data.id} }).then(() => {
        req.flash("success_msg", "Prestação de Conta Concluida com Sucesso!");
        res.redirect('/pjes?page=1');
    }).catch(() => {
        res.render('admin/pjes/edit', { layout: 'main', profile: req.user.dataValues, data: dataForm, sidebarSituations: true, danger_msg: "Erro na Prestação de Conta!" });
    });
});

// Criar a rota apagar situação no BD, usar a função eAdmin com middleware para verificar se o usuário está logado
router.get('/deleteEscala/:id', async (req, res) => {

    const escalas = await db.escalas.findOne({    
        attributes: ['id'],
        where: {
            id:req.params.id
        }
    });

    db.escalas.destroy({
        where: {
            id: req.params.id
        }

    }).then(() => {
        req.flash("success_msg", "Policial apagado com sucesso!");
        res.redirect('/pjes/view/');
        
    }).catch(() => {
        // Criar a mensagem de situação não apagada
        req.flash("danger_msg", "Policial não apagado com sucesso!");

        // Redirecionar o usuário após não apagar
        res.redirect('/pjes/view/');
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
            where: Sequelize.literal(`DATE_FORMAT(data_inicio, '%b') = '${nomeMesConvertido}' AND YEAR(data_inicio) = ${nomeAno}`),
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
        const worksheet = workbook.addWorksheet('Escalas');

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
