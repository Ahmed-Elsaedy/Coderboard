using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using System.Text.Json;

namespace Coderboard.Web.Pages;

public class LoginModel : PageModel
{
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly IConfiguration _config;

    public LoginModel(IHttpClientFactory httpClientFactory, IConfiguration config)

    {
        _httpClientFactory = httpClientFactory;
        _config = config;
    }

    [BindProperty]
    public LoginDto Input { get; set; } = new();

    public async Task<IActionResult> OnPostAsync()
    {
        if (!ModelState.IsValid)
            return Page();

        using var client = new HttpClient();

        var options = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        };

        var response = await client.PostAsJsonAsync($"{_config["ApiBaseUrl"]}/identity/login", Input, options);

        if (!response.IsSuccessStatusCode)
        {
            ModelState.AddModelError(string.Empty, "Invalid login attempt.");
            return Page();
        }
        else
        {

        }

        return RedirectToPage("/Index");
    }
}

public class LoginDto
{
    public string Email { get; set; }
    public string Password { get; set; }
}
