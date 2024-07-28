'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.addColumn('escalas', 'idevento', {
          type: Sequelize.DataTypes.INTEGER,
          defaultValue: null,
          after: "anotacoes",
          references: {model: 'pjes', key: 'id'}
        }, { transaction: t })
      ]);
    });
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.removeColumn('escalas', 'idevento', { transaction: t })
      ]);
    });
  }
};
