using MaxPark.BL;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json;
using System.Data;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace MaxPark.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EventsController : ControllerBase
    {
        // GET: events
        [HttpGet]
        public IEnumerable<Event> Get()
        {
            Event eve = new Event();
            return eve.Read();
        }

        // POST api/<EventsController>/event/{userPhone}
        [HttpPost("event/{userCarNum}")]
        public int Post(string userCarNum, Event event_data)
        {
            Event e = new Event();
            return e.InsertEvent(event_data, userCarNum);
        }

        // PUT api/<EventsController>/5
        //[HttpPut("{id}")]
        //public void Put(int id, [FromBody] string value)
        //{

        //}
    }
}
