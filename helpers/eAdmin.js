/*
const allowedDirectories = require('../helpers/allowedDirectories');
// Middleware para verificar se o usuário está autenticado e tem permissão para acessar a rota
module.exports = {
    eAdmin: function (req, res, next) {
        if (req.isAuthenticated() && req.user.omeId !== undefined) { // Verifica se está autenticado e se omeId está definido
            // Se omeId for igual a 1, permitir acesso irrestrito a todas as rotas
            if (req.user.omeId === 1) {
                return next();
            }

            const allowedDirs = allowedDirectories[req.user.omeId];
            const requestedPath = req.baseUrl + req.path;

            console.log('A variavel allow', allowedDirs);

            console.log('A variavel requestedPath', requestedPath);

            if (allowedDirs && allowedDirs.includes(requestedPath)) {
                return next();
            } else {
                req.logout(req.user, () => {
                    // Criar a mensagem de sucesso
                    req.flash("danger_msg", "Voce foi deslogado. Acesso não autorizado para esta página!");
                    // Redirecionar o usuário
                    res.redirect('/login');
                });
            }
        } else {
            req.flash("danger_msg", "Voce foi deslogado. Faça login novamente!");
            res.redirect('/login');
        }
    }
}

*/

const allowedDirectories = require('../helpers/allowedDirectories');
module.exports = {
    eAdmin: function (req, res, next) {
        if (req.isAuthenticated() && req.user.omeId !== undefined) {
            if (req.user.omeId === 1) {
                return next();
            }

            const allowedDirs = allowedDirectories[req.user.omeId];
            const requestedPath = req.baseUrl + req.path;

            // Verifica se o requestedPath está dentro dos allowedDirs
            if (allowedDirs && allowedDirs.some(dir => requestedPath.startsWith(dir))) {
                return next();
            } else {
                req.logout(req.user, () => {
                    req.flash("danger_msg", "Acesso não autorizado para esta página!");
                    res.redirect('/login');
                });
            }
        } else {
            req.flash("danger_msg", "Faça login para acessar esta página!");
            res.redirect('/login');
        }
    }
};



