// Normatizar o código, ajuda evitar gambiarras 
'use strict';

// Criptografar senha
const bcrypt = require('bcryptjs');

// Seeders para cadastrar registro na tabela "users"
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface) {
    // Cadastrar o registro na tabela "users"
    return queryInterface.bulkInsert('users', [{
      matricula: '1157590',
      name: 'Cb Francisco',
      email: 'ems.fsilva.pe@gmail.com',
      situationId: 1,
      omeId: 1,
      pcontasOmeId : 1,
      loginsei : 'emerson.francisco',
      password: await bcrypt.hash('1157590', 8),
      telefone : '(81) 9.8685-4814',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      matricula: '1160648',
      name: 'Cb Jesus',
      email: 'jesus@gmail.com',
      situationId: 1,
      omeId: 2,
      pcontasOmeId : 2,
      loginsei : 'jesus.jose',
      password: await bcrypt.hash('12345678', 8),
      telefone : '(81) 9.8685-4814',
      createdAt: new Date(),
      updatedAt: new Date()
    }]);
  },

  async down () {
    
  }
};
