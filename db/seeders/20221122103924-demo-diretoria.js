// Normatizar o código, ajuda evitar gambiarras 
'use strict';

// Seeders para cadastrar registro na tabela "situations"
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface) {
    // Cadastrar o registro na tabela "omes"
    return queryInterface.bulkInsert('diretorias', [
      {
        nome: 'DPO'
      },
      {
        nome: 'DIM'
      },
      {
        nome: 'DIRESP'
      },
      {
        nome: 'DINTER I'
      },
      {
        nome: 'DINTER II'
      },
      
  ]);
  },

  async down () {
    
  }
};
