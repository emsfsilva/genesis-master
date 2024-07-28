'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('diarias', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },

      evento: {
        type: Sequelize.STRING
      },

      operacao: {
        type: Sequelize.STRING
      },
      
      cotadist: {
        type: Sequelize.INTEGER 
      },

      obs: {
        type: Sequelize.STRING
      },

      sei: {
        type: Sequelize.STRING
      },

      mes: {
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
    await queryInterface.dropTable('diarias');
  }
};