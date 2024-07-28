// Normatizar o código, ajuda evitar gambiarras 
'use strict';

// Incluir as bibliotecas
// Sequelize é utilizado para gerenciar BD
const { Model } = require('sequelize');

// Exportar a instrução que está dentro da função
module.exports = (sequelize, DataTypes) => {
  class situations extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Definir as associações
      situations.hasMany(models.users, { foreignKey: 'situationId' });
    }
  }

  // Definir as colunas que a tabela "situations" deve ter
  situations.init({
    nameSituation: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'situations',
  });

  // Retornar toda instrução que está dentro de situations
  return situations;
};