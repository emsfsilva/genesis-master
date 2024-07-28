'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.addColumn('diarias', 'iddiretoria', {
          type: Sequelize.DataTypes.INTEGER,
          defaultValue: 1,
          after: "iduser",
          references: {model: 'diretorias', key: 'id'}
        }, { transaction: t })
      ]);
    });
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.removeColumn('diarias', 'iddiretoria', { transaction: t })
      ]);
    });
  }
};
