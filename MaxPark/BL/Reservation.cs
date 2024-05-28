using Microsoft.AspNetCore.Mvc;
using projMaxPark.DAL;

namespace projMaxPark.BL
{
    public class Reservation
    {
        int reservationId;
        int userId;
        int parkId;
        DateTime reservation_Date;
        string reservation_STime;
        string reservation_ETime;
        string reservation_Status;
        int markId;

        public Reservation() { }

        public Reservation(int reservationId, int userId, int parkId, DateTime reservationDate, string reservation_STime, string reservation_ETime, string reservation_Status, int markId)
        {
            ReservationId = reservationId;
            UserId = userId;
            ParkId = parkId;
            Reservation_Date = reservation_Date;
            Reservation_STime = reservation_STime;
            Reservation_ETime = reservation_ETime;
            Reservation_Status = reservation_Status;
            MarkId = markId;
        }

        public int ReservationId { get => reservationId; set => reservationId = value; }
        public int UserId { get => userId; set => userId = value; }
        public int ParkId { get => parkId; set => parkId = value; }
        public DateTime Reservation_Date { get => reservation_Date; set => reservation_Date = value; }
        public string Reservation_STime { get => reservation_STime; set => reservation_STime = value; }
        public string Reservation_ETime { get => reservation_ETime; set => reservation_ETime = value; }
        public string Reservation_Status { get => reservation_Status; set => reservation_Status = value; }
        public int MarkId { get => markId; set => markId = value; }


        public Object Read()
        {
            DBservicesReservation dbs = new DBservicesReservation();
            return dbs.readReservations();
        }
        public List<Reservation> ReadTomorrowRes()
        {
            DBservicesReservation dbs =new DBservicesReservation();
            return dbs.readTommorowReservations();
        }
        public int Insert(Reservation reservation)
        {
            DBservicesReservation dbs = new DBservicesReservation();
            return dbs.InsertReservation(reservation);
        }
      
        public int updateReservation(Reservation reservation)
        {
            DBservicesReservation dbs=new DBservicesReservation();
            return dbs.updateReservation(reservation);
           
        }

        public int cancleReservation(int id)
        {
            DBservicesReservation dbs = new DBservicesReservation();
            return dbs.cancleReservation(id);
        }
    }
}
