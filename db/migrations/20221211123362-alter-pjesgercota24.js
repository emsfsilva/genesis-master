'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.addColumn('pjesgercota', 'id_ome', {
          type: Sequelize.DataTypes.INTEGER,
          defaultValue: 1,
          after: "operacao",
          references: {model: 'omes', key: 'id'}
        }, { transaction: t })
      ]);
    });
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.removeColumn('pjesgercota', 'id_ome', { transaction: t })
      ]);
    });
  }
};
