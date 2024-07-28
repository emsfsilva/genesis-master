'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('tetodiarias', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      ctgeralinicial: {
        type: Sequelize.INTEGER
      },
      mes: {
        type: Sequelize.INTEGER
      },
      ano: {
        type: Sequelize.INTEGER
      }
      
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('tetodiarias');
  }
};