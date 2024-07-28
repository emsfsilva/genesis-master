// Normatizar o código, ajuda evitar gambiarras 
'use strict';

// Seeders para cadastrar registro na tabela "situations"
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface) {
    // Cadastrar o registro na tabela "omes"
    return queryInterface.bulkInsert('sgpms', [
      {
        pg: 'CB',
        matricula: '1157590',
        nome: 'FRANCISCO',
        ome: 'DPO',
        status: 'REGULAR',
        nunfunc: '3392503',
        localap: 'SEDE DA OME',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        pg: 'ST',
        matricula: '1047612',
        nome: 'EMANUEL LUIZ',
        ome: '1º BPM',
        status: 'REGULAR',
        nunfunc: '2092999',
        localap: 'SEDE DA OME',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        pg: 'CEL',
        matricula: '1157592',
        nome: 'SILVA',
        ome: '16º BPM',
        status: 'REGULAR',
        nunfunc: '1132543',
        localap: 'SEDE DA OME',
        createdAt: new Date(),
        updatedAt: new Date()
      },
  ]);
  },

  async down () {
    
  }
};
