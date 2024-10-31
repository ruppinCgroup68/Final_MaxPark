using MaxPark.BL;
using Microsoft.AspNetCore.Mvc;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace MaxPark.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        // LogIn   
        [HttpPost]
        [Route("LogIn")]
        public Object LogIn([FromBody] User user)
        {
            return user.Login();
        }

        // Reservation List by user id
        [HttpGet]
        [Route("reservationList")]
        public List<Reservation> GetReservetionList(int userId)
        {
            User dbs = new User();
            return dbs.getReservationList(userId);
        }

        [HttpPut("updateDetails")]
        public Object UpdateUserDetails([FromBody] User user)
        {
            return user.updateDetails();
        }

        [HttpPut("updatePassword")]
        public int putPassword([FromBody] User user)
        {
            return user.updatePassword();
        }


        // Upload Image - Benny
        [HttpPost]
        [Route("savePhoto")]
        public async Task<IActionResult> Post([FromForm] List<IFormFile> files)
        {
            List<string> imageLinks = new List<string>();

            string path = System.IO.Directory.GetCurrentDirectory();

            long size = files.Sum(f => f.Length);

            foreach (var formFile in files)
            {
                if (formFile.Length > 0)
                {
                    var filePath = Path.Combine(path, "uploadedFiles/" + formFile.FileName);

                    using (var stream = System.IO.File.Create(filePath))
                    {
                        await formFile.CopyToAsync(stream);
                    }
                    imageLinks.Add(formFile.FileName);
                }
            }

            // Return status code  
            return Ok(imageLinks);
        }


        // Get Photo by Pathname
        [HttpGet]
        [Route("getPhoto/{fileName}")]
        public IActionResult GetPhoto(string fileName)
        {
            string path = Path.Combine(Directory.GetCurrentDirectory(), "uploadedFiles", fileName);

            if (!System.IO.File.Exists(path))
            {
                return NotFound(); // Return 404 if the file is not found
            }

            var fileBytes = System.IO.File.nReadAllBytes(path);

            // Get the MIME type directly in this function
            string extension = Path.GetExtension(fileName).ToLowerInvariant();
            string mimeType = extension switch
            {
                ".jpg" => "image/jpeg",
                ".jpeg" => "image/jpeg",
                ".png" => "image/png",
                ".gif" => "image/gif",
                _ => "application/octet-stream",
            };

            return File(fileBytes, mimeType, fileName); // Return the file as a response
        }

        [HttpGet]
        [Route("getByCarNumber/{carNumber}")]
        public IActionResult GetUserByCarNumber(string carNumber)
        {
            try
            {
                User user = new User();
                Object blockingUser = user.GetUserByCarNumber(carNumber);

                if (blockingUser == null)
                {
                    return NotFound($"User with car number {carNumber} not found.");
                }
                return Ok(blockingUser);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "An error occurred while fetching the user.");
            }
        }
    }
}
