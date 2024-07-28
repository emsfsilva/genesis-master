COMO RODAR O PROJETO BAIXADO
Instalar todas as dependencias indicada pelo package.json
### npm install

Criar a base de dados no MySQL
Alterar as credenciais do banco de dados no arquivo ".env"

Executar as migrations
### npx sequelize-cli db:migrate

Executar as seeders
### npx sequelize-cli db:seed:all

Rodar o projeto usando o nodemon
### nodemon app.js

Abrir o endereço no navegador para acessar a página de login
### http://localhost:8080/login



SEQUENCIA PARA CRIAR O PROJETO
Criar o arquivo package
### npm init

Gerencia as requisições, rotas e URLs, entre outra funcionalidades
### npm install --save express

Instalar a dependência de forma global, "-g" significa globalmente. Executar o comando através do prompt de comando, executar somente se nunca instalou a dependência na maquina, após instalar, reiniciar o PC.
### npm install -g nodemon

Instalar a dependência como desenvolvedor para reiniciar o servidor sempre que houver alteração no código fonte.
### npm install --save-dev nodemon

Rodar o projeto usando o nodemon
### nodemon app.js

Abrir o endereço no navegador para acessar a página inicial
### http://localhost:8080

Manipular variáveis de ambiente
### npm install --save dotenv

O Handlebars é um processador de templates que gera a página HTML de forma dinamica
### npm install --save express-handlebars

Sequelize é uma biblioteca Javascript que facilita o gerenciamento do banco de dados SQL
### npm install --save sequelize

Instalar o drive do banco de dados
### npm install --save mysql2

Sequelize-cli interface de linha de comando usada para criar modelos, configurações e arquivos de migração para bancos de dados
### npm install --save-dev sequelize-cli

Iniciar o Sequelize-cli e criar o arquivo config
### npx sequelize-cli init

Criar a base de dados
### CREATE DATABASE celke CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

Criar a migration
### npx sequelize-cli migration:generate --name create-users

Executar as migrations
### npx sequelize-cli db:migrate

Criar seeders
### npx sequelize-cli seed:generate --name demo-user

Executar as seeders
### npx sequelize-cli db:seed:all

Executar uma seed
### npx sequelize-cli db:seed --seed nome-seed

Instalar o módulo para criptografar a senha
### npm install --save bcryptjs

Receber os dados do formulário
### npm install --save body-parser

Criar a Models users
### npx sequelize-cli model:generate --name users --attributes name:string,email:string,password:string,image:string

Criar sessão e armazenar dados no servidor
### npm install --save express-session

Flash é uma área especial da sessão usada para armazenar mensagens
### npm install --save connect-flash

Validar formulário
### npm install --save yup

Instalar o módulo Passport é um middleware para a implementação de autenticação
### npm install --save passport

Instalar a estratégia de validação local
### npm install --save passport-local

Módulo para enviar e-mail
### npm install --save nodemailer

Acrescentar no banco de dados o relacionamento da chave primária com chave estrangeira
### ALTER TABLE celke.users ADD FOREIGN KEY (situationId) REFERENCES celke.situations(id) ON DELETE RESTRICT ON UPDATE RESTRICT;

Multer é um middleware node.js para manipulação multipart/form-data, usado para o upload de arquivos. 
### npm install --save multer



MANUPULAR A VARIAVEL DENTRO DO QSL E CONVERTENDO EM NUMERO
const totalCota = parseFloat(total_cotaexedim[0]?.total_cotaofexe_multiplicado) || 0;

CONVERTENDO EM MOEDA
const totalCotaFormatado = totalCota.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'});
