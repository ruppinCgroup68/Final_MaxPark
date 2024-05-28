using Microsoft.AspNetCore.Mvc;
using projMaxPark.BL;
using System;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace projMaxPark.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SmartAlgorythmController : ControllerBase
    {
        //Daily algorithm 
        [HttpGet("smartAlgorithm")]
        public Object Get()
        {
            SmartAlgorithm smartAlgorithm = new SmartAlgorithm();
            return smartAlgorithm.GetDailyAlgorithm();
        }
    }
}
