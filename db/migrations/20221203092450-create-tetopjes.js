'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('tetopjes', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      ctgeralinicialof: {
        type: Sequelize.INTEGER
      },
      ctgeralinicialprc: {
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
    await queryInterface.dropTable('tetopjes');
  }
};