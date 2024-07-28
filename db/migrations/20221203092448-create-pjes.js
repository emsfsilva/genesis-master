'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('pjes', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      operacao: {
        type: Sequelize.STRING
      },
      evento: {
        type: Sequelize.STRING
      },
      cotaofdist: {
        type: Sequelize.INTEGER
      },
      cotaprcdist: {
        type: Sequelize.INTEGER
      },
      mes: {
        type: Sequelize.STRING
      },
      obs: {
        type: Sequelize.STRING
      },
      sei: {
        type: Sequelize.STRING
      },
      ano: {
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('pjes');
  }
};