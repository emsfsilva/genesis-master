// Normatizar o código, ajuda evitar gambiarras 
'use strict';

// Incluir as bibliotecas
// Sequelize é utilizado para gerenciar BD
const { Model } = require('sequelize');

// Exportar a instrução que está dentro da função
module.exports = (sequelize, DataTypes) => {
  class omes extends Model {

    static associate(models) {
      // Definir as associações
      omes.hasMany(models.pjes, { foreignKey: 'idome' });
      omes.hasMany(models.pjesgercota, { foreignKey: 'id_ome' });
      omes.hasMany(models.users, { foreignKey: 'omeId' });
      omes.hasMany(models.users, { foreignKey: 'pcontasOmeId', as: 'PcontasOme' });
      omes.hasMany(models.escalas, { foreignKey: 'idome' });
      omes.hasMany(models.diarias, { foreignKey: 'idome' });
      omes.hasMany(models.diarias, { foreignKey: 'idfpg', as: 'idfpgOme' });
    }
    
  }

  // Definir as colunas que a tabela "situations" deve ter
  omes.init({
    nome: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'omes',
  });

  // Retornar toda instrução que está dentro de situations
  return omes;
};