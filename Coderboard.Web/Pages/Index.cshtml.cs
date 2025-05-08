using Coderboard.Clients;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace Coderboard.Web.Pages;

[Authorize]
public class IndexModel : PageModel
{
    private readonly ILogger<IndexModel> _logger;
    private readonly IConfiguration _config;
    private readonly WeatherClient _weatherClient;

    public IndexModel(ILogger<IndexModel> logger, IConfiguration config, WeatherClient weatherClient)
    {
        _logger = logger;
        _config = config;
        _weatherClient = weatherClient;
    }

    public List<WeatherForecast> Data { get; set; }

    public async Task<IActionResult> OnGetAsync()
    {
        Data = (await _weatherClient.GetWeatherForecastAsync()).ToList();
        
        return Page();
    }
}
