'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.addColumn('diariasgercota', 'id_diretoria', {
          type: Sequelize.DataTypes.INTEGER,
          defaultValue: 1,
          after: "id_ome",
          references: {model: 'diretorias', key: 'id'}
        }, { transaction: t })
      ]);
    });
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.removeColumn('diariasgercota', 'id_diretoria', { transaction: t })
      ]);
    });
  }
};
