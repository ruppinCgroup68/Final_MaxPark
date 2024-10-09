using MaxPark.BL;
using Microsoft.AspNetCore.Mvc;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace MaxPark.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MarksController : ControllerBase
    {
        //returns mark list
        [HttpGet]
        public IEnumerable<Mark> Get()
        {
            Mark mark = new Mark();
            return mark.readMarkList();
        }

        // returns count number of availiable parking spots
        [HttpGet("counter")]
        public ActionResult<int> GetParkingCount()
        {
            int count = Mark.availableParkingCount();
            return Ok(count);
        }
    }
}
