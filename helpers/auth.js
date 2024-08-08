/*// Validar o usuário e a senha com dados locais
const localStrategy = require('passport-local').Strategy;
// Criptografar senha
const bcryptjs = require('bcryptjs');
// Incluir o arquivo que possui a conexão com banco de dados
const db = require('./../db/models');
const { use } = require('passport');

// Criar a função para validar o login e a senha e exportar para utilizar em outras partes do projeto
module.exports = function (passport) {
    passport.use(new localStrategy({
        // Receber os dados dos campos
        usernameField: 'loginsei',
        passwordField: 'password'
    }, async (loginsei, password, done) => {
        // Recuperar as informações do usuário do banco de dados
        await db.users.findOne({
            // Indicar quais colunas recuperar
            attributes: ['id', 'password', 'situationId', 'omeId', 'pcontasOmeId', 'loginsei', 'matricula'],
            // Acrescentado condição para indicar qual registro deve ser retornado do banco de dados
            where: {
                loginsei
            },
            include: [
                { model: db.omes, attributes: ['id','nome'] },
                { model: db.situations, attributes: ['id', 'nameSituation'] }
            ]
        }).then(async (user) => {
            // Acessa o IF quando não encontrar o usuário no banco de dados
            if (!user) {
                return done(null, false, { message: "Erro: Login ou senha incorreto!" });
            }
            
            // Comparar a senha do formulário com a senha salva no banco de dados
            bcryptjs.compare(password, user.password, (erro, correct) => {

                // Acessa o IF quando a senha estiver correta e a situação diferente de 1 "ativo"
                if((correct) && (user.dataValues.situationId != 1)){
                    return done(null, false, { message: "Erro: Necessário confirmar o e-mail, solicite novo link <a href='/conf-email'>clique aqui</a>!" });
                } else if(correct){ // Acessa o ELSE IF quando a senha está correta
                    return done(null, user);
                }else{ // Acessa o ELSE quando a senha está incorreta
                    return done(null, false, { message: "Erro: E-mail ou senha incorreta!" })
                }
            });            
        });

        

        // Salvar os dados do usuário na sessão
        passport.serializeUser((user, done) => {
            done(null, user.id);
        });

        

        passport.deserializeUser(async (id, done) => {
            try {
                const user = await db.users.findByPk(id, {
                    attributes: ['id', 'name', 'email', 'image', 'situationId', 'omeId', 'pcontasOmeId', 'loginsei', 'matricula'],
                    include: [
                        { model: db.omes, attributes: ['id','nome'] },
                        { model: db.situations, attributes: ['id', 'nameSituation'] }
                    ],
                });

                if (!user) {
                    return done(new Error('User not found'));
                }
        
                // Aqui, user.ome.nome deveria conter o nome da ome
                done(null, user);
            } catch (err) {
                done(err, null);
            }
        });
        
    }));
}

*/

const localStrategy = require('passport-local').Strategy;
const bcryptjs = require('bcryptjs');
const db = require('./../db/models');

module.exports = function (passport) {

    passport.use(new localStrategy({
        usernameField: 'loginsei',
        passwordField: 'password'
    }, async (loginsei, password, done) => {
        try {
            const user = await db.users.findOne({
                attributes: ['id', 'password', 'situationId', 'omeId', 'pcontasOmeId', 'loginsei', 'matricula', 'telefone'],
                where: { loginsei },
                include: [
                    { model: db.omes, attributes: ['id', 'nome'] },
                    { model: db.situations, attributes: ['id', 'nameSituation'] },
                    { model: db.omes, as: 'PcontasOme', attributes: ['nome'], required: false }
                ]
            });

            if (!user) {
                
                return done(null, false, { message: "Erro: Login ou senha incorreto!" });
            }

            bcryptjs.compare(password, user.password, async (err, correct) => {
                if (err) throw err;

                if (!correct) {
                    return done(null, false, { message: "Erro: E-mail ou senha incorreta!" });
                }

                if (user.situationId !== 1) {
                    return done(null, false, { message: "Erro: Necessário confirmar o e-mail, solicite novo link <a href='/conf-email'>clique aqui</a>!" });
                }

                return done(null, user);
            });


        } catch (err) {
            return done(err);
        }
    }));

    passport.serializeUser((user, done) => {
        done(null, user.id);

    });

    passport.deserializeUser(async (id, done) => {
        try {
            const user = await db.users.findByPk(id, {
                attributes: ['id', 'name', 'email', 'image', 'situationId', 'omeId', 'pcontasOmeId', 'loginsei', 'matricula', 'telefone'],
                include: [
                    { model: db.omes, attributes: ['id', 'nome'] },
                    { model: db.situations, attributes: ['id', 'nameSituation'] },
                    { model: db.omes, as: 'PcontasOme', attributes: ['nome'], required: false }
                ],
            });

            if (!user) {
                return done(new Error('User not found'));
            }

            done(null, user);

        } catch (err) {
            done(err);
        }
    });

};
