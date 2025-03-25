// Define the Ticket model with fields and constraints
module.exports = (sequelize, DataTypes) => {
  const Ticket = sequelize.define(
    'Ticket',
    {
      showtimeId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      seatNumber: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      bookingId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
    },
    {
      timestamps: false,
      // Enforce unique constraint to prevent duplicate seat bookings for the same showtime
      indexes: [
        {
          unique: true,
          fields: ['showtimeId', 'seatNumber'],
        },
      ],
    }
  );

  // Define association: each ticket belongs to one showtime
  Ticket.associate = models => {
    Ticket.belongsTo(models.Showtime, { foreignKey: 'showtimeId' });
  };

  return Ticket;
};
