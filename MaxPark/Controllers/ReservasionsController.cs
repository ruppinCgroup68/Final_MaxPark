using Microsoft.AspNetCore.Mvc;
using projMaxPark.BL;
using System.Net;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace MaxPark.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReservasionsController : ControllerBase
    {
        //Read All System Reservations? admin?
        [HttpGet("allReservations")]
        public Object Get()
        {
            Reservation res = new Reservation();
            return res.Read();
        }

        //Read tomorrow Reservation List 
        [HttpGet("tomorrowReservasions")]
        public IEnumerable<Reservation> GetTomorrowReservations()
        {
            Reservation res = new Reservation();
            return res.ReadTomorrowRes();
        }


        //Add New Reservation Request
        [HttpPost("newReservation")]
        public int PostNewReservation([FromBody] Reservation reservation)
        {
            Reservation res = new Reservation();
            return res.Insert(reservation);
        }


        //Update Current reservation : start time, end time 
        [HttpPut("updateReservation")]
        public int PutReservation([FromBody] Reservation reservation)
        {
            Reservation currentReservation=new Reservation();
            return currentReservation.updateReservation(reservation);
        }


        //Delete Current reservation
        [HttpDelete("reservationId")]
        public IActionResult DeleteReservation(int reservationId)
        {
            Reservation res=new Reservation();
            return (res.cancleReservation(reservationId) != 0)? Ok("הזמנה נמחקה בהצלחה") : BadRequest("פעולת המחיקה נכשלה...");     
        }
    }
}
