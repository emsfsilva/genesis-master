'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class sgpms extends Model {
    
    static associate(models) {
    }
  }
    
  sgpms.init({
    pg: DataTypes.STRING,
    matricula: DataTypes.STRING,
    nome: DataTypes.STRING,
    ome: DataTypes.STRING,
    status: DataTypes.STRING,
    nunfunc: DataTypes.STRING,
    localap: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'sgpms',
  });

  return sgpms;
};