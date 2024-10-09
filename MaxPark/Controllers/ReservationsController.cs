using MaxPark.BL;
using Microsoft.AspNetCore.Mvc;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace MaxPark.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReservationsController : ControllerBase
    {
        // Get reservations
        [HttpGet("readReservations")]
        public Object Get()
        {
            Reservation res = new Reservation();
            return res.Read();
        }

        // Get reservation
        [HttpGet("readReservations/{userId}")]
        public IEnumerable<Object> Get(int userId)
        {
            Reservation res = new Reservation();
            return res.ReadByUserId(userId);
        }


        // Get tomorrow reservatios
        [HttpGet("tomorrowReservasions")]
        public IEnumerable<Reservation> GetTomorrowReservations()
        {
            Reservation res = new Reservation();
            return res.getTomorrowReservations();
        }



        [HttpGet("users/{userId}/reservations")]
        public IEnumerable<Reservation> GetReservationsByUserId(int userId)
        {
            User dbs = new User();
            return dbs.getReservationList(userId); // מחזיר את רשימת ההזמנות כ-IEnumerable
        }


        // Post reservation
        [HttpPost("newReservation")]
        public int PostNewReservation([FromBody] Reservation reservation)
        {
            Reservation res = new Reservation();
            return res.Insert(reservation);
        }

        // Update reservation
        [HttpPut("updateReservation")]
        public int PutReservation([FromBody] Reservation reservation)
        {
            Reservation currentReservation = new Reservation();
            return currentReservation.updateReservationDateTime(reservation);
        }

        // Delete reservation
        [HttpDelete("reservationId")]
        public IActionResult DeleteReservation(int reservationId)
        {
            Reservation res = new Reservation();
            return (res.cancleReservation(reservationId) != 0) ? Ok("הזמנה נמחקה בהצלחה") : BadRequest("פעולת המחיקה נכשלה...");
        }
    }
}
