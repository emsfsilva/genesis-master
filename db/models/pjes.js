// Normatizar o código, ajuda evitar gambiarras 
'use strict';

// Incluir as bibliotecas
// Sequelize é utilizado para gerenciar BD
const { Model } = require('sequelize');

// Exportar a instrução que está dentro da função
module.exports = (sequelize, DataTypes) => {
  class pjes extends Model {

    static associate(models) {
      
      //tabela pjes pertence à tabela omes usando a chave estrangeira idome.
      pjes.belongsTo(models.omes, { foreignKey: 'idome' });
      //tabela pjes pertence à tabela diretorias usando a chave estrangeira iddiretorias.
      pjes.belongsTo(models.diretorias, { foreignKey: 'iddiretorias' });
      // tabela pjes pertence à tabela users usando a chave estrangeira iduser.
      pjes.belongsTo(models.users, { foreignKey: 'iduser' });
      //tabela pjes tem muitas escalas, onde idevento na tabela escalas é a chave estrangeira que referencia pjes.
      pjes.hasMany(models.escalas, { foreignKey: 'idevento' });
    }
    
  }

  // Definir as colunas que a tabela "situations" deve ter
  pjes.init({
    operacao: DataTypes.STRING,
    evento: DataTypes.STRING,
    cotaofdist: DataTypes.INTEGER,
    cotaprcdist: DataTypes.INTEGER,
    mes: DataTypes.STRING,
    idome: DataTypes.INTEGER,
    iduser: DataTypes.INTEGER,
    idevento: DataTypes.INTEGER,
    obs: DataTypes.STRING,
    sei: DataTypes.STRING,
    ano: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'pjes',
  });

  // Retornar toda instrução que está dentro de situations
  return pjes;
};