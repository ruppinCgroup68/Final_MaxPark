using Microsoft.AspNetCore.Mvc;
using projMaxPark.BL;
using System.Net;
using System.Text.Json;
using System.Text.Json.Nodes;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace MaxPark.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AdminController : ControllerBase
    {

       //Read all users details
        [HttpGet("readAllusers")]
        public IEnumerable<User> Get()
        {
            Admin admin = new Admin();
            return admin.getAllUsers();
        }

        //Insert New User
        [HttpPost("/insertUser")]
        public int Post([FromBody] User user)
        {
            Admin admin = new Admin();
            return admin.insertUser(user);
        }

        //Insert New Prking Mark 
        [HttpPost("/insertMark")]
        public int PostNewMark([FromBody] Mark[] marks)
        {
            Admin admin = new Admin();
            int res=0; 
            foreach (var mark in marks)
            {
                res=admin.insertMark(mark.MarkName, mark.MarkName_Block);
            }
            return res;
        }
    
        //Delete all parking marks - will be deleted after HAGANA 
        [HttpDelete("deleteParkingMarks")]
        public IActionResult Delete()
        {
            try
            {
                Admin admin = new Admin();
                int numEffected = admin.deleteParkingMarks();
                return Ok(numEffected + " slots deleted succsessfuly");
            }
            catch(Exception ex)
            {
               return BadRequest(ex.Message);
            }
           
        }
    }
}
