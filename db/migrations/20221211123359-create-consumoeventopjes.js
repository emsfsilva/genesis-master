'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('escalas', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      operacao: {
        type: Sequelize.STRING
      },
      cod: {
        type: Sequelize.INTEGER
      },
      nunfunc: {
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
      telefone: {
        type: Sequelize.STRING
      },
      status: {
        type: Sequelize.STRING
      },
      modalidade: {
        type: Sequelize.STRING
      },
      data_inicio: {
        type: Sequelize.STRING
      },
      hora_inicio: {
        type: Sequelize.STRING
      },
      data_fim: {
        type: Sequelize.STRING
      },
      hora_fim: {
        type: Sequelize.STRING
      },
      ome_sgpm: {
        type: Sequelize.STRING
      },
      localap: {
        type: Sequelize.STRING
      },
      anotacoes: {
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
    await queryInterface.dropTable('escalas');
  }
};