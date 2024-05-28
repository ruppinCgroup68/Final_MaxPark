using Microsoft.AspNetCore.Mvc;
using projMaxPark.BL;
using projMaxPark.DAL;
using System.Net;


// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace MaxPark.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {

        //User LogIn   
        [HttpPost]
        [Route("LogIn")]
        public int LogIn([FromBody] User user)
        {
            return user.Login();
        }

        //User's Reservation List
        [HttpGet]
        [Route("reservationList")]
        public List<Reservation> getReservetionList(int userId)
        {
            User dbs = new User();
            return dbs.getReservationList(userId);
        }



        //get user details
        //update profile details
        //add pictures "העלאת קבצים לשרת" - Class 
    }
}

