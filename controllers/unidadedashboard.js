const express = require('express');
const router = express.Router();
const { eAdmin } = require("../helpers/eAdmin");
const db = require('../db/models');

router.get('/', eAdmin, async (req, res) => {
  
    res.render("unidade/dashboard/dashboard", { layout: 'main', profile: req.user.dataValues, sidebarDashboard: true });
});

module.exports = router;
