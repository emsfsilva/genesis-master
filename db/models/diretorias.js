// Normatizar o código, ajuda evitar gambiarras 
'use strict';

// Incluir as bibliotecas
// Sequelize é utilizado para gerenciar BD
const { Model } = require('sequelize');

// Exportar a instrução que está dentro da função
module.exports = (sequelize, DataTypes) => {
  class diretorias extends Model {

    static associate(models) {
      // Definir as associações
      diretorias.hasMany(models.pjes, { foreignKey: 'iddiretoria' });
      diretorias.hasMany(models.pjesgercota, { foreignKey: 'id_diretoria' });
    }
    
  }

  // Definir as colunas que a tabela "situations" deve ter
  diretorias.init({
    nome: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'diretorias',
  });

  // Retornar toda instrução que está dentro de situations
  return diretorias;
};