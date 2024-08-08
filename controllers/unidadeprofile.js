// Incluir as bibliotecas
// Gerencia as requisições, rotas e URLs, entre outra funcionalidades
const express = require('express');
// Utilizado para manipular as rotas da aplicação
const router = express.Router();
// Arquivo com a funcionalidade para verificar se o usuário está logado
const { eAdmin } = require("../helpers/eAdmin");
// Incluir o arquivo que possui a conexão com banco de dados
const db = require('../db/models');
// Criptografar senha
const bcrypt = require('bcryptjs');
// Validar input do formulário
const yup = require('yup');
const sequelize = db.sequelize; // Importe a instância do Sequelize
// Operador do sequelize 
const { Op } = require("sequelize");


// Incluir o arquivo com a função de upload
const upload = require('../helpers/uploadImgUser');
// O módulo fs permite interagir com o sistema de arquivos
const fs = require('fs');

/*// Criar a rota do listar usuários, usar a função eAdmin com middleware para verificar se o usuário está logado
router.get('/', eAdmin, async (req, res) => {

    // Recuperar o registro do banco de dados
    const user = await db.users.findOne({
        // Indicar quais colunas recuperar
        attributes: ['id', 'name', 'email', 'image', 'situationId', 'omeId', 'pcontasOmeId', 'loginsei', 'matricula', 'telefone', 'createdAt'],
        // Acrescentado condição para indicar qual registro deve ser retornado do banco de dados
        where: {
            id: req.user.dataValues.id
        },
        include: [
            { model: db.omes, as: 'ome', attributes: ['nome'], required: false }, // Alias 'ome' para a associação com omeId
            { model: db.omes, as: 'PcontasOme', attributes: ['nome'], required: false }, // Alias 'pcontasOme' para a associação com pcontasOmeId
            { model: db.situations, attributes: ['nameSituation'] }
        ],
    });

    // Acessa o IF se encontrar o registro no banco de dados
    if (user) {
        // Pausar o processamento, carregar a view, carregar o layout main, envia os dados para a view
        res.render("unidade/unidadeprofile/view", { layout: 'main', profile: req.user.dataValues, user });
    } else {
        // Criar a mensagem de erro
        req.flash("danger_msg", "Erro: Usuário não encontrado!");
        // Redirecionar o usuário
        res.redirect('/login');
    }
});

*/


/*

// Criar a rota do listar usuários, usar a função eAdmin com middleware para verificar se o usuário está logado
router.get('/', eAdmin, async (req, res) => {
    try {
        // Recuperar o registro do banco de dados
        const user = await db.users.findOne({
            attributes: ['id', 'name', 'email', 'image', 'situationId', 'omeId', 'pcontasOmeId', 'loginsei', 'matricula', 'telefone', 'createdAt'],
            where: { id: req.user.dataValues.id },
            include: [
                { model: db.omes, as: 'ome', attributes: ['nome'], required: false },
                { model: db.omes, as: 'PcontasOme', attributes: ['nome'], required: false },
                { model: db.situations, attributes: ['nameSituation'] }
            ],
        });

        if (user) {

            console.log('O user é', user);
            // Extrair a matrícula do usuário
            const matricula = user.matricula;

            console.log('O matricula é', matricula);
        
            // Encontrar o PM escalado com base na matrícula do usuário
            const pmEscalado = await db.escalas.findOne({
                attributes: ['id', 'pg', 'matricula', 'nome', 'ome_sgpm'],
                where: { matricula: matricula }
            });
        
            // Encontrar todas as escalas associadas à matrícula do usuário
            const escalasPorMatricula = await db.escalas.findAll({
                attributes: ['matricula', 'idome', 'modalidade', 'idevento', 'data_inicio', 'hora_inicio', 'hora_fim'],
                where: { matricula: matricula },
                include: [
                    { model: db.pjes, attributes: ['evento'], required: true },
                    { model: db.omes, attributes: ['nome'], required: true }
                ],
                order: [['data_inicio', 'ASC']],
            });
        
            if (!escalasPorMatricula || escalasPorMatricula.length === 0) {
                return res.render('unidade/unidadeprofile/view', {
                    layout: 'main',
                    profile: req.user.dataValues,
                    sidebarSituations: true,
                    danger_msg: 'Nenhuma Escala Encontrada!'
                });
            }
        
            // Crie uma lista de combinações únicas de idevento, data_inicio e hora_inicio
            const combinacoes = escalasPorMatricula.map(escala => ({
                idevento: escala.idevento,
                data_inicio: escala.data_inicio,
                hora_inicio: escala.hora_inicio,
                hora_fim: escala.hora_fim
            }));
        
            // Agrupe as escalas por mês e evento
            const escalasAgrupadas = {};
        
            for (const { idevento, data_inicio, hora_inicio, hora_fim } of combinacoes) {
                const escalasAssociados = await db.escalas.findAll({
                    attributes: ['id', 'pg', 'matricula', 'nome', 'telefone', 'ome_sgpm', 'modalidade', 'hora_inicio', 'hora_fim', 'idome', 'anotacoes'],
                    where: {
                        idevento: idevento,
                        data_inicio: data_inicio,
                        hora_inicio: hora_inicio,
                        hora_fim: hora_fim
                    },
                    include: [
                        { model: db.pjes, attributes: ['evento'], required: true },
                        { model: db.omes, attributes: ['nome'] },
                    ],
                    order: [
                        sequelize.literal(`CASE pg
                            WHEN 'CEL' THEN 1
                            WHEN 'TC' THEN 2
                            WHEN 'MAJ' THEN 3
                            WHEN 'CAP' THEN 4
                            WHEN '1º TEN' THEN 5
                            WHEN 'SUBTEN' THEN 6
                            WHEN '1º SGT' THEN 7
                            WHEN 'CB' THEN 8
                            WHEN 'SD' THEN 9
                            ELSE 10
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

                console.log('As evento ', evento);
        
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
                    ome: escala.dataValues.ome.nome,
                })));
            };

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

            // Transforme as escalas em eventos para o FullCalendar
            const eventosFullCalendar = [];
            for (const escala of escalasPorMatricula) {
                const dataInicioStr = escala.dataValues.data_inicio; // formato: 'YYYY-MM-DD'
                const horaInicioStr = escala.dataValues.hora_inicio; // formato: 'HH:MM'
                const horaFimStr = escala.dataValues.hora_fim; // formato: 'HH:MM'

                // Crie a string completa para a data e hora
                const startDateStr = `${dataInicioStr}T${horaInicioStr}:00`;
                const endDateStr = `${dataInicioStr}T${horaFimStr}:00`;

                // Crie os objetos Date
                const startDate = new Date(startDateStr);
                const endDate = new Date(endDateStr);

                // Verifique se as datas foram criadas corretamente
                if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
                    console.error('Data inválida:', { startDateStr, endDateStr });
                    continue; // Pule a iteração se a data for inválida
                }

                // Acesse corretamente os dados
                const nome = escala.dataValues.pje.dataValues.evento || 'Desconhecido';
                const matricula = escala.dataValues.matricula || 'Desconhecida';
                const ome = escala.dataValues.ome.nome || 'Desconhecida';
                const modalidade = escala.dataValues.modalidade || 'Desconhecida';

                eventosFullCalendar.push({
                    title: `${nome}`,
                    start: startDate.toISOString(), // Formata a data para ISO 8601
                    end: endDate.toISOString(),     // Formata a data para ISO 8601
                    description: `${matricula}\nOme: ${ome}\nModalidade: ${modalidade}`
                });
            }

            // Renderize a view com os eventos do FullCalendar
            res.render('unidade/unidadeprofile/view', {
                layout: 'main',
                profile: req.user.dataValues,
                user,
                pmEscalado,
                escalasAgrupadasPorMes: escalasAgrupadasParaView,
                eventosFullCalendar: JSON.stringify(eventosFullCalendar), // Envie os eventos no formato JSON
                sidebarSituations: true
            });
        } else {
            // Criar a mensagem de erro
            req.flash("danger_msg", "Erro: Usuário não encontrado!");
            // Redirecionar o usuário
            res.redirect('/login');
        }
    } catch (error) {
        console.error('Erro no processamento da requisição:', error);
        req.flash("danger_msg", "Erro interno do servidor.");
        res.redirect('/login');
    }
});

*/


router.get('/', eAdmin, async (req, res) => {
    try {
        // Recuperar o registro do banco de dados
        const user = await db.users.findOne({
            attributes: ['id', 'name', 'email', 'image', 'situationId', 'omeId', 'pcontasOmeId', 'loginsei', 'matricula', 'telefone', 'createdAt'],
            where: { id: req.user.dataValues.id },
            include: [
                { model: db.omes, as: 'ome', attributes: ['nome'], required: false },
                { model: db.omes, as: 'PcontasOme', attributes: ['nome'], required: false },
                { model: db.situations, attributes: ['nameSituation'] }
            ],
        });

        if (user) {
            console.log('O user é', user);
            // Extrair a matrícula do usuário
            const matricula = user.matricula;

            console.log('O matricula é', matricula);
        
            // Encontrar o PM escalado com base na matrícula do usuário
            const pmEscalado = await db.escalas.findOne({
                attributes: ['id', 'pg', 'matricula', 'nome', 'ome_sgpm'],
                where: { matricula: matricula }
            });
        
            // Encontrar todas as escalas associadas à matrícula do usuário
            const escalasPorMatricula = await db.escalas.findAll({
                attributes: ['matricula', 'idome', 'modalidade', 'idevento', 'data_inicio', 'hora_inicio', 'hora_fim'],
                where: { matricula: matricula },
                include: [
                    { model: db.pjes, attributes: ['evento'], required: true },
                    { model: db.omes, attributes: ['nome'], required: true }
                ],
                order: [['data_inicio', 'ASC']],
            });
        
            if (!escalasPorMatricula || escalasPorMatricula.length === 0) {
                return res.render('unidade/unidadeprofile/view', {
                    layout: 'main',
                    profile: req.user.dataValues,
                    sidebarSituations: true,
                    danger_msg: 'Nenhuma Escala Encontrada!'
                });
            }
        
            // Crie uma lista de combinações únicas de idevento, data_inicio e hora_inicio
            const combinacoes = escalasPorMatricula.map(escala => ({
                idevento: escala.idevento,
                data_inicio: escala.data_inicio,
                hora_inicio: escala.hora_inicio,
                hora_fim: escala.hora_fim
            }));
        
            // Transforme as escalas em eventos para o FullCalendar
            const eventosFullCalendar = [];
            for (const { idevento, data_inicio, hora_inicio, hora_fim } of combinacoes) {
                const escalasAssociados = await db.escalas.findAll({
                    attributes: ['id', 'pg', 'matricula', 'nome', 'ome_sgpm', 'modalidade', 'telefone', 'localap', 'anotacoes'],
                    where: {
                        idevento: idevento,
                        data_inicio: data_inicio,
                        hora_inicio: hora_inicio,
                        hora_fim: hora_fim
                    },
                    include: [
                        { model: db.pjes, attributes: ['evento'], required: true },
                        { model: db.omes, attributes: ['nome'] },
                    ],
                    order: [
                        sequelize.literal(`CASE pg
                            WHEN 'CEL' THEN 1
                            WHEN 'TC' THEN 2
                            WHEN 'MAJ' THEN 3
                            WHEN 'CAP' THEN 4
                            WHEN '1º TEN' THEN 5
                            WHEN 'SUBTEN' THEN 6
                            WHEN '1º SGT' THEN 7
                            WHEN 'CB' THEN 8
                            WHEN 'SD' THEN 9
                            ELSE 10
                        END`)
                    ]
                });

                const startDateStr = `${data_inicio}T${hora_inicio}:00`;
                const endDateStr = `${data_inicio}T${hora_fim}:00`;

                const startDate = new Date(startDateStr);
                const endDate = new Date(endDateStr);

                if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
                    console.error('Data inválida:', { startDateStr, endDateStr });
                    continue;
                }

                const nomeEvento = escalasAssociados[0]?.pje?.evento || 'Desconhecido';
                const omeNome = escalasAssociados[0]?.ome?.nome || 'Desconhecido';

                const associadosDetalhes = escalasAssociados.map(a =>
                    ` - Nome: ${a.nome}\n - Mat: ${a.matricula}\n - P/G: ${a.pg}\n - Funç: ${a.modalidade}\n - Fone: ${a.telefone}\n - Local Ap: ${a.localap}\n - Obs: ${a.anotacoes}
                    \n ___________________________________________ `
                ).join('\n\n');

                eventosFullCalendar.push({
                    title: nomeEvento + ` | ${hora_inicio} às ${hora_fim} | ${omeNome}`,
                    start: startDate.toISOString(),
                    end: endDate.toISOString(),
                    //description: `Nome do Evento: ${nomeEvento}\nHora Início: ${hora_inicio}\nHora Fim: ${hora_fim}\nOME: ${omeNome}\n\nAssociados:\n${associadosDetalhes}`
                    description: `Equipe:\n${associadosDetalhes}`
                });
            }

            // Renderize a view com os eventos do FullCalendar
            res.render('unidade/unidadeprofile/view', {
                layout: 'main',
                profile: req.user.dataValues,
                user,
                pmEscalado,
                eventosFullCalendar: JSON.stringify(eventosFullCalendar),
                sidebarSituations: true
            });
        } else {
            // Criar a mensagem de erro
            req.flash("danger_msg", "Erro: Usuário não encontrado!");
            // Redirecionar o usuário
            res.redirect('/login');
        }
    } catch (error) {
        console.error('Erro no processamento da requisição:', error);
        req.flash("danger_msg", "Erro interno do servidor.");
        res.redirect('/login');
    }
});





// Criar a rota para página com formulário editar senha do perfil
router.get('/edit', eAdmin, async (req, res) => {

    // Recuperar o registro do banco de dados
    const user = await db.users.findOne({
        // Indicar quais colunas recuperar
        attributes: ['id', 'name', 'email', 'image', 'situationId', 'omeId', 'pcontasOmeId', 'loginsei', 'matricula', 'telefone'],
        // Acrescentar condição para indicar qual registro deve ser retornado do banco de dados
        where: {
            id: req.user.dataValues.id
        }
    });

    // Acessa o IF se encontrar o registro no banco de dados
    if (user) {
        // Enviar dados para o formulário
        var dataForm = user.dataValues;

        // Pausar o processamento, carregar a view, carregar o layout main e envia os dados para o formulário
        res.render('unidade/unidadeprofile/edit', { layout: 'main', profile: req.user.dataValues, data: dataForm });
    } else {
        // Criar a mensagem de erro
        req.flash("danger_msg", "Erro: Usuário não encontrado!");
        // Redirecionar o usuário
        res.redirect('/login');
    }
});

// Criar a rota para receber os dados do formulário editar dados do perfil, usar a função eAdmin com middleware para verificar se o usuário está logado
router.post('/edit', eAdmin, async (req, res) => {

    var data = req.body;
    var dataForm = req.body;

    // Validar os campos utilizando o yup
    const schema = yup.object().shape({
        email: yup.string("Erro: Necessário preencher o campo e-mail!")
            .required("Erro: Necessário preencher o campo e-mail!")
            .email("Erro: Necessário preencher e-mail válido!"),
        name: yup.string("Erro: Necessário preencher o campo nome!")
            .required("Erro: Necessário preencher o campo nome!")
    });

    // Verificar se todos os campos passaram pela validação
    try {
        await schema.validate(data);
    } catch (error) {
        // Pausar o processamento e carregar a view enviando os dados que o usuário havia preenchido no formulário
        return res.render("unidade/unidadeprofile/edit", { layout: 'main', profile: req.user.dataValues, data: dataForm, danger_msg: error.errors });
    }

    // Recuperar o registro do banco de dados
    const user = await db.users.findOne({
        // Indicar quais colunas recuperar
        attributes: ['id', 'email'],
        // Acrescentado condição para indicar qual registro deve ser retornado do banco de dados
        where: {
            email: data.email,
            id: {
                // Operador de negação para ignorar o registro do usuário que está sendo editado
                [Op.ne]: req.user.dataValues.id
            }
        }
    });

    // Acessa o IF se encontrar o registro no banco de dados
    if (user) {
        // Pausar o processamento e carregar a view enviando os dados que o usuário havia preenchido no formulário
        return res.render("unidade/unidadeprofile/edit", { layout: 'main', profile: req.user.dataValues, data: dataForm, danger_msg: "Erro: Este e-mail já está cadastrado!" });
    }

    // Editar no banco de dados
    db.users.update(data, { where: { id: req.user.dataValues.id } }).then(() => {

        req.user.dataValues.name = data.name;
        req.user.dataValues.email = data.email;

        // Criar a mensagem de perfil editado com sucesso
        req.flash("success_msg", "Perfil editado com sucesso!");

        // Redirecionar o usuário após editar para a página perfil
        res.redirect('/unidade/unidadeprofile');

    }).catch(() => {
        // Pausar o processamento, carregar a view, carregar o layout main
        res.render('unidade/unidadeprofile/edit', { layout: 'main', profile: req.user.dataValues, data: dataForm, danger_msg: "Perfil não editado com sucesso!" });
    });
});

// Criar a rota para página com formulário editar senha do perfil, usar a função eAdmin com middleware para verificar se o usuário está logado
router.get('/edit-password', eAdmin, async (req, res) => {

    var dataForm = req.body;

    // Recuperar o registro do banco de dados
    const user = await db.users.findOne({
        // Indicar quais colunas recuperar
        attributes: ['id'],
        // Acrescentar condição para indicar qual registro deve ser retornado do banco de dados
        where: {
            id: req.user.dataValues.id
        }
    });

    // Acessa o IF se encontrar o registro no banco de dados
    if (user) {

        // Pausar o processamento, carregar a view, carregar o layout main
        res.render('unidade/unidadeprofile/edit-password', { layout: 'main', profile: req.user.dataValues, data: dataForm});
    } else {
        // Criar a mensagem de erro
        req.flash("danger_msg", "Erro: Usuário não encontrado!");
        // Redirecionar o usuário
        res.redirect('/login');
    }
});

// Criar a rota para receber os dados do formulário editar senha, usar a função eAdmin com middleware para verificar se o usuário está logado
router.post('/edit-password', eAdmin, async (req, res) => {
    // Receber os dados do formulário
    var data = req.body;

    // Enviar dados para o formulário
    var dataForm = [];
    var password = data['password'];

    // Validar os campos utilizando o yup
    const schema = yup.object().shape({
        password: yup.string("Erro: Necessário preencher o campo senha!")
            .required("Erro: Necessário preencher o campo senha!")
            .min(6, "Erro: A senha deve ter no mínimo 6 caracteres!")
    });

    // Verificar se todos os campos passaram pela validação
    try {
        await schema.validate(data);
    } catch (error) {
        // Pausar o processamento e carregar a view enviando os dados que o usuário havia preenchido no formulário
        dataForm['password'] = password;
        return res.render("unidade/unidadeprofile/edit-password", { layout: 'main', profile: req.user.dataValues, data: dataForm, danger_msg: error.errors });
    }

    //Criptografar a senha
    data.password = await bcrypt.hash(data.password, 8);

    // Editar no banco de dados
    db.users.update(data, { where: { id: req.user.dataValues.id } }).then(() => {
        // Criar a mensagem de senha editada com sucesso
        req.flash("success_msg", "Senha editada com sucesso!");

        // Redirecionar o usuário após editar para a página perfil
        res.redirect('/unidade/unidadeprofile');

    }).catch(() => {
        // Pausar o processamento, carregar a view, carregar o layout main
        res.render('unidade/unidadeprofile/edit-password', { layout: 'main', profile: req.user.dataValues, danger_msg: "Senha não editada com sucesso!" });
    });

});

// Criar a rota para página com formulário editar foto do perfil, usar a função eAdmin com middleware para verificar se o usuário está logado
router.get('/edit-image', eAdmin, async (req, res) => {

    // Recuperar o registro do banco de dados
    const user = await db.users.findOne({
        // Indicar quais colunas recuperar
        attributes: ['id', 'name', ['image', 'imageOld']],
        // Acrescentar condição para indicar qual registro deve ser retornado do banco de dados
        where: {
            id: req.user.dataValues.id
        }
    });

    // Acessa o IF se encontrar o registro no banco de dados
    if (user) {
        // Enviar dados para o formulário
        var dataForm = user.dataValues;

        // Pausar o processamento, carregar a view, carregar o layout main
        res.render('unidade/unidadeprofile/edit-image', { layout: 'main', profile: req.user.dataValues, data: dataForm });
    } else {
        // Criar a mensagem de erro
        req.flash("danger_msg", "Erro: Usuário não encontrado!");
        // Redirecionar o usuário
        res.redirect('/login');
    }
});

// Criar a rota para receber os dados do formulário editar foto, usar a função eAdmin com middleware para verificar se o usuário está logado
router.post('/edit-image', upload.single('image'), eAdmin, async (req, res) => {
    // Acessa o IF quando a extensão da imagem é válida
    if (!req.file) {
        // Pausar o processamento, carregar a view, carregar o layout main, indicar qual item de menu deve ficar ativo
        return res.render('unidade/unidadeprofile/edit-image', { layout: 'main', profile: req.user.dataValues, danger_msg: "Erro: Selecione uma foto válida JPEG ou PNG!" });
    }

    // Recuperar o registro do banco de dados
    const user = await db.users.findOne({
        // Indicar quais colunas recuperar
        attributes: ['id', 'image'],

        // Acrescentar condição para indicar qual registro deve ser retornado do banco de dados
        where: {
            id: req.user.dataValues.id
        }    
    });
    
    // Verificar se o usuário tem imagem salva no banco de dados
    if (user.dataValues.image) {
        // Criar o caminho da imagem que o usuário tem no banco de dados
        var imgOld = "./public/images/users/" + user.dataValues.image;

        // fs.access usado para testar as permissões do arquivo
        fs.access(imgOld, (err) => {
            // Acessa o IF quando não tiver nenhum erro
            if (!err) {
                // Apagar a imagem antiga
                fs.unlink(imgOld, () => { })
            }
        });
    }

    // Editar no banco de dados
    db.users.update({ image: req.file.filename }, { where: { id: req.user.dataValues.id } }).then(() => {
        
        //Alterar as informaçoes do Usuario na seção
        req.user.dataValues.image = req.file.filename;

        // Criar a mensagem de foto editado com sucesso
        req.flash("success_msg", "Foto editada com sucesso!");

        // Redirecionar o usuário após editar para a página perfil
        res.redirect('/unidade/unidadeprofile');

    }).catch(() => {
        // Pausar o processamento, carregar a view, carregar o layout main, indicar qual item de menu deve ficar ativo
        res.render('unidade/unidadeprofile/edit-image', { layout: 'main', profile: req.user.dataValues, danger_msg: "Erro: Foto não editada com sucesso!" });
    });
    
});

// Exportar a instrução que está dentro da constante router 
module.exports = router;
