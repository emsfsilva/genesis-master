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

const sequelize = db.sequelize; // Importe a instância do Sequelize
  const { Op } = require('sequelize');

router.get('/', eAdmin, async (req, res) => {
    
    if (1 !== 0) {

        const escalas = await db.escalas.findAll({
          attributes: [
            'id', 'operacao', 'pg', 'matricula', 'nome', 'telefone', 'status', 'modalidade', 
            'data_inicio', 'hora_inicio', 'data_fim', 'hora_fim', 'ome_sgpm', 
            'localap', 'anotacoes', 'idevento', 'idome', 'createdAt', 'updatedAt',
            [sequelize.fn('date_format', sequelize.col('data_inicio'), '%b'), 'mes_abreviado']
          ],
          where: { idome:req.user.dataValues.omeId },
          order: [['data_inicio', 'ASC']],
          include: [
            { model: db.omes, attributes: ['nome'] }, // Inclui o nome da tabela omes usando idome   idomeescalas
            { model: db.pjes, attributes: ['evento'] } // Inclui o evento da tabela pjes usando idevento

          ],
        });

         // Agrupa as escalas por mês abreviado
      const escalasAgrupadas = {};
      escalas.forEach(escala => {
          const mesAbreviado = escala.get('mes_abreviado');
          if (!escalasAgrupadas[mesAbreviado]) {
              escalasAgrupadas[mesAbreviado] = [];
          }
          escalasAgrupadas[mesAbreviado].push(escala.toJSON());
      });

        return res.render("unidade/unidadeconsultarEscalas/list", { layout: 'main', profile: req.user.dataValues, sidebarSituations: true, escalasAgrupadas: escalasAgrupadas, danger_msg: 'Nenhuma Escala Encontrada' });
        
    } else {
        // Pausar o processamento, carregar a view, carregar o layout main, indicar qual item de menu deve ficar ativo, enviar mensagem de erro
        return res.render("unidade/unidadeconsultarEscalas/list", { layout: 'main', profile: req.user.dataValues, sidebarSituations: true, danger_msg: 'Erro: Nenhum omes encontrada!' });
    }
    
});

  
  /* 
      router.get('/consultar', eAdmin, async (req, res) => {
      try {
        const { matricula } = req.query;

      const pmEscalado = await db.escalas.findOne({
        attributes: ['id', 'pg', 'matricula', 'nome', 'ome_sgpm'],
        where: { matricula: matricula }
      });

        const escalas = await db.escalas.findAll({
          attributes: [
            'id', 'operacao', 'pg', 'matricula', 'nome', 'telefone', 'status', 'modalidade', 
            'data_inicio', 'hora_inicio', 'data_fim', 'hora_fim', 'ome_sgpm', 
            'localap', 'anotacoes', 'idevento', 'idome', 'createdAt', 'updatedAt',
            [sequelize.fn('date_format', sequelize.col('data_inicio'), '%b'), 'mes_abreviado']
          ],
          where: { matricula: matricula },
          order: [['data_inicio', 'ASC']],
          include: [
            { model: db.omes, attributes: ['nome'] }, // Inclui o nome da tabela omes usando idome
            { model: db.pjes, attributes: ['evento'] } // Inclui o evento da tabela pjes usando idevento
          ],
        });

        console.log('A variavel escalas é', escalas);

        if (!escalas || escalas.length === 0) {
          return res.render('unidade/unidadeconsultarEscalas/view', {
            layout: 'main',
            profile: req.user.dataValues,
            sidebarSituations: true,
            danger_msg: 'Nenhuma Escala Encontrada!'
          });
        }

        // Agrupa as escalas por mês abreviado
        const escalasAgrupadas = {};
        escalas.forEach(escala => {
            const mesAbreviado = escala.get('mes_abreviado');
            if (!escalasAgrupadas[mesAbreviado]) {
                escalasAgrupadas[mesAbreviado] = [];
            }
            escalasAgrupadas[mesAbreviado].push(escala.toJSON());
        });

        // Renderiza a view com as escalas agrupadas por mês
        res.render('unidade/unidadeconsultarEscalas/view', {
            layout: 'main',
            profile: req.user.dataValues, pmEscalado: pmEscalado,
            sidebarSituations: true,
            escalasAgrupadas: escalasAgrupadas  // Passa as escalas agrupadas para a view
        });
    
      } catch (error) {
        console.error('Erro ao consultar escalas:', error);
        res.render('unidade/unidadeconsultarEscalas/view', {
          layout: 'main',
          profile: req.user.dataValues,
          sidebarSituations: true,
          danger_msg: 'Erro ao consultar escalas. Por favor, tente novamente mais tarde.'
        });
      }
    });

  */


    router.get('/consultar', eAdmin, async (req, res) => {
      try {
        const { matricula } = req.query;

        const pmEscalado = await db.escalas.findOne({
          attributes: ['id', 'pg', 'matricula', 'nome', 'ome_sgpm'],
          where: { matricula: matricula }
        });
    
        // 1. Encontre todas as escalas associadas à matrícula fornecida
        const escalasPorMatricula = await db.escalas.findAll({
          attributes: ['idevento', 'data_inicio', 'hora_inicio', 'hora_fim'],
          where: { matricula: matricula },
          include: [
            { model: db.pjes, attributes: ['evento'], required: true }  // Inclui o evento associado ao idevento
          ],
          order: [['data_inicio', 'ASC']],
        });
    
        if (!escalasPorMatricula || escalasPorMatricula.length === 0) {
          return res.render('unidade/unidadeconsultarEscalas/view', {
            layout: 'main',
            profile: req.user.dataValues,
            sidebarSituations: true,
            danger_msg: 'Nenhuma Escala Encontrada!'
          });
        }
    
        // 2. Crie uma lista de combinações únicas de idevento, data_inicio e hora_inicio
        const combinacoes = escalasPorMatricula.map(escala => ({
          idevento: escala.idevento,
          data_inicio: escala.data_inicio,
          hora_inicio: escala.hora_inicio,
          hora_fim: escala.hora_fim
        }));
    
        // 3. Faça uma consulta para encontrar todos os associados para cada combinação
        const escalasAgrupadas = {};
    
        for (const { idevento, data_inicio, hora_inicio, hora_fim } of combinacoes) {
          const escalasAssociados = await db.escalas.findAll({
            attributes: ['id', 'pg', 'matricula', 'nome', 'telefone','ome_sgpm', 'modalidade' , 'hora_inicio', 'hora_fim', 'idome', 'anotacoes'],
            where: {
              idevento: idevento,
              data_inicio: data_inicio,
              hora_inicio: hora_inicio,
              hora_fim: hora_fim
            },
            include: [
              { model: db.pjes, attributes: ['evento'], required: true }, // Inclui o evento associado ao idevento
              { model: db.omes, attributes: ['nome'] }, // Inclui o nome da tabela omes usando idome   idomeescalas
            ],
            order: [
              sequelize.literal(`CASE pg
                WHEN 'CEL' THEN 1
                WHEN 'TC' THEN 2
                WHEN 'MAJ' THEN 3
                WHEN 'CAP' THEN 4
                WHEN '1º TEN' THEN 5
                WHEN '1º TEN' THEN 6
                WHEN 'SUBTEN' THEN 7
                WHEN '1º SGT' THEN 8
                WHEN '1º SGT' THEN 9
                WHEN '1º SGT' THEN 10
                WHEN 'CB' THEN 11
                WHEN 'SD' THEN 12
                ELSE 13
              END`)
            ]
          });
    
          const dataInicio = new Date(data_inicio);
          const mes = dataInicio.toLocaleString('pt-BR', { month: 'long' }).toUpperCase(); // Exemplo: 'JANEIRO'
          const chaveMes = `${mes}_${dataInicio.getFullYear()}`;
    
          if (!escalasAgrupadas[chaveMes]) {
            escalasAgrupadas[chaveMes] = {};
          }
    
          const evento = escalasAssociados[0]?.pje?.evento || 'Desconhecido'; // Usar o evento do primeiro resultado como referência
    
          if (!escalasAgrupadas[chaveMes][evento]) {
            escalasAgrupadas[chaveMes][evento] = {};
          }
    
          const chaveIdeventoDataHora = `${idevento}_${data_inicio}_${hora_inicio}_${hora_fim}`;
          
          if (!escalasAgrupadas[chaveMes][evento][chaveIdeventoDataHora]) {
            escalasAgrupadas[chaveMes][evento][chaveIdeventoDataHora] = {
              idevento,
              data_inicio,
              hora_inicio,
              hora_fim,
              escalas: []
            };
          }
    
          // Adiciona a escala à lista de escalas do idevento específico
          escalasAgrupadas[chaveMes][evento][chaveIdeventoDataHora].escalas.push(...escalasAssociados.map(escala => ({
            id: escala.dataValues.id,
            pg: escala.dataValues.pg,
            matricula: escala.dataValues.matricula,
            nome: escala.dataValues.nome,
            telefone: escala.dataValues.telefone,
            ome_sgpm: escala.dataValues.ome_sgpm,
            modalidade: escala.dataValues.modalidade,
            hora_inicio: escala.dataValues.hora_inicio,
            hora_fim: escala.dataValues.hora_fim,
            anotacoes: escala.dataValues.anotacoes,
            ome: escala.dataValues.ome.nome 
          })));
        }
    
        // 4. Transforme a estrutura em um formato que o template pode utilizar
        const escalasAgrupadasParaView = Object.entries(escalasAgrupadas).map(([mes, eventos]) => {
          return {
            mes,
            eventos: Object.entries(eventos).map(([evento, ideventos]) => {
              return {
                evento,
                ideventos: Object.values(ideventos)
              };
            })
          };
        });
    
        console.log('Escalas Agrupadas:', escalasAgrupadas);
    
        // 5. Renderize a view com as escalas agrupadas por mês e evento
        res.render('unidade/unidadeconsultarEscalas/view', {
          layout: 'main',
          profile: req.user.dataValues, pmEscalado,
          escalasAgrupadasPorMes: escalasAgrupadasParaView,
          sidebarSituations: true
        });
    
      } catch (error) {
        console.error('Erro ao consultar escalas:', error);
        res.render('unidade/unidadeconsultarEscalas/view', {
          layout: 'main',
          profile: req.user.dataValues,
          sidebarSituations: true,
          danger_msg: 'Erro ao consultar escalas. Por favor, tente novamente mais tarde.'
        });
      }
    });
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    






  
// Exportar a instrução que está dentro da constante router 
module.exports = router;
