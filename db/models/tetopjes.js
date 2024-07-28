// Normatizar o código, ajuda evitar gambiarras 
'use strict';

// Incluir as bibliotecas
// Sequelize é utilizado para gerenciar BD
const { Model } = require('sequelize');

// Exportar a instrução que está dentro da função
module.exports = (sequelize, DataTypes) => {
  class tetopjes extends Model {
    
  }

  tetopjes.init({
    ctgeralinicialof: DataTypes.INTEGER,
    ctgeralinicialprc: DataTypes.INTEGER,
    mes: DataTypes.STRING,
    ano: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'tetopjes',
  });

  
  return tetopjes;
};