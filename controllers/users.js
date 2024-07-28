const express = require('express');
const router = express.Router();
const { eAdmin } = require("../helpers/eAdmin");
const db = require('./../db/models');
const bcrypt = require('bcryptjs');
const yup = require('yup');
const { Op } = require("sequelize");
const upload = require('../helpers/uploadImgUser');
const fs = require('fs');
const users = require('../db/models/users');

// Criar a rota do listar usuários, usar a função eAdmin com middleware para verificar se o usuário está logado
router.get('/',eAdmin, async (req, res) => {
    //console.log(req.user.dataValues.id);
    // Receber o número da página, quando não é enviado o número da página é atribuido página 1
    const { page = 1 } = req.query;
    // Limite de registros em cada página
    const limit = 40;
    // Variável com o número da última página
    var lastPage = 1;

    // Contar a quantidade de registro no banco de dados
    const countUser = await db.users.count();

    // Acessa o IF quando encontrar registro no banco de dados
    if (countUser !== 0) {
        // Calcular a última página
        lastPage = Math.ceil(countUser / limit);
    } else {
        // Pausar o processamento, carregar a view, carregar o layout main, indicar qual item de menu deve ficar ativo, enviar mensagem de erro
        return res.render("admin/users/list", { layout: 'main', profile: req.user.dataValues, sidebarUsers: true, danger_msg: 'Erro: Nenhum usuário encontrado!' });
    }

    // Recuperar todos os usuário do banco de dados
    const users = await db.users.findAll({
        // Indicar quais colunas recuperar
        attributes: ['id', 'name','image','situationId', 'omeId',  'pcontasOmeId', 'email', 'loginsei', 'matricula', 'telefone'],
        // Ordenar os registros pela coluna id na forma decrescente
        order: [['id', 'DESC']],
        include: [
            { model: db.omes, as: 'ome', attributes: ['nome'], required: false }, // Alias 'ome' para a associação com omeId
            { model: db.omes, as: 'PcontasOme', attributes: ['nome'], required: false }, // Alias 'pcontasOme' para a associação com pcontasOmeId
            { model: db.situations, attributes: ['nameSituation'] }
        ],
        offset: Number((page * limit) - limit),
        limit: limit
    }).then((users) => {
        if (users.length !== 0) {

            // Criar objeto com as informações para paginação
            var pagination = {
                // Caminho
                path: '/users',
                // Página atual
                page,
                // URL da página anterior
                prev_page_url: ((Number(page) - Number(1)) >= 1) ? Number(page) - Number(1) : false,
                // URL da próxima página
                next_page_url: ((Number(page) + Number(1)) > Number(lastPage)) ? false : Number(page) + Number(1),
                // última página
                lastPage
            }
            //console.log(users);
            // Pausar o processamento, carregar a view, carregar o layout main, indicar qual item de menu deve ficar ativo, enviar os registros retornado do banco de dados 
            res.render("admin/users/list", { layout: 'main', profile: req.user.dataValues, sidebarUsers: true, users: users.map(id => id.toJSON()), pagination });
        } else {
            // Pausar o processamento, carregar a view, carregar o layout main, indicar qual item de menu deve ficar ativo, enviar mensagem de erro
            res.render("admin/users/list", { layout: 'main', profile: req.user.dataValues, sidebarUsers: true, danger_msg: 'Erro: Nenhum usuário encontrado!' });
        }

    }).catch(() => {
        // Pausar o processamento, carregar a view, carregar o layout main, indicar qual item de menu deve ficar ativo, enviar mensagem de erro
        res.render("admin/users/list", { layout: 'main', profile: req.user.dataValues, sidebarUsers: true, danger_msg: 'Erro: Nenhum usuário encontrado!' });
    })
});

// Criar a rota para página visualizar os detalhes do registro, usar a função eAdmin com middleware para verificar se o usuário está logado
router.get('/view/:id',eAdmin, async (req, res) => {

    // Receber o id enviado na URL
    const { id } = req.params;

    // Recuperar o registro do banco de dados
    const user = await db.users.findOne({
        // Indicar quais colunas recuperar
        attributes: ['id', 'name', 'email', 'image', 'situationId', 'omeId', 'pcontasOmeId', 'loginsei', 'matricula', 'telefone', 'createdAt', 'updatedAt'],
        // Acrescentado condição para indicar qual registro deve ser retornado do banco de dados
        where: {
            id
        },
        include: [
            { model: db.omes, as: 'ome', attributes: ['nome'], required: false }, // Alias 'ome' para a associação com omeId
            { model: db.omes, as: 'PcontasOme', attributes: ['nome'], required: false }, // Alias 'pcontasOme' para a associação com pcontasOmeId
            { model: db.situations, attributes: ['nameSituation'] }
        ],
    });

    // Acessa o IF se encontrar o registro no banco de dados
    if (user) {
        res.render("admin/users/view", { layout: 'main', profile: req.user.dataValues, sidebarUsers: true, user });
    } else {
        // Criar a mensagem de erro
        req.flash("danger_msg", "Erro: Usuário não encontrado!");
        // Redirecionar o usuário
        res.redirect('/users');
    }
});

// Criar a rota para página com formulário cadastrar usuário, usar a função eAdmin com middleware para verificar se o usuário está logado
router.get('/add', eAdmin, async (req, res) => {

    var dataForm = [];

    const situations = await db.situations.findAll({
        attributes: ['id', 'nameSituation'],
        order: [['nameSituation', 'ASC']]
    });
    if (situations) {dataForm['situations'] = situations;}

    const omes = await db.omes.findAll({
        attributes: ['id', 'nome'],
        order: [['nome', 'ASC']]
    });
    if (omes) {dataForm['omes'] = omes;}

    const pcontasOmeId = await db.omes.findAll({
        attributes: ['id', 'nome'],
        order: [['nome', 'ASC']]
    });
    if (pcontasOmeId) {dataForm['pcontasOmeId'] = pcontasOmeId;}
    
    // Pausar o processamento, carregar a view, carregar o layout main, indicar qual item de menu deve ficar ativo
    res.render('admin/users/add', { layout: 'main', profile: req.user.dataValues, data: dataForm, sidebarUsers: true });

});

// Criar a rota para receber os dados do formulário cadastrar usuário, usar a função eAdmin com middleware para verificar se o usuário está logado
router.post('/add', eAdmin, async (req, res) => {

    var data = req.body;
    var dataForm = req.body;
    var password = dataForm['password'];
    
    const situations = await db.situations.findAll({
        attributes: ['id', 'nameSituation'],
        order: [['nameSituation', 'ASC']]
    });

    if (situations) {dataForm['situations'] = situations;}

    const situation = await db.situations.findOne({
        attributes: ['id', 'nameSituation'],
        where: {
            id: data.situationId
        },
        order: [['nameSituation', 'ASC']]
    });

    if (situation) {dataForm['situation'] = situation;}

    const omes = await db.omes.findAll({
        attributes: ['id', 'nome'],
        order: [['nome', 'ASC']]
    });

    if (omes) {dataForm['omes'] = omes;}

    const ome = await db.omes.findOne({
        attributes: ['id', 'nome'],
        where: {
            id: data.omeId
        },
        order: [['nome', 'ASC']]
    });

    if (ome) {dataForm['ome'] = omes;}

    // Validar os campos utilizando o yup
    const schema = yup.object().shape({
        situationId: yup.string("Erro: Necessário preencher o campo situação!")
            .required("Erro: Necessário preencher o campo situação!"),
        password: yup.string("Erro: Necessário preencher o campo senha!")
            .required("Erro: Necessário preencher o campo senha!")
            .min(6, "Erro: A senha deve ter no mínimo 6 caracteres!"),
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
        return res.render("admin/users/add", { layout: 'main', profile: req.user.dataValues, sidebarUsers: true, data: dataForm, danger_msg: error.errors });
    }

    const user = await db.users.findOne({
        attributes: ['id', 'email'],
        where: {email: data.email}
    });

    if (user) {        
        return res.render("admin/users/add", { layout: 'main', profile: req.user.dataValues, sidebarUsers: true, data: dataForm, danger_msg: "Erro: Este e-mail já está cadastrado!" });
    }

    data.password = await bcrypt.hash(data.password, 8);
    db.users.create(data).then((dataUser) => {
        req.flash("success_msg", "Usuário cadastrado com sucesso.!");
        res.redirect('/users/view/' + dataUser.id);

    }).catch(() => {
        dataForm['password'] = password;
        return res.render("admin/users/add", { layout: 'main', profile: req.user.dataValues, sidebarUsers: true, data: dataForm, danger_msg: "Erro: Usuário não cadastrado com sucesso!" });
    });
});

// Criar a rota para página com formulário editar usuário, usar a função eAdmin com middleware para verificar se o usuário está logado
router.get('/edit/:id', eAdmin, async (req, res) => {
    const { id } = req.params;

    const user = await db.users.findOne({
        attributes: ['id', 'name', 'email', 'image', 'situationId', 'omeId', 'pcontasOmeId', 'loginsei', 'matricula', 'telefone'],
        where: { id },
        include: [
            { model: db.omes, attributes: ['id', 'nome'] },
            { model: db.situations, attributes: ['id', 'nameSituation'] },
            { model: db.omes, as: 'PcontasOme', attributes: ['id', 'nome'] }
        ],
    });

    if (user) {
        const dataForm = user.dataValues;

        const situations = await db.situations.findAll({
            attributes: ['id', 'nameSituation'],
            order: [['nameSituation', 'ASC']]
        });
        dataForm['situations'] = situations;

        const omes = await db.omes.findAll({
            attributes: ['id', 'nome'],
            order: [['nome', 'ASC']]
        });
        dataForm['omes'] = omes;

        // Adicionar também o `pcontasOme` aqui, se necessário
        const pcontasOme = await db.omes.findAll({
            attributes: ['id', 'nome'],
            order: [['nome', 'ASC']]
        });
        dataForm['pcontasOme'] = pcontasOme;

        res.render('admin/users/edit', { layout: 'main', profile: req.user.dataValues, data: dataForm, sidebarUsers: true });
    } else {
        req.flash("danger_msg", "Erro: Usuário não encontrado!");
        res.redirect('/users?page=1');
    }
});


// Criar a rota para receber os dados do formulário editar usuário
router.post('/edit', eAdmin, async (req, res) => {
    // Receber os dados do formulário
    var data = req.body;

    var dataForm = req.body;

    
    const situations = await db.situations.findAll({
        attributes: ['id', 'nameSituation'],
        order: [['nameSituation', 'ASC']]
    });

    if (situations) {dataForm['situations'] = situations;}

    const situation = await db.situations.findOne({
        attributes: ['id', 'nameSituation'],
        where: {id: data.situationId},
        order: [['nameSituation', 'ASC']]
    });

    if (situation) {dataForm['situation'] = situation;}

    const omes = await db.omes.findAll({
        attributes: ['id', 'nome'],
        order: [['nome', 'ASC']]
    });

    if (omes) {dataForm['omes'] = omes;}

    const ome = await db.omes.findOne({
        attributes: ['id', 'nome'],
        where: {id: data.omeId},
        order: [['nome', 'ASC']]
    });

    if (ome) {dataForm['ome'] = ome;}
    

    // Validar os campos utilizando o yup
    const schema = yup.object().shape({
        id: yup.string("Erro: Preenchimento incorreto do formulario!")
            .required("Erro: Preenchimento incorreto do formulario!"),
        situationId: yup.string("Erro: Necessário preencher o campo situação!")
            .required("Erro: Necessário preencher o campo situação!"),
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
        return res.render("admin/users/edit", { layout: 'main', profile: req.user.dataValues, sidebarUsers: true, data: dataForm, danger_msg: error.errors });
    }

    // Recuperar o registro do banco de dados
    const user = await db.users.findOne({
        // Indicar quais colunas recuperar
        attributes: ['id', 'email'],
        // Acrescentado condição para indicar qual registro deve ser retornado do banco de dados
        where: {
            email: data.email,
            id: {
                // Operador de de negação para ignorar o registro do usuário que está sendo editado
                [Op.ne]: data.id
            }
        }
    });

    // Acessa o IF se encontrar o registro no banco de dados
    if (user) {
        // Pausar o processamento e carregar a view enviando os dados que o usuário havia preenchido no formulário
        return res.render("admin/users/edit", { layout: 'main', profile: req.user.dataValues, sidebarUsers: true, data: dataForm, danger_msg: "Erro: Este e-mail já está cadastrado!" });
    }

    // Editar no banco de dados
    db.users.update(data, { where: { id: data.id } }).then(() => {
        // Criar a mensagem de usuário editado com sucesso
        req.flash("success_msg", "Usuário editado com sucesso!");
        // Redirecionar o usuário após editar
        //res.redirect('/users?page=1');

        // Redirecionar o usuário após editar para a página visualizar
        res.redirect('/users/view/' + data.id);

    }).catch(() => {
        // Pausar o processamento, carregar a view, carregar o layout main, indicar qual item de menu deve ficar ativo
        res.render('admin/users/edit', { layout: 'main', profile: req.user.dataValues, data: dataForm, sidebarUsers: true, danger_msg: "Usuário não editado com sucesso!" });
    });
});

// Criar a rota para página com formulário editar senha, usar a função eAdmin com middleware para verificar se o usuário está logado
router.get('/edit-password/:id', eAdmin, async (req, res) => {

    // Receber o id enviado na URL
    const { id } = req.params;

    // Recuperar o registro do banco de dados
    const user = await db.users.findOne({
        // Indicar quais colunas recuperar
        attributes: ['id', 'image'],
        // Acrescentar condição para indicar qual registro deve ser retornado do banco de dados
        where: {
            id
        }
    });

    // Acessa o IF se encontrar o registro no banco de dados
    if (user) {
        // Enviar dados para o formulário
        var dataForm = user.dataValues;

        // Pausar o processamento, carregar a view, carregar o layout main, indicar qual item de menu deve ficar ativo
        res.render('admin/users/edit-password', { layout: 'main', profile: req.user.dataValues, data: dataForm, sidebarUsers: true });
    } else {
        // Criar a mensagem de erro
        req.flash("danger_msg", "Erro: Usuário não encontrado!");
        // Redirecionar o usuário
        res.redirect('/users?page=1');
    }
});

// Criar a rota para receber os dados do formulário editar senha do usuário, usar a função eAdmin com middleware para verificar se o usuário está logado
router.post('/edit-password', eAdmin, async (req, res) => {
    // Receber os dados do formulário
    var data = req.body;

    // Enviar dados para o formulário
    var dataForm = req.body;
    var password = data['password'];

    // Validar os campos utilizando o yup
    const schema = yup.object().shape({
        id: yup.string("Erro: Preenchimento incorreto do formulario!")
            .required("Erro: Preenchimento incorreto do formulario!"),
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
        return res.render("admin/users/edit-password", { layout: 'main', profile: req.user.dataValues, sidebarUsers: true, data: dataForm, danger_msg: error.errors });
    }

    //Criptografar a senha
    data.password = await bcrypt.hash(data.password, 8);

    // Editar no banco de dados
    db.users.update(data, { where: { id: data.id } }).then(() => {
        // Criar a mensagem de usuário editado com sucesso
        req.flash("success_msg", "Senha editada com sucesso!");
        // Redirecionar o usuário após editar
        //res.redirect('/users?page=1');

        // Redirecionar o usuário após editar para a página visualizar
        res.redirect('/users/view/' + data.id);

    }).catch(() => {
        // Pausar o processamento, carregar a view, carregar o layout main, indicar qual item de menu deve ficar ativo
        res.render('admin/users/edit-password', { layout: 'main', profile: req.user.dataValues, data: dataForm, sidebarUsers: true, danger_msg: "Senha não editada com sucesso!" });
    });
});

// Criar a rota para página com formulário editar imagem, usar a função eAdmin com middleware para verificar se o usuário está logado
router.get('/edit-image/:id', eAdmin, async (req, res) => {
    // Receber o id enviado na URL
    const { id } = req.params;

    // Recuperar o registro do banco de dados
    const user = await db.users.findOne({
        // Indicar quais colunas recuperar
        attributes: ['id','name',['image', 'imageOld']],
        // Acrescentar condição para indicar qual registro deve ser retornado do banco de dados
        where: {
            id
        }
    });

    // Acessa o IF se encontrar o registro no banco de dados
    if (user) {
        // Enviar dados para o formulário
        var dataForm = user.dataValues;

        // Pausar o processamento, carregar a view, carregar o layout main, indicar qual item de menu deve ficar ativo
        res.render('admin/users/edit-image', { layout: 'main', profile: req.user.dataValues, data: dataForm, sidebarUsers: true });
    } else {
        // Criar a mensagem de erro
        req.flash("danger_msg", "Erro: Usuário não encontrado!");
        // Redirecionar o usuário
        res.redirect('/users?page=1');
    }
});

// Criar a rota para receber os dados do formulário editar imagem do usuário, usar a função eAdmin com middleware para verificar se o usuário está logado
router.post('/edit-image', eAdmin, upload.single('image'), async (req, res) => {
    // Receber os dados do formulário
    var data = req.body;

    // Enviar dados para o formulário
    var dataForm = req.body;

    // Acessa o IF quando a extensão da imagem é válida
    if (!req.file) {
        //console.log(req.file);
        // Pausar o processamento, carregar a view, carregar o layout main, indicar qual item de menu deve ficar ativo
        return res.render('admin/users/edit-image', { layout: 'main', profile: req.user.dataValues, data: dataForm, sidebarUsers: true, danger_msg: "Erro: Selecione uma imagem válida JPEG ou PNG!" });

    }

    // Recuperar o registro do banco de dados
    const user = await db.users.findOne({
        // Indicar quais colunas recuperar
        attributes: ['id', 'image'],

        // Acrescentar condição para indicar qual registro deve ser retornado do banco de dados
        where: {
            id: data.id
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
    db.users.update(
        { image: req.file.filename },
        { where: { id: data.id } })
        .then(() => {
            // Criar a mensagem de usuário editado com sucesso
            req.flash("success_msg", "Imagem editada com sucesso!");

            // Redirecionar o usuário após editar para a página visualizar
            res.redirect('/users/view/' + data.id);
        }).catch(() => {
            // Pausar o processamento, carregar a view, carregar o layout main, indicar qual item de menu deve ficar ativo
            res.render('admin/users/edit-image', { layout: 'main', profile: req.user.dataValues, data: dataForm, sidebarUsers: true, danger_msg: "Erro: Imagem não editada com sucesso!" });
        });

});

// Criar a rota apagar usuário no BD, usar a função eAdmin com middleware para verificar se o usuário está logado
router.get('/delete/:id', async (req, res) => {

    // Recuperar o registro do banco de dados
    const user = await db.users.findOne({
        // Indicar quais colunas recuperar
        attributes: ['id', 'image'],

        // Acrescentar condição para indicar qual registro deve ser retornado do banco de dados
        where: {
            id: req.params.id
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

    // Apagar usuário no banco de dados utilizando a MODELS users
    db.users.destroy({
        // Acrescentar o WHERE na instrução SQL indicando qual registro excluir no BD
        where: {
            id: req.params.id
        }
    }).then(() => {
        // Criar a mensagem de usuário apagado com sucesso
        req.flash("success_msg", "Usuário apagado com sucesso!");

        // Redirecionar o usuário após apagar com sucesso
        res.redirect('/users?page=1');
    }).catch(() => {
        // Criar a mensagem de usuário não apagado
        req.flash("danger_msg", "Usuário não apagado com sucesso!");

        // Redirecionar o usuário após não apagar
        //res.redirect('/users?page=1');
        res.redirect('/users/view/' + req.params.id);
    })
});

// Exportar a instrução que está dentro da constante router 
module.exports = router;
