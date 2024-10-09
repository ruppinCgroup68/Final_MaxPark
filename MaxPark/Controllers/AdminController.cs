using MaxPark.BL;
using Microsoft.AspNetCore.Mvc;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace MaxPark.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AdminController : ControllerBase
    {

        //Get users 
        [HttpGet("users")]
        public IEnumerable<User> Get()
        {
            Admin admin = new Admin();
            return admin.getAllUsers();
        }

        //Insert user
        [HttpPost("user")]
        public int Post([FromBody] User user)
        {
            Admin admin = new Admin();
            return admin.insertUser(user);
        }

        // Update users 
        [HttpPut("user")]
        public Object UpdateUser([FromBody] User user)
        {
            return user.updateDetails();
        }

        [HttpPut("putIsActive/userId/{userId}/isActive/{isActive}")]
        public int PutIsActive(int userId, bool isActive)
        {
            Admin admin = new Admin();
            int numeffected = admin.updateIsActive(userId, isActive);
            return numeffected;
        }

        // Insert mark
        [HttpPost("addMark")]
        public int PostNewMark([FromBody] Mark[] marks)
        {
            Admin admin = new Admin();
            int res = 0;
            foreach (var mark in marks)
            {
                res = admin.insertMark(mark.MarkName, mark.MarkName_Block);
            }
            return res;
        }

        // Delete marks
        [HttpDelete("deleteParkingMarks")]
        public IActionResult DeleteMark()
        {
            try
            {
                Admin admin = new Admin();
                int numEffected = admin.deleteParkingMarks();
                return Ok(numEffected + " slots deleted succsessfuly");
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}
