'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.addColumn('omes', 'id_diretoria', {
          type: Sequelize.DataTypes.INTEGER,
          after: "nome",
          references: {model: 'diretorias', key: 'id'}
        }, { transaction: t })
      ]);
    });
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.removeColumn('omes', 'id_diretoria', { transaction: t })
      ]);
    });
  }
};
