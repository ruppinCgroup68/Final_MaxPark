using MaxPark.BL;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace MaxPark.Controllers
{
    public class SmartAlgorythmController : Controller
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
