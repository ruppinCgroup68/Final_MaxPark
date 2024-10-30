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

        // POST api/<EventsController>
        [HttpPost("addEvent")]
        public int Post([FromBody] JsonElement event_data)
        {
            Event e = new Event();
            e.ParkId = event_data.GetProperty("parkId").GetInt32();
            e.MarkId = event_data.GetProperty("markId").GetInt32();
            e.Event_Date = Convert.ToDateTime(event_data.GetProperty("event_Date").ToString());
            e.Event_STime = event_data.GetProperty("event_STime").GetString();
            e.Event_ETime = event_data.GetProperty("event_ETime").GetString();
            e.EvenType = event_data.GetProperty("evenType").GetString();
            e.Event_Note = event_data.GetProperty("event_Note").GetString();

            // קריאה לפונקציית ההכנסה עם userPhone מתוך JSON
            string userPhone = event_data.GetProperty("userPhone").GetString();
            return e.InsertEvent(e, userPhone);
        }


        // GET api/<EventsController>/5
        [HttpGet("{id}")]
        public string Get(int id)
        {
            return "value";
        }


        // PUT api/<EventsController>/5
        [HttpPut("{id}")]
        public void Put(int id, [FromBody] string value)
        {
        }
    }
}
