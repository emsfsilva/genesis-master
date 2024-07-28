'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.addColumn('pjes', 'iduser', {
          type: Sequelize.DataTypes.INTEGER,
          defaultValue: 1,
          after: "idome",
          references: {model: 'users', key: 'id'}
        }, { transaction: t })
      ]);
    });
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.removeColumn('users', 'iduser', { transaction: t })
      ]);
    });
  }
};
