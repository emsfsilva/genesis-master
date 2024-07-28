// Normatizar o código, ajuda evitar gambiarras 
'use strict';

// Incluir as bibliotecas
// Sequelize é utilizado para gerenciar BD
const { Model } = require('sequelize');

// Exportar a instrução que está dentro da função
module.exports = (sequelize, DataTypes) => {
  class diariasgercota extends Model {

    static associate(models) {
      
      diariasgercota.belongsTo(models.omes, { foreignKey: 'id_ome' });
      diariasgercota.belongsTo(models.diretorias, { foreignKey: 'id_diretoria' });
      diariasgercota.belongsTo(models.diarias, { foreignKey: 'id_ome', targetKey: 'idome' });
    }
    
  }

  // Definir as colunas que a tabela "situations" deve ter
  diariasgercota.init({
    id_ome: DataTypes.INTEGER,
    ttexe: DataTypes.INTEGER,
    mes: DataTypes.STRING, 
    ano: DataTypes.STRING, 
    obs: DataTypes.STRING, 
  }, {
    sequelize,
    modelName: 'diariasgercota',
  });

  // Retornar toda instrução que está dentro de situations
  return diariasgercota;
};