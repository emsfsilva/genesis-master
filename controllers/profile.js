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
// Operador do sequelize 
const { Op } = require("sequelize");
// Incluir o arquivo com a função de upload
const upload = require('../helpers/uploadImgUser');
// O módulo fs permite interagir com o sistema de arquivos
const fs = require('fs');

// Criar a rota do listar usuários, usar a função eAdmin com middleware para verificar se o usuário está logado
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
            { model: db.omes, attributes: ['nome'] },
            { model: db.situations, attributes: ['nameSituation'] }
        ],
    });

    // Acessa o IF se encontrar o registro no banco de dados
    if (user) {
        // Pausar o processamento, carregar a view, carregar o layout main, envia os dados para a view
        res.render("admin/profile/view", { layout: 'main', profile: req.user.dataValues, user });
    } else {
        // Criar a mensagem de erro
        req.flash("danger_msg", "Erro: Usuário não encontrado!");
        // Redirecionar o usuário
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
        res.render('admin/profile/edit', { layout: 'main', profile: req.user.dataValues, data: dataForm });
    } else {
        // Criar a mensagem de erro
        req.flash("danger_msg", "Erro: Usuário não encontrado!");
        // Redirecionar o usuário
        res.redirect('/login');
    }
});

// Criar a rota para receber os dados do formulário editar dados do perfil, usar a função eAdmin com middleware para verificar se o usuário está logado
router.post('/edit', eAdmin, async (req, res) => {
    // Receber os dados do formulário
    var data = req.body;

    // Enviar dados para o formulário
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
        return res.render("admin/profile/edit", { layout: 'main', profile: req.user.dataValues, data: dataForm, danger_msg: error.errors });
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
        return res.render("admin/profile/edit", { layout: 'main', profile: req.user.dataValues, data: dataForm, danger_msg: "Erro: Este e-mail já está cadastrado!" });
    }

    // Editar no banco de dados
    db.users.update(data, { where: { id: req.user.dataValues.id } }).then(() => {

        req.user.dataValues.name = data.name;
        req.user.dataValues.email = data.email;

        // Criar a mensagem de perfil editado com sucesso
        req.flash("success_msg", "Perfil editado com sucesso!");

        // Redirecionar o usuário após editar para a página perfil
        res.redirect('/profile');

    }).catch(() => {
        // Pausar o processamento, carregar a view, carregar o layout main
        res.render('admin/profile/edit', { layout: 'main', profile: req.user.dataValues, data: dataForm, danger_msg: "Perfil não editado com sucesso!" });
    });
});

// Criar a rota para página com formulário editar senha do perfil, usar a função eAdmin com middleware para verificar se o usuário está logado
router.get('/edit-password', eAdmin, async (req, res) => {

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
        res.render('admin/profile/edit-password', { layout: 'main', profile: req.user.dataValues });
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
        return res.render("admin/profile/edit-password", { layout: 'main', profile: req.user.dataValues, data: dataForm, danger_msg: error.errors });
    }

    //Criptografar a senha
    data.password = await bcrypt.hash(data.password, 8);

    // Editar no banco de dados
    db.users.update(data, { where: { id: req.user.dataValues.id } }).then(() => {
        // Criar a mensagem de senha editada com sucesso
        req.flash("success_msg", "Senha editada com sucesso!");

        // Redirecionar o usuário após editar para a página perfil
        res.redirect('/profile');

    }).catch(() => {
        // Pausar o processamento, carregar a view, carregar o layout main
        res.render('admin/profile/edit-password', { layout: 'main', profile: req.user.dataValues, danger_msg: "Senha não editada com sucesso!" });
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
        res.render('admin/profile/edit-image', { layout: 'main', profile: req.user.dataValues, data: dataForm });
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
        return res.render('admin/profile/edit-image', { layout: 'main', profile: req.user.dataValues, danger_msg: "Erro: Selecione uma foto válida JPEG ou PNG!" });
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
        res.redirect('/profile');

    }).catch(() => {
        // Pausar o processamento, carregar a view, carregar o layout main, indicar qual item de menu deve ficar ativo
        res.render('admin/profile/edit-image', { layout: 'main', profile: req.user.dataValues, danger_msg: "Erro: Foto não editada com sucesso!" });
    });
    
});

// Exportar a instrução que está dentro da constante router 
module.exports = router;
