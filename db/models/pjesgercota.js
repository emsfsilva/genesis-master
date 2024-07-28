// Normatizar o código, ajuda evitar gambiarras 
'use strict';

// Incluir as bibliotecas
// Sequelize é utilizado para gerenciar BD
const { Model } = require('sequelize');

// Exportar a instrução que está dentro da função
module.exports = (sequelize, DataTypes) => {
  class pjesgercota extends Model {

    static associate(models) {
      
      pjesgercota.belongsTo(models.omes, { foreignKey: 'id_ome' });
      pjesgercota.belongsTo(models.diretorias, { foreignKey: 'id_diretoria' });
      pjesgercota.belongsTo(models.pjes, { foreignKey: 'id_ome', targetKey: 'idome' });
    }
    
  }

  // Definir as colunas que a tabela "situations" deve ter
  pjesgercota.init({
    operacao: DataTypes.STRING,
    id_ome: DataTypes.INTEGER,
    ttofexe: DataTypes.INTEGER,
    ttprcexe: DataTypes.INTEGER,
    status: DataTypes.STRING,
    mes: DataTypes.STRING, 
    ano: DataTypes.STRING, 
    obs: DataTypes.STRING, 
  }, {
    sequelize,
    modelName: 'pjesgercota',
  });

  // Retornar toda instrução que está dentro de situations
  return pjesgercota;
};