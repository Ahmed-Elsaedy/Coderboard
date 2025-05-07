using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace Coderboard.Web.Pages;

[Authorize]
public class IndexModel : PageModel
{
    private readonly ILogger<IndexModel> _logger;
    private readonly IConfiguration _config;


    public IndexModel(ILogger<IndexModel> logger, IConfiguration config)
    {
        _logger = logger;
        _config = config;
    }

    public async Task<IActionResult> OnGetAsync()
    {

        //var authCookie = Request.Cookies["Identity"];

        //var client = new HttpClient();
        
        //client.DefaultRequestHeaders.Add("Cookie", authCookie);
        
        //var response = await client.GetAsync($"{_config["ApiBaseUrl"]}/weather");
        
        //if (response.IsSuccessStatusCode)
        //{
        //    var content = await response.Content.ReadAsStringAsync();
        //    return new JsonResult(content);
        //}

        return Page();
    }
}
