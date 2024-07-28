// Incluir as bibliotecas
// Gerencia as requisições, rotas e URLs, entre outra funcionalidades
const express = require('express');
// Utilizado para manipular as rotas da aplicação
const router = express.Router();
// Middleware para a implementação de autenticação
const passport = require('passport');

// Criar a rota da página com formulário de login
router.get('/', (req, res) => {
    res.render("admin/login/login", { layout: 'login' });
});


/*// Criar a rota para receber os dados do formulário de login e validar login
router.post('/', (req, res, next) => {
    // Utilizar o usuário e a senha para validar o login
    
    passport.authenticate("local", {
        // Redirecionar o usuário quando o login e senha estiver correto
        successRedirect: "/dashboard",
        // Redirecionar o usuário quando o login e senha estiver incorreto
        failureRedirect: "/login",
        // Receber as mensagens de erro
        failureFlash: true
    })(req, res, next);
});
*/

/*router.post('/', (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
        if (err) { return next(err); }
        if (!user) { 
            req.flash("danger_msg", "Usuario ou Senha Invalidos!"); // Criar a mensagem de sucesso
            return res.redirect('/login');
        }

        // Aqui é onde você lida com o usuário autenticado
        req.login(user, (err) => {
            if (err) { return next(err); }

            // Verificar o valor de omeId no objeto do usuário
            switch (user.omeId) {
                case 1:
                    res.redirect("/dashboard");
                    break;
                case 2:
                    res.redirect("/unidade/dashboard");
                    break;
                case 3:
                    res.redirect("/diretoriadiresp/dashboard");
                    break;
                default:
                    res.redirect("/dashboard/comun");
                    break;
            }
        });
    })(req, res, next);
});

*/

router.post('/', (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
        if (err) { return next(err); }
        if (!user) { 
            req.flash("danger_msg", "Usuario ou Senha Invalidos!"); // Criar a mensagem de sucesso
            return res.redirect('/login');
        }

        // Aqui é onde você lida com o usuário autenticado
        req.login(user, (err) => {
            if (err) { return next(err); }

            // Verificar o valor de omeId no objeto do usuário
            switch (user.omeId) {
                case 1:
                    res.redirect("/dashboard");
                    break;
                default:
                    res.redirect("/unidade/dashboard"); // Qualquer unidade com idOme diferente de 1 (DPO)
                    break;
            }
        });
    })(req, res, next);
});



// Rota para sair do sistema administrativo
router.get('/logout', (req, res) => {
    // Remover os dados do usuário da sessão
    req.logout(req.user, () => {
        // Criar a mensagem de sucesso
        req.flash("success_msg", "Deslogado com sucesso!");
        // Redirecionar o usuário
        res.redirect('/login');
    });
});

// Exportar a instrução que está dentro da constante router 
module.exports = router;