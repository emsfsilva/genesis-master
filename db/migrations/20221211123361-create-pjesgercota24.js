'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('pjesgercota', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },

      operacao: {
        type: Sequelize.STRING
      },

      ttofexe: {
        type: Sequelize.INTEGER
      },

      ttprcexe: {
        type: Sequelize.INTEGER
      },

      status: {
        type: Sequelize.STRING
      },

      mes: {
        type: Sequelize.STRING
      },

      ano: {
        type: Sequelize.STRING
      },

      obs: {
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
    await queryInterface.dropTable('pjesgercota');
  }
};