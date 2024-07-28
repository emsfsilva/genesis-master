'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.addColumn('pjes', 'idome', {
          type: Sequelize.DataTypes.INTEGER,
          defaultValue: 1,
          after: "ano",
          references: {model: 'omes', key: 'id'}
        }, { transaction: t })
      ]);
    });
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.removeColumn('pjes', 'idome', { transaction: t })
      ]);
    });
  }
};
