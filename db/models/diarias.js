// Normatizar o código, ajuda evitar gambiarras 
'use strict';

// Incluir as bibliotecas
// Sequelize é utilizado para gerenciar BD
const { Model } = require('sequelize');

// Exportar a instrução que está dentro da função
module.exports = (sequelize, DataTypes) => {
  class diarias extends Model {

    static associate(models) {
      
      //tabela diarias pertence à tabela omes usando a chave estrangeira idome.
      diarias.belongsTo(models.omes, { foreignKey: 'idome' });
      diarias.belongsTo(models.omes, { foreignKey: 'idfpg', as: 'idfpgOme' });
      //tabela diarias pertence à tabela diretorias usando a chave estrangeira iddiretorias.
      diarias.belongsTo(models.diretorias, { foreignKey: 'iddiretorias' });
      // tabela diarias pertence à tabela users usando a chave estrangeira iduser.
      diarias.belongsTo(models.users, { foreignKey: 'iduser' });
      //tabela diarias tem muitas escalas, onde idevento na tabela escalas é a chave estrangeira que referencia diarias.
      diarias.hasMany(models.escalas, { foreignKey: 'idevento' });
    }
    
  }

  // Definir as colunas que a tabela "situations" deve ter
  diarias.init({
    idome: DataTypes.INTEGER,
    evento: DataTypes.STRING,
    operacao: DataTypes.STRING,
    cotadist: DataTypes.INTEGER,
    idfpg: DataTypes.INTEGER,
    obs: DataTypes.STRING,
    sei: DataTypes.STRING,
    mes: DataTypes.STRING,
    ano: DataTypes.STRING,
    iduser: DataTypes.INTEGER,
  }, {
    sequelize,
    modelName: 'diarias',
  });

  // Retornar toda instrução que está dentro de situations
  return diarias;
};