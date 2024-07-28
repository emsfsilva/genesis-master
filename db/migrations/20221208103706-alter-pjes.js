'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.addColumn('pjes', 'iddiretoria', {
          type: Sequelize.DataTypes.INTEGER,
          defaultValue: 1,
          after: "ano",
          references: {model: 'diretorias', key: 'id'}
        }, { transaction: t })
      ]);
    });
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.removeColumn('pjes', 'iddiretoria', { transaction: t })
      ]);
    });
  }
};
