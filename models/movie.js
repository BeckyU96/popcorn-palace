// Define the Movie model with its attributes and associations
module.exports = (sequelize, DataTypes) => {
  const Movie = sequelize.define(
    'Movie',
    {
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      genre: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      duration: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      rating: {
        type: DataTypes.FLOAT,
        validate: { min: 0, max: 10 }, // Rating must be between 0 and 10
      },
      releaseYear: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      timestamps: false,
    }
  );

  // Define association: A movie can have many showtimes
  Movie.associate = models => {
    Movie.hasMany(models.Showtime, { foreignKey: 'movieId' });
  };

  return Movie;
};
