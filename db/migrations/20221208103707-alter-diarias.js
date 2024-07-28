'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.addColumn('diarias', 'idfpg', {
          type: Sequelize.DataTypes.INTEGER,
          after: "iddiretoria",
          references: {model: 'omes', key: 'id'}
        }, { transaction: t })
      ]);
    });
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.removeColumn('diarias', 'idfpg', { transaction: t })
      ]);
    });
  }
};
