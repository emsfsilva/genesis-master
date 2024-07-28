
'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class users extends Model {
    
    static associate(models) {
      users.belongsTo(models.situations, { foreignKey: 'situationId' });
      users.belongsTo(models.pjes, { foreignKey: 'iduser' });
      users.belongsTo(models.omes, { foreignKey: 'omeId' });
      users.belongsTo(models.omes, { foreignKey: 'pcontasOmeId', as: 'PcontasOme' });
      
    }
  }
  
  users.init({
    name: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    recoverPassword: DataTypes.STRING,
    confEmail: DataTypes.STRING,
    image: DataTypes.STRING,
    situationId: DataTypes.INTEGER,
    omeId: DataTypes.INTEGER,
    pcontasOmeId: DataTypes.INTEGER,
    loginsei: DataTypes.STRING,
    matricula: DataTypes.STRING,
    telefone: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'users',
  });

  return users;
};