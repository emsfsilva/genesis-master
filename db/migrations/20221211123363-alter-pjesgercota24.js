'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.addColumn('pjesgercota', 'id_diretoria', {
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
        queryInterface.removeColumn('pjesgercota', 'id_diretoria', { transaction: t })
      ]);
    });
  }
};
