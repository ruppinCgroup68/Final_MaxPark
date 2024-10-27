using Microsoft.AspNetCore.Mvc;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using System.Text.Json;

namespace MaxPark.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class GPTController : ControllerBase
    {
        private readonly HttpClient _httpClient;
        private readonly string _openAiApiKey;


        public GPTController(HttpClient httpClient, IConfiguration configuration)
        {
            _httpClient = httpClient;
            _openAiApiKey = configuration["OpenAI:ApiKey"];//to get the api from IConfiguration
        }


        // Post request to handle reservation prompt
        [HttpPost("get-reservation-by-prompt")]
        public async Task<IActionResult> GetReservation([FromBody] ReservationPromptModel model)
        {
            var currentDate = DateTime.Now.ToString("dd.MM.yyyy");

            // Create the complete prompt including today's date
            var completePrompt = $"You are a reservation assistant. Today's date is {currentDate}. The user has entered a request: \"{model.Prompt}\". " +
                                 "Please return the following JSON format for reservation dates based on the input (default hours 8-17) : " +
                                 "{\"dates\": [{\"date\": \"YYYY-MM-DDT00:00:00\", \"start\": \"HH:MM:00\", \"end\": \"HH:MM:00\"}]} " +
                                 "If the input is not a valid reservation request or you just dont understand what the user want , respond with \"Please ask me for reservations only.\"";


            // Prepare the request body
            var requestBody = new
            {
                model = "gpt-3.5-turbo",  // Use the appropriate model
                messages = new[] { new { role = "user", content = completePrompt } },
                temperature = 1,
                max_tokens = 2048,
                top_p = 1,
                frequency_penalty = 0,
                presence_penalty = 0
            };

            var requestContent = new StringContent(
                JsonSerializer.Serialize(requestBody),  // Serialize request body to JSON
                Encoding.UTF8,
                "application/json"
            );

            if (!_httpClient.DefaultRequestHeaders.Contains("Authorization"))
            {
                _httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {_openAiApiKey}"); // using the key inside the request
            }


            try
            {
                // Send the request to OpenAI API
                var response = await _httpClient.PostAsync("https://api.openai.com/v1/chat/completions", requestContent);
                var responseBody = await response.Content.ReadAsStringAsync();

                // Try to parse the response
                var jsonResponse = JsonSerializer.Deserialize<JsonElement>(responseBody);

                // Extract only the 'content' from the completion response
                var content = jsonResponse
                    .GetProperty("choices")[0]
                    .GetProperty("message")
                    .GetProperty("content").GetString();

                // Parse the content into a JSON object
                //var reservationJson = JsonSerializer.Deserialize<JsonElement>(content);
                return Ok(content);
                // Check if the response contains a "dates" array
                //if (reservationJson.TryGetProperty("dates", out var dates) && dates.ValueKind == JsonValueKind.Array)
                //{
                //    // Return the valid reservation dates
                //    return Ok(reservationJson);
                //}
                //else
                //{
                //    // Return an empty array if no valid "dates" array is found
                //    return Ok(new { dates = new object[] { } });
                //}
            }
            catch
            {
                // Return 200 OK with an empty array in case of any error during processing
                return Ok(new { dates = new object[] { } });
            }
        }
    }

    // Model to accept prompt from frontend
    public class ReservationPromptModel
    {
        public string Prompt { get; set; }
    }
}