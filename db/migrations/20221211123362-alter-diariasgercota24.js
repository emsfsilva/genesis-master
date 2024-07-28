'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.addColumn('diariasgercota', 'id_ome', {
          type: Sequelize.DataTypes.INTEGER,
          defaultValue: 1,
          after: "id",
          references: {model: 'omes', key: 'id'}
        }, { transaction: t })
      ]);
    });
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.removeColumn('diariasgercota', 'id_ome', { transaction: t })
      ]);
    });
  }
};
