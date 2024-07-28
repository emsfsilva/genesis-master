// middlewarePjes.js

const express = require('express');
const router = express.Router();

// Função para mapear o nome do mês para o número do mês
function mesParaNumero(mes) {
    switch (mes.toUpperCase()) {
        case 'JAN':
            return 'JAN';
        case 'FEV':
            return 'FEV';
        case 'MAR':
            return 'MAR';
        case 'ABR':
            return 'ABR';
        case 'MAI':
            return 'MAI';
        case 'JUN':
            return 'JUN';
        case 'JUL':
            return 'JUL';
        case 'AGO':
            return 'AGO';
        case 'SET':
            return 'SET';
        case 'OUT':
            return 'OUT';
        case 'NOV':
            return 'NOV';
        case 'DEZ':
            return 'DEZ';
        default:
            return null; // Retorna null se o mês não for reconhecido
    }
}

router.use((req, res, next) => {
    const { mes, ano } = req.query;
    if (mes) {
        const numeroMes = mesParaNumero(mes);
        if (numeroMes !== null) {
            // Armazena 'mes' na sessão do usuário
            req.session.mes = numeroMes;
            req.session.ano = ano;
        } else {
            req.session.mes = null; // Ou outro tratamento de erro
        }
    }
    next();
});


module.exports = router;
