using Microsoft.AspNetCore.Mvc;
using projMaxPark.BL;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace MaxPark.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MarksController : ControllerBase
    {
        //get mark list
        [HttpGet]
        public IEnumerable<Mark> Get()
        {
            Mark mark = new Mark();
            return mark.readMarkList();
        }
    }

}
