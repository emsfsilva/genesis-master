'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('sgpms', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      pg: {
        type: Sequelize.STRING
      },
      matricula: {
        type: Sequelize.STRING
      },
      nome: {
        type: Sequelize.STRING
      },
      ome: {
        type: Sequelize.STRING
      },
      status: {
        type: Sequelize.STRING
      },
      nunfunc: {
        type: Sequelize.STRING
      },
      localap: {
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
    await queryInterface.dropTable('sgpms');
  }
};