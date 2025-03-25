// Define the Showtime model with relevant fields and validation
module.exports = (sequelize, DataTypes) => {
  const Showtime = sequelize.define(
    'Showtime',
    {
      movieId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      theater: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      startTime: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      endTime: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      price: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
    },
    {
      timestamps: false,
    }
  );

  // Define associations: each showtime belongs to one movie and can have many tickets
  Showtime.associate = models => {
    Showtime.belongsTo(models.Movie, { foreignKey: 'movieId' });
    Showtime.hasMany(models.Ticket, { foreignKey: 'showtimeId' });
  };

  return Showtime;
};
