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

    const countdiarias = await db.diarias.count();
    
    if (countdiarias === 0) {
        return res.render("admin/diarias/list", { layout: 'main', profile: req.user.dataValues, sidebarSituations: true, danger_msg: 'Erro: Nenhum diarias encontrada!' });
    }



//---DPO | INICIO

    //---DPO | INICIO TABELA DE COTAS DISTRIBUIDAS-------------------------------------------------------------------------
    
    const total_cotadistdpo = await db.diarias.findAll({
        attributes:
        [
            'id', 'operacao', 'evento', 'cotadist', 'mes', 'idome', 'iduser', 'obs', 'ano',
            [Sequelize.literal('SUM(CASE WHEN operacao = "ORIGINAL" THEN cotadist ELSE 0 END)'),'total_cotadist_original'],
            [Sequelize.literal('SUM(CASE WHEN operacao = "REFORCO" THEN cotadist ELSE 0 END)'), 'total_cotadist_reforco'],
            [Sequelize.literal('SUM(cotadist)'),'total_cotadist'],
            [Sequelize.literal('SUM(cotadist) * 180'),'total_cotadist_multiplicado']
        ],
        where: {
            idome: [1, 65, 66, 67, 68, 69, 70, 71, 72, 73],
            mes,
            ano,
        },
        include: [
            { model: db.omes, attributes: ['nome'] },
            { model: db.users, attributes: ['name'] }
        ],
        group: ['idome', 'ome.nome', 'user.name'],
        raw: true,
    });

    //----DPO | INICIO TABELA DE COTAS EXECUTADAS-------------------------------------------------------------------------
            
    const total_cotaexedpo = await db.diariasgercota.findAll({
        attributes:
        [
            'id','id_ome', 'ttexe','mes', 'ano', 'obs',
            [Sequelize.literal('SUM(ttexe)'), 'total_cotaexe'],
            [Sequelize.literal('SUM(ttexe) * 180'), 'total_cotaexe_multiplicado'],    
        ],
        where: 
            {id_ome:[1, 65, 66, 67, 68, 69, 70, 71, 72, 73],
            mes,
            ano,
        },
        include: [
            { model: db.omes, attributes: ['nome'] },
        ],
        group: ['id_ome', 'ome.nome'],
        raw: true,
    });

    //--- DPO | INICIO CALCULAR OS VALORES TOTAIS POR DIRETORIA--

    //VALOR FINAL DE COTAS DISTRIBUIDAS OFICIAIS DPO     
    const valorfinal_cotadistdpo = await db.diarias.findAll({
        attributes: [
            [Sequelize.literal('SUM(cotadist) * 180'), 'valor_cotadist_multiplicado'],
        ],
        where: {idome:[1, 65, 66, 67, 68, 69, 70, 71, 72, 73],
                mes,
                ano,
        },
        raw: true,
    });

    //VALOR DE COTAS EXECUTADAS OFICIAIS DPO
    const valorfinal_cotaexedpo = await db.diariasgercota.findAll({
        attributes: [
            [Sequelize.literal('SUM(ttexe) * 180'), 'valor_cotaexe_multiplicado'],
        ],
        where: {id_ome:[1, 65, 66, 67, 68, 69, 70, 71, 72, 73],
                mes,
                ano,
        },
        raw: true,
    });

    //---DPO | INICIO CALCULAR OS VALORES E COTAS TOTAIS POR DIRETORIA-------------------------------------------------------------------------

    // CALCULO DO VALOR DISTRIBUIDO
    const valorCotaDistDpo = parseFloat(valorfinal_cotadistdpo[0]?.valor_cotadist_multiplicado) || 0;

    // CALCULO DO TOTAL DE COTAS DISTRIBUIDAS
    const totalcotaDistDpoOrig = parseFloat(total_cotadistdpo[0]?.total_cotadist_original) || 0;
    const totalcotaDistDpoRef = parseFloat(total_cotadistdpo[0]?.total_cotadist_reforco) || 0;
    const totalcotaDistDpo = valorCotaDistDpo/180;
        
    // CALCULO DO VALOR EXECUTADO
    const valorCotaExeDpo = parseFloat(valorfinal_cotaexedpo[0]?.valor_cotaexe_multiplicado) || 0;

    // CALCULO DO TOTAL DE COTAS EXECUTADAS
    const totalcotaExeDpo = valorCotaExeDpo/180;

    // CALCULO DO SALDO FINAL
    const saldoFinalDpo = valorCotaDistDpo - valorCotaExeDpo;

    //---DPO | FIM CALCULAR OS VALORES E COTAS TOTAIS POR DIRETORIA-------------------------------------------------------------------------

//---DPO | FIM

//---DIM | INICIO

    //---DIM | INICIO TABELA DE COTAS DISTRIBUIDAS-------------------------------------------------------------------------
    
    const total_cotadistdim = await db.diarias.findAll({
        attributes:
        [
            'id', 'operacao', 'evento', 'cotadist', 'mes', 'idome', 'iduser', 'obs', 'ano',
            [Sequelize.literal('SUM(CASE WHEN operacao = "ORIGINAL" THEN cotadist ELSE 0 END)'),'total_cotadist_original'],
            [Sequelize.literal('SUM(CASE WHEN operacao = "REFORCO" THEN cotadist ELSE 0 END)'), 'total_cotadist_reforco'],
            [Sequelize.literal('SUM(cotadist)'),'total_cotadist'],
            [Sequelize.literal('SUM(cotadist) * 180'),'total_cotadist_multiplicado']
        ],
        where: {
            idome:[2, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17],
            mes,
            ano,
        },
        include: [
            { model: db.omes, attributes: ['nome'] },
            { model: db.users, attributes: ['name'] }
        ],
        group: ['idome', 'ome.nome', 'user.name'],
        raw: true,
    });

    //----DIM | INICIO TABELA DE COTAS EXECUTADAS-------------------------------------------------------------------------
            
    const total_cotaexedim = await db.diariasgercota.findAll({
        attributes:
        [
            'id','id_ome', 'ttexe', 'mes', 'ano', 'obs',
            [Sequelize.literal('SUM(ttexe)'), 'total_cotaexe'],
            [Sequelize.literal('SUM(ttexe) * 180'), 'total_cotaexe_multiplicado'],    
        ],
        where:{
            id_ome:[2, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17],
            mes,
            ano,
        },
        include: [
            { model: db.omes, attributes: ['nome'] },
        ],
        group: ['id_ome', 'ome.nome'],
        raw: true,
    });

    //--- DIM | INICIO CALCULAR OS VALORES TOTAIS POR DIRETORIA--

    //VALOR FINAL DE COTAS DISTRIBUIDAS OFICIAIS DIM     
    const valorfinal_cotadistdim = await db.diarias.findAll({
        attributes: [
            [Sequelize.literal('SUM(cotadist) * 180'), 'valor_cotadist_multiplicado'],
        ],
        where: {
            idome:[2, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17],
            mes,
            ano,
        },
        raw: true,
    });

    //VALOR DE COTAS EXECUTADAS OFICIAIS DIM
    const valorfinal_cotaexedim = await db.diariasgercota.findAll({
        attributes: [
            [Sequelize.literal('SUM(ttexe) * 180'), 'valor_cotaexe_multiplicado'],
        ],
        where: {
            id_ome:[2, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17],
            mes,
            ano,
        },
        raw: true,
    });

    //---DIM | INICIO CALCULAR OS VALORES E COTAS TOTAIS POR DIRETORIA-------------------------------------------------------------------------

    // CALCULO DO VALOR DISTRIBUIDO
    const valorCotaDistDim = parseFloat(valorfinal_cotadistdim[0]?.valor_cotadist_multiplicado) || 0;

    // CALCULO DO TOTAL DE COTAS DISTRIBUIDAS
    const totalcotaDistDimOrig = parseFloat(total_cotadistdim[0]?.total_cotadist_original) || 0;
    const totalcotaDistDimRef = parseFloat(total_cotadistdim[0]?.total_cotadist_reforco) || 0;
    const totalcotaDistDim = valorCotaDistDim/180;
        
    // CALCULO DO VALOR EXECUTADO
    const valorCotaExeDim = parseFloat(valorfinal_cotaexedim[0]?.valor_cotaexe_multiplicado) || 0;

    // CALCULO DO TOTAL DE COTAS EXECUTADAS
    const totalcotaExeDim = valorCotaExeDim/180;

    // CALCULO DO SALDO FINAL
    const saldoFinalDim = valorCotaDistDim - valorCotaExeDim;

    //---DIM | FIM CALCULAR OS VALORES E COTAS TOTAIS POR DIRETORIA-------------------------------------------------------------------------

//---DIM | FIM


//---DIRESP | INICIO

    //---DIRESP | INICIO TABELA DE COTAS DISTRIBUIDAS-------------------------------------------------------------------------
    
    const total_cotadistdiresp = await db.diarias.findAll({
        attributes:
        [
            'id', 'operacao', 'evento', 'cotadist', 'mes', 'idome', 'iduser', 'obs', 'ano',
            [Sequelize.literal('SUM(CASE WHEN operacao = "ORIGINAL" THEN cotadist ELSE 0 END)'),'total_cotadist_original'],
            [Sequelize.literal('SUM(CASE WHEN operacao = "REFORCO" THEN cotadist ELSE 0 END)'), 'total_cotadist_reforco'],
            [Sequelize.literal('SUM(cotadist)'),'total_cotadist'],
            [Sequelize.literal('SUM(cotadist) * 180'),'total_cotadist_multiplicado']
        ],
        where: {
            idome:[3, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33],
            mes,
            ano,
        },
        include: [
            { model: db.omes, attributes: ['nome'] },
            { model: db.users, attributes: ['name'] }
        ],
        group: ['idome', 'ome.nome', 'user.name'],
        raw: true,
    });

    //----DIRESP | INICIO TABELA DE COTAS EXECUTADAS-------------------------------------------------------------------------
            
    const total_cotaexediresp = await db.diariasgercota.findAll({
        attributes:
        [
            'id','id_ome', 'ttexe','mes', 'ano', 'obs',
            [Sequelize.literal('SUM(ttexe)'), 'total_cotaexe'],
            [Sequelize.literal('SUM(ttexe) * 180'), 'total_cotaexe_multiplicado'],    
        ],
        where:{
            id_ome:[3, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33],
            mes,
            ano,
        },
        include: [
            { model: db.omes, attributes: ['nome'] },
        ],
        group: ['id_ome', 'ome.nome'],
        raw: true,
    });

    //--- DIRESP | INICIO CALCULAR OS VALORES TOTAIS POR DIRETORIA--

    //VALOR FINAL DE COTAS DISTRIBUIDAS DIRESP     
    const valorfinal_cotadistdiresp = await db.diarias.findAll({
        attributes: [
            [Sequelize.literal('SUM(cotadist) * 180'), 'valor_cotadist_multiplicado'],
        ],
        where: {
            idome:[3, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33],
            mes,
            ano,
        },
        raw: true,
    });

    //VALOR DE COTAS EXECUTADAS OFICIAIS DIRESP
    const valorfinal_cotaexediresp = await db.diariasgercota.findAll({
        attributes: [
            [Sequelize.literal('SUM(ttexe) * 180'), 'valor_cotaexe_multiplicado'],
        ],
        where: {
            id_ome:[3, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33],
            mes,
            ano,
        },
        raw: true,
    });

    //---DIRESP | INICIO CALCULAR OS VALORES E COTAS TOTAIS POR DIRETORIA-------------------------------------------------------------------------

    // CALCULO DO VALOR DISTRIBUIDO
    const valorCotaDistDiresp = parseFloat(valorfinal_cotadistdiresp[0]?.valor_cotadist_multiplicado) || 0;

    // CALCULO DO TOTAL DE COTAS DISTRIBUIDAS
    const totalcotaDistDirespOrig = parseFloat(total_cotadistdiresp[0]?.total_cotadist_original) || 0;
    const totalcotaDistDirespRef = parseFloat(total_cotadistdiresp[0]?.total_cotadist_reforco) || 0;
    const totalcotaDistDiresp = valorCotaDistDiresp/180;
        
    // CALCULO DO VALOR EXECUTADO
    const valorCotaExeDiresp = parseFloat(valorfinal_cotaexediresp[0]?.valor_cotaexe_multiplicado) || 0;

    // CALCULO DO TOTAL DE COTAS EXECUTADAS
    const totalcotaExeDiresp = valorCotaExeDiresp/180;

    // CALCULO DO SALDO FINAL
    const saldoFinalDiresp = valorCotaDistDiresp - valorCotaExeDiresp;

    //---DIRESP | FIM CALCULAR OS VALORES E COTAS TOTAIS POR DIRETORIA-------------------------------------------------------------------------

//---DIRESP | FIM


//---DINTERI | INICIO

    //---DINTERI | INICIO TABELA DE COTAS DISTRIBUIDAS-------------------------------------------------------------------------
    
    const total_cotadistdinteri = await db.diarias.findAll({
        attributes:
        [
            'id', 'operacao', 'evento', 'cotadist', 'mes', 'idome', 'iduser', 'obs', 'ano',
            [Sequelize.literal('SUM(CASE WHEN operacao = "ORIGINAL" THEN cotadist ELSE 0 END)'),'total_cotadist_original'],
            [Sequelize.literal('SUM(CASE WHEN operacao = "REFORCO" THEN cotadist ELSE 0 END)'), 'total_cotadist_reforco'],
            [Sequelize.literal('SUM(cotadist)'),'total_cotadist'],
            [Sequelize.literal('SUM(cotadist) * 180'),'total_cotadist_multiplicado']
        ],
        where: {
            idome:[4, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49],
            mes,
            ano,
        },
        include: [
            { model: db.omes, attributes: ['nome'] },
            { model: db.users, attributes: ['name'] }
        ],
        group: ['idome', 'ome.nome', 'user.name'],
        raw: true,
    });

    //----DINTERI | INICIO TABELA DE COTAS EXECUTADAS-------------------------------------------------------------------------
            
    const total_cotaexedinteri = await db.diariasgercota.findAll({
        attributes:
        [
            'id','id_ome', 'ttexe','mes', 'ano', 'obs',
            [Sequelize.literal('SUM(ttexe)'), 'total_cotaexe'],
            [Sequelize.literal('SUM(ttexe) * 180'), 'total_cotaexe_multiplicado'],    
        ],
        where:{
            id_ome:[4, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49],
            mes,
            ano,
        },
        include: [
            { model: db.omes, attributes: ['nome'] },
        ],
        group: ['id_ome', 'ome.nome'],
        raw: true,
    });

    //--- DINTERI | INICIO CALCULAR OS VALORES TOTAIS POR DIRETORIA--

    //VALOR FINAL DE COTAS DISTRIBUIDAS DINTERI     
    const valorfinal_cotadistdinteri = await db.diarias.findAll({
        attributes: [
            [Sequelize.literal('SUM(cotadist) * 180'), 'valor_cotadist_multiplicado'],
        ],
        where: {
            idome:[4, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49],
            mes,
            ano,
        },
        raw: true,
    });

    //VALOR DE COTAS EXECUTADAS OFICIAIS DINTERI
    const valorfinal_cotaexedinteri = await db.diariasgercota.findAll({
        attributes: [
            [Sequelize.literal('SUM(ttexe) * 180'), 'valor_cotaexe_multiplicado'],
        ],
        where: {
            id_ome:[4, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49],
            mes,
            ano,
        },
        raw: true,
    });

    //---DINTERI | INICIO CALCULAR OS VALORES E COTAS TOTAIS POR DIRETORIA-------------------------------------------------------------------------

    // CALCULO DO VALOR DISTRIBUIDO
    const valorCotaDistDinteri = parseFloat(valorfinal_cotadistdinteri[0]?.valor_cotadist_multiplicado) || 0;

    // CALCULO DO TOTAL DE COTAS DISTRIBUIDAS
    const totalcotaDistDinteriOrig = parseFloat(total_cotadistdinteri[0]?.total_cotadist_original) || 0;
    const totalcotaDistDinteriRef = parseFloat(total_cotadistdinteri[0]?.total_cotadist_reforco) || 0;
    const totalcotaDistDinteri = valorCotaDistDinteri/180;
        
    // CALCULO DO VALOR EXECUTADO
    const valorCotaExeDinteri = parseFloat(valorfinal_cotaexedinteri[0]?.valor_cotaexe_multiplicado) || 0;

    // CALCULO DO TOTAL DE COTAS EXECUTADAS
    const totalcotaExeDinteri = valorCotaExeDinteri/180;

    // CALCULO DO SALDO FINAL
    const saldoFinalDinteri = valorCotaDistDinteri - valorCotaExeDinteri;

    //---DINTERI | FIM CALCULAR OS VALORES E COTAS TOTAIS POR DIRETORIA-------------------------------------------------------------------------

//---DINTERI | FIM


//---DINTERII | INICIO

    //---DINTERII | INICIO TABELA DE COTAS DISTRIBUIDAS-------------------------------------------------------------------------
    
    const total_cotadistdinterii = await db.diarias.findAll({
        attributes:
        [
            'id', 'operacao', 'evento', 'cotadist', 'mes', 'idome', 'iduser', 'obs', 'ano',
            [Sequelize.literal('SUM(CASE WHEN operacao = "ORIGINAL" THEN cotadist ELSE 0 END)'),'total_cotadist_original'],
            [Sequelize.literal('SUM(CASE WHEN operacao = "REFORCO" THEN cotadist ELSE 0 END)'), 'total_cotadist_reforco'],
            [Sequelize.literal('SUM(cotadist)'),'total_cotadist'],
            [Sequelize.literal('SUM(cotadist) * 180'),'total_cotadist_multiplicado']
        ],
        where: {
            idome:[5, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62],
            mes,
            ano,
        },
        include: [
            { model: db.omes, attributes: ['nome'] },
            { model: db.users, attributes: ['name'] }
        ],
        group: ['idome', 'ome.nome', 'user.name'],
        raw: true,
    });

    //----DINTERII | INICIO TABELA DE COTAS EXECUTADAS-------------------------------------------------------------------------
            
    const total_cotaexedinterii = await db.diariasgercota.findAll({
        attributes:
        [
            'id','id_ome', 'ttexe','mes', 'ano', 'obs',
            [Sequelize.literal('SUM(ttexe)'), 'total_cotaexe'],
            [Sequelize.literal('SUM(ttexe) * 180'), 'total_cotaexe_multiplicado'],    
        ],
        where:{
            id_ome:[5, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62],
            mes,
            ano,
        },
        include: [
            { model: db.omes, attributes: ['nome'] },
        ],
        group: ['id_ome', 'ome.nome'],
        raw: true,
    });

    //--- DINTERII | INICIO CALCULAR OS VALORES TOTAIS POR DIRETORIA--

    //VALOR FINAL DE COTAS DISTRIBUIDAS DINTERII     
    const valorfinal_cotadistdinterii = await db.diarias.findAll({
        attributes: [
            [Sequelize.literal('SUM(cotadist) * 180'), 'valor_cotadist_multiplicado'],
        ],
        where: {
            idome:[5, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62],
            mes,
            ano,
        },
        raw: true,
    });

    //VALOR DE COTAS EXECUTADAS OFICIAIS DINTERII
    const valorfinal_cotaexedinterii = await db.diariasgercota.findAll({
        attributes: [
            [Sequelize.literal('SUM(ttexe) * 180'), 'valor_cotaexe_multiplicado'],
        ],
        where: {
            id_ome:[5, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62],
            mes,
            ano,
        },
        raw: true,
    });

    //---DINTERII | INICIO CALCULAR OS VALORES E COTAS TOTAIS POR DIRETORIA-------------------------------------------------------------------------

    // CALCULO DO VALOR DISTRIBUIDO
    const valorCotaDistDinterii = parseFloat(valorfinal_cotadistdinterii[0]?.valor_cotadist_multiplicado) || 0;

    // CALCULO DO TOTAL DE COTAS DISTRIBUIDAS
    const totalcotaDistDinteriiOrig = parseFloat(total_cotadistdinterii[0]?.total_cotadist_original) || 0;
    const totalcotaDistDinteriiRef = parseFloat(total_cotadistdinterii[0]?.total_cotadist_reforco) || 0;
    const totalcotaDistDinterii = valorCotaDistDinterii/180;
        
    // CALCULO DO VALOR EXECUTADO
    const valorCotaExeDinterii = parseFloat(valorfinal_cotaexedinterii[0]?.valor_cotaexe_multiplicado) || 0;

    // CALCULO DO TOTAL DE COTAS EXECUTADAS
    const totalcotaExeDinterii = valorCotaExeDinterii/180;

    // CALCULO DO SALDO FINAL
    const saldoFinalDinterii = valorCotaDistDinterii - valorCotaExeDinterii;

    //---DINTERII | FIM CALCULAR OS VALORES E COTAS TOTAIS POR DIRETORIA-------------------------------------------------------------------------

//---DINTERII | FIM


    const dataAtual = new Date();
    const anoAtual = dataAtual.getFullYear();
    const mesAtual = dataAtual.getMonth() + 1; // Mês atual (janeiro é 0, fevereiro é 1, ..., dezembro é 11)

    function converterMesNunparaAbrev(mesAtual) {
        switch (mesAtual) {
            case '1':
                return 'JAN';
            case '2':
                return 'FEV';
            case '3':
                return 'MAR';
            case '4':
                return 'ABR';
            case '5':
                return 'MAI';
            case '6':
                return 'JUN';
            case '7':
                return 'JUL';
            case '8':
                return 'AGO';
            case '9':
                return 'SET';
            case '10':
                return 'OUT';
            case '11':
                return 'NOV';
            case '12':
                return 'DEZ';
            default:
                return mesAtual;
        }
    }



    // INICIO -  CONSULTA PARA TRAZER O TETO DA TABELA tetodiarias
    const nomeMesConvertido = converterMesNunparaAbrev(mesAtual);
    const ttgeralinicialmes = await db.tetodiarias.findOne({
        attributes: ['id', 'ctgeralinicial', 'mes', 'ano'],
        where: {
            ano: anoAtual,
            mes: { [Sequelize.Op.lte]: nomeMesConvertido }
            //mes: { [Sequelize.Op.lte]: mesAtual } // A soma é Somente até o mês atual
        }});

    const somaTtexe = await db.diariasgercota.sum('ttexe', {
        where: {
            ano: anoAtual,
            mes: { [Sequelize.Op.lte]: nomeMesConvertido }
            //mes: {[Sequelize.Op.lte]: mesAtual}
        }
    });

    const totalSaldoCtRenAnual = ttgeralinicialmes.ctgeralinicial - somaTtexe;
    const valorSaldoCtRenAnual = totalSaldoCtRenAnual*180;

    //---CALCULO TOTAL - PARTE SUPERIOR DA TELA diarias | INICIO
    const ctGeralInicial = ttgeralinicialmes.ctgeralinicial; //QTD de cota inicial
    const valorGeralInicial = ctGeralInicial*180; //VLR total de cota inicial
    const totalcotaDist = totalcotaDistDpo + totalcotaDistDim + totalcotaDistDiresp + totalcotaDistDinteri + totalcotaDistDinterii; // QTD total dist
    const valorGeralDist = totalcotaDist*180; //VLR total de cota inicial
    const totalcotaExe = totalcotaExeDpo + totalcotaExeDim + totalcotaExeDiresp + totalcotaExeDinteri + totalcotaExeDinterii; // QTD total dist
    const valorGeralExe = totalcotaExe*180; //VLR total de cota inicial
    const ctAtual = ctGeralInicial - totalcotaDist; // QTD atual
    const totalSaldoMes = ctGeralInicial - totalcotaDist;
    const valorSaldoMes = totalSaldoMes*180;



    // BLOCO QUE CONSTA A QUANTIDADE DE OMES PARA PRESTAR CONTA
    let totalPrestarContaPendente = 0;
    try {
            // Consulta para obter o total de eventos do governo onde cotaofdist ou cotaprcdist são maiores que zero
            const querydiarias = await db.diarias.findAll({
                attributes: [
                'idome', 'ano',
                ],
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
                    { cotadist: { [Sequelize.Op.gt]: 0 } },
                ]
                },
                group: ['idome'],
                raw: true
            });

            // Consulta para obter os valores de ttofexe e ttprcexe da tabela diariasgercota onde são maiores que zero
            const querydiariasgercota = await db.diariasgercota.findAll({
                attributes: [
                'id_ome', 'ano',
                ],
                where: {
                id_ome: [
                    1, 65, 66, 67, 68, 69, 70, 71, 72, 73, 2, 6, 7, 8, 9,
                    10, 11, 12, 13, 14, 15, 16, 17, 3, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29,
                    30, 31, 32, 33, 4, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49,
                    5, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62
                ],
                [Sequelize.Op.or]: [
                    { ttexe: { [Sequelize.Op.gt]: 0 } },
                ],
                mes,
                ano,
                },
                group: ['id_ome'],
                raw: true
            });

            const countDiarias = querydiarias.length;
            const countDiariasGercota = querydiariasgercota.length;
            totalPrestarContaPendente = countDiarias - countDiariasGercota;


    } catch (error) {
        console.error('Erro ao contar eventos do governo:', error);
    }


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

    
    diarias = await db.diarias.findAll({
        attributes: [
            'id', 'idome', 'operacao', 'evento', 'cotadist',  'idfpg', 'mes', 'ano',  'iduser', 'obs',
        ],
        where: {
            mes,
            ano,
        },
        order: [['id', 'DESC']],
        include: [
            { model: db.omes, attributes: ['nome'] },
            { model: db.omes, as: 'idfpgOme', attributes: ['nome'], required: false }, // Alias 'pcontasOme' para a associação com pcontasOmeId
            { model: db.users, attributes: ['name'] }
        ],
    })
    .then((diarias) => {
        if (diarias.length !== 0) {

            res.render("admin/diarias/list", {
                layout: 'main', profile: req.user.dataValues, user, nomeMes, nomeAno, sidebarSituations: true,
                diarias: diarias.map(id => id.toJSON()),

                total_cotadistdpo, total_cotaexedpo, valorCotaDistDpo, totalcotaExeDpo, totalcotaDistDpoOrig, totalcotaDistDpoRef,
                valorCotaExeDpo, saldoFinalDpo,

                total_cotadistdim, total_cotaexedim, valorCotaDistDim, totalcotaExeDim, totalcotaDistDimOrig, totalcotaDistDimRef,
                valorCotaExeDim, saldoFinalDim,

                total_cotadistdiresp, total_cotaexediresp, valorCotaDistDiresp, totalcotaExeDiresp, totalcotaDistDirespOrig, totalcotaDistDirespRef,
                valorCotaExeDiresp, saldoFinalDiresp,

                total_cotadistdinteri, total_cotaexedinteri, valorCotaDistDinteri, totalcotaExeDinteri, totalcotaDistDinteriOrig, totalcotaDistDinteriRef,
                valorCotaExeDinteri, saldoFinalDinteri,

                total_cotadistdinterii, total_cotaexedinterii, valorCotaDistDinterii, totalcotaExeDinterii, totalcotaDistDinteriiOrig, totalcotaDistDinteriiRef,
                valorCotaExeDinterii, saldoFinalDinterii,

                valorGeralInicial,ctGeralInicial,totalcotaDist, valorGeralDist, ctAtual,
                totalcotaExe, valorGeralExe, totalSaldoMes, valorSaldoMes, totalSaldoCtRenAnual, valorSaldoCtRenAnual,
                totalPrestarContaPendente,
            });
        } else {
            res.render("admin/diarias/list", {
                layout: 'main', profile: req.user.dataValues, sidebarSituations: true, danger_msg: 'Erro: Nenhum Evento Cadastrado!'
            });
        }

    })
    .catch(() => {
        res.render("admin/diarias/list", {
            layout: 'main', profile: req.user.dataValues, sidebarSituations: true, danger_msg: 'Erro: Nenhum Evento Cadastrado!'
        });
    });
});


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

    const idfpg = await db.omes.findAll({
        attributes: ['id', 'nome'],
        order: [['nome', 'ASC']]
    });
    if (idfpg) {dataForm['idfpg'] = idfpg;}


    if (omes) {
        dataForm['omes'] = omes;
       // dataForm['diretorias'] = diretorias;
    }

    // Pausar o processamento, carregar a view, carregar o layout main, indicar qual item de menu deve ficar ativo
    res.render('admin/diarias/add', { layout: 'main', profile: req.user.dataValues, data: dataForm, nomeMes, nomeAno, sidebarSituations: true });

});

// TELA QUE ADCIONA (CREATE) O EVENTO
router.post('/add', eAdmin, async (req, res) => {

    const nomeMes = req.session.mes;
    const nomeAno = req.session.ano;
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
        return res.render("admin/diarias/add", { layout: 'main', profile: req.user.dataValues, sidebarSituations: true, data, danger_msg: error.errors });
    }

    // Cadastrar no banco de dados
    db.diarias.create(data).then(() => {

        // Criar a mensagem de situação cadastrado com sucesso, e-mail enviado
        req.flash("success_msg", "Evento cadastrado!");
        

        res.redirect(`/diarias?mes=${nomeMes}&ano=${nomeAno}`);
    }).catch(() => {
        // Pausar o processamento e carregar a view enviando os dados que o usuário havia preenchido no formulário
        return res.render("admin/diarias/add", { layout: 'main', profile: req.user.dataValues, sidebarSituations: true, data: req.body, danger_msg: "Erro: Evento não cadastrado!" });

    });

});

// TELA QUE VISUALIZA O FORM DA EDIÇÃO DO EVENTO
router.get('/edit/:id', eAdmin, async (req, res) => {
    const nomeMes = req.session.mes;
    const nomeAno = req.session.ano;

    // Receber o id enviado na URL
    const { id } = req.params;

    // Recuperar o registro do banco de dados
    const diaria = await db.diarias.findOne({
        attributes: ['id', 'idome', 'operacao', 'evento', 'cotadist', 'idfpg', 'mes', 'ano',  'iduser', 'obs', 'sei'],
        where: {
            id
        },
        include: [
            {model: db.omes, attributes: ['id', 'nome']},
            {model: db.omes, as: 'idfpgOme', attributes: ['id', 'nome'] }
        ]
    });

    // Acessa o IF se encontrar o registro no banco de dados
    if (diaria) {
        var dataForm = diaria.dataValues;

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
        if (omes) {dataForm['omes'] = omes;}


        // Adicionar também o `pcontasOme` aqui, se necessário
        const idfpgome = await db.omes.findAll({
            attributes: ['id', 'nome'],
            order: [['nome', 'ASC']]
        });
        dataForm['idfpgome'] = idfpgome;

        
        res.render('admin/diarias/edit', { layout: 'main', profile: req.user.dataValues, nomeMes, nomeAno, data: dataForm, sidebarSituations: true });
        
    } else {
        // Criar a mensagem de erro
        req.flash("danger_msg", "Erro: DIARIAS não encontrada!");
        // Redirecionar o usuário
        res.redirect('/diarias?page=1');
    }
});

//TELA QUE EDITA (UPDATE) O EVENTO PJES
router.post('/edit', eAdmin, async (req, res) => {
    // Receber os dados do formulário
    var dataForm = req.body;
    var data = req.body;
    const nomeMes = req.session.mes;
    const nomeAno = req.session.ano;

    
    const schema = yup.object().shape({
        evento: yup.string().required("Erro: Necessário preencher o campo nome!")
    });


    const omes = await db.omes.findAll({
        attributes: ['id', 'nome'],
        order: [['nome', 'ASC']]
    });

    if (omes) {dataForm['omes'] = omes;}

    const ome = await db.omes.findOne({
        attributes: ['id', 'nome'],
        where: {id: data.idfpg},
        order: [['nome', 'ASC']]
    });

    if (ome) {dataForm['ome'] = ome;}

    try {
        await schema.validate(data);
        // Editar no banco de dados
        await db.diarias.update(data, { where: { id: data.id } });
        req.flash("success_msg", "PJES editado com sucesso!");
        res.redirect(`/diarias?mes=${nomeMes}&ano=${nomeAno}`);
    } catch (error) {
        // Em caso de erro ao editar no banco de dados
        console.error("Erro ao editar DIARIAS:", error);
        res.render('admin/diarias/edit', { 
            layout: 'main', 
            profile: req.user.dataValues, 
            data: data, 
            sidebarSituations: true, 
            danger_msg: "DIARIAS não editada com sucesso!" 
        });
    }
    
});

router.get('/delete/:id', async (req, res) => {
    const diarias = await db.pjes.findOne({
        attributes: ['id'],
        where: {id:req.params.id}
    });

    db.diarias.destroy({ where: {id: req.params.id}
    }).then(() => {
        req.flash("success_msg", "Evento excluido com sucesso!");
        res.redirect('/diarias?page=1');
    }).catch(() => {
        req.flash("danger_msg", "Evento não pode ser Excluído devido a ter Policiais Escalados");
        res.redirect('/diarias/view/' + req.params.id);
    })    
});


// Criar a rota para página com formulário cadastrar situação, usar a função eAdmin com middleware para verificar se o usuário está logado
router.get('/diariasgercota/:id', eAdmin, async (req, res) => {

    const { id } = req.params;
    const nomeMes = req.session.mes;
    const nomeAno = req.session.ano;
    
    const diarias = await db.diariasgercota.findOne({
         attributes: ['id','id_ome', 'id_diretoria', 'ttexe','mes', 'ano', 'obs','createdAt','updatedAt'],
         where: {id},
        include: [
            {model: db.omes, attributes: ['nome'],}
        ],
    });

     if (diarias) {
         var dataForm = diarias.dataValues;
         res.render('admin/diarias/diariasgercota', { layout: 'main', profile: req.user.dataValues, diarias, data: dataForm, nomeMes, nomeAno, sidebarSituations: true });
     } else {
         req.flash("danger_msg", "Erro: Prestação de conta com Erro!");
         res.redirect('/diarias?page=1');
     }
 
 });
 
 // SALVAR PRESTAÇÃO CONTA
 router.post('/diariasgercota', eAdmin, async (req, res) => {
     var data = req.body;
     var dataForm = req.body;

     db.diariasgercota.update(data, { where: {id: data.id} }).then(() => {
         req.flash("success_msg", "Prestação de Conta Concluida com Sucesso!");
         res.redirect('/diarias?page=1');
     }).catch(() => {
         res.render('admin/diarias/edit', { layout: 'main', profile: req.user.dataValues, data: dataForm, sidebarSituations: true, danger_msg: "Erro na Prestação de Conta!" });
     });
 });
 





module.exports = router;
