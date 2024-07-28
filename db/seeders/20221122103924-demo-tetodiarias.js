// Normatizar o código, ajuda evitar gambiarras 
'use strict';

// Seeders para cadastrar registro na tabela "situations"
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface) {
    // Cadastrar o registro na tabela "omes"
    return queryInterface.bulkInsert('tetodiarias', [
      {
        ctgeralinicial: 32978,
        mes: 1,
        ano: 2024
      },
      {
        ctgeralinicial: 32978,
        mes: 2,
        ano: 2024
      },
      {
        ctgeralinicial: 32978,
        mes: 3,
        ano: 2024
      },
      {
        ctgeralinicial: 32978,
        mes: 4,
        ano: 2024
      },
      {
        ctgeralinicial: 32978,
        mes: 5,
        ano: 2024
      },
      {
        ctgeralinicial: 32978,
        mes: 6,
        ano: 2024
      },
      {
        ctgeralinicial: 32978,
        mes: 7,
        ano: 2024
      },
      {
        ctgeralinicial: 32978,
        mes: 8,
        ano: 2024
      },
      {
        ctgeralinicial: 32978,
        mes: 9,
        ano: 2024
      },
      {
        ctgeralinicial: 32978,
        mes: 10,
        ano: 2024
      },
      {
        ctgeralinicial: 32978,
        mes: 11,
        ano: 2024
      },
      {
        ctgeralinicial: 32978,
        mes: 12,
        ano: 2024
      },
                  
  ]);
  },

  async down () {
    
  }
};
