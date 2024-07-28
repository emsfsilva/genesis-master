// Normatizar o código, ajuda evitar gambiarras 
'use strict';

// Seeders para cadastrar registro na tabela "situations"
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface) {
    // Cadastrar o registro na tabela "omes"
    return queryInterface.bulkInsert('tetopjes', [
      {
        ctgeralinicialof: 2510,
        ctgeralinicialprc: 19348,
        mes: 1,
        ano: 2024
      },
      {
        ctgeralinicialof: 2510,
        ctgeralinicialprc: 19348,
        mes: 2,
        ano: 2024
      },
      {
        ctgeralinicialof: 2510,
        ctgeralinicialprc: 19348,
        mes: 3,
        ano: 2024
      },
      {
        ctgeralinicialof: 2510,
        ctgeralinicialprc: 19348,
        mes: 4,
        ano: 2024
      },
      {
        ctgeralinicialof: 2510,
        ctgeralinicialprc: 19348,
        mes: 5,
        ano: 2024
      },
      {
        ctgeralinicialof: 2510,
        ctgeralinicialprc: 19348,
        mes: 6,
        ano: 2024
      },
      {
        ctgeralinicialof: 2510,
        ctgeralinicialprc: 19348,
        mes: 7,
        ano: 2024
      },
      {
        ctgeralinicialof: 2510,
        ctgeralinicialprc: 19348,
        mes: 8,
        ano: 2024
      },
      {
        ctgeralinicialof: 2510,
        ctgeralinicialprc: 19348,
        mes: 9,
        ano: 2024
      },
      {
        ctgeralinicialof: 2510,
        ctgeralinicialprc: 19348,
        mes: 10,
        ano: 2024
      },
      {
        ctgeralinicialof: 2510,
        ctgeralinicialprc: 19348,
        mes: 11,
        ano: 2024
      },
      {
        ctgeralinicialof: 2510,
        ctgeralinicialprc: 19348,
        mes: 12,
        ano: 2024
      },
            
  ]);
  },

  async down () {
    
  }
};
