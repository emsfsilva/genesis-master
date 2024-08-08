// Normatizar o código, ajuda evitar gambiarras 
'use strict';

// Incluir as bibliotecas
// Sequelize é utilizado para gerenciar BD
const { Model } = require('sequelize');

// Exportar a instrução que está dentro da função
module.exports = (sequelize, DataTypes) => {
  class escalas extends Model {

    static associate(models) {
      
      escalas.belongsTo(models.pjes, { foreignKey: 'id' });
      escalas.belongsTo(models.pjes, { foreignKey: 'idevento'});
      escalas.belongsTo(models.omes, { foreignKey: 'idome'});


    }
    
  }

  // Definir as colunas que a tabela "escalas" deve ter
  escalas.init({
    pg: DataTypes.STRING,
    operacao: DataTypes.STRING,
    cod: DataTypes.INTEGER,
    nunfunc: DataTypes.INTEGER,
    matricula: DataTypes.STRING,
    nome: DataTypes.STRING,
    telefone: DataTypes.STRING,
    status: DataTypes.STRING,
    modalidade: DataTypes.STRING,
    data_inicio: DataTypes.STRING,
    hora_inicio: DataTypes.STRING,
    data_fim: DataTypes.STRING,
    hora_fim: DataTypes.STRING,
    ome_sgpm: DataTypes.STRING,
    localap: DataTypes.STRING,
    ttcota: DataTypes.INTEGER,
    anotacoes: DataTypes.STRING,
    idevento: DataTypes.INTEGER,
    idome: DataTypes.INTEGER,
  }, {
    sequelize,
    modelName: 'escalas',
  });

  // Retornar toda instrução que está dentro de escalas
  return escalas;
};