const express = require('express');
const router = express.Router();
const { eAdmin } = require("../helpers/eAdmin");
const db = require('./../db/models');


router.get('/',eAdmin, async (req, res) => {
    const { page = 1 } = req.query;
    const limit = 40;
    var lastPage = 1;

    const countUser = await db.users.count();

    if (countUser !== 0) {
        lastPage = Math.ceil(countUser / limit);
    } else {
        return res.render("unidade/unidadeusers/list", { layout: 'main', profile: req.user.dataValues, sidebarUsers: true, danger_msg: 'Erro: Nenhum usuário encontrado!' });
    }

    const users = await db.users.findAll({

        attributes: ['id', 'name','image','situationId', 'omeId',  'pcontasOmeId', 'email', 'loginsei', 'matricula', 'telefone'],

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

            var pagination = {
                path: '/unidadeusers',
                page,
                prev_page_url: ((Number(page) - Number(1)) >= 1) ? Number(page) - Number(1) : false,
                next_page_url: ((Number(page) + Number(1)) > Number(lastPage)) ? false : Number(page) + Number(1),
                lastPage
            }
            res.render("unidade/unidadeusers/list", { layout: 'main', profile: req.user.dataValues, sidebarUsers: true, users: users.map(id => id.toJSON()), pagination });
        } else {
            res.render("unidade/unidadeusers/list", { layout: 'main', profile: req.user.dataValues, sidebarUsers: true, danger_msg: 'Erro: Nenhum usuário encontrado!' });
        }

    }).catch(() => {
            res.render("unidade/unidadeusers/list", { layout: 'main', profile: req.user.dataValues, sidebarUsers: true, danger_msg: 'Erro: Nenhum usuário encontrado!' });
    })
});

module.exports = router;
