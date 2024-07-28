'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.addColumn('escalas', 'idome', {
          type: Sequelize.DataTypes.INTEGER,
          defaultValue: null,
          after: "idevento",
          references: {model: 'omes', key: 'id'}
        }, { transaction: t })
      ]);
    });
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.removeColumn('escalas', 'idome', { transaction: t })
      ]);
    });
  }
};
