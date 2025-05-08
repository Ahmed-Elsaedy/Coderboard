using Coderboard.Clients;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using System.Security.Claims;

namespace Coderboard.Web.Pages;

public class LoginModel : PageModel
{
    private readonly IConfiguration _config;
    private readonly IdentityClient _identityClient;

    public LoginModel(IHttpClientFactory httpClientFactory, IConfiguration config)

    {
        _identityClient = new IdentityClient(httpClientFactory.CreateClient("ApiClient"));
        _config = config;
    }

    [BindProperty]
    public LoginDto Input { get; set; } = new();

    public async Task<IActionResult> OnPostAsync()
    {
        if (!ModelState.IsValid)
            return Page();

        var loginResult = await _identityClient.LoginAsync(new LoginRequest()
        {
            Email = Input.Email,
            Password = Input.Password
        });

        Response.Cookies.Append("AccessToken", loginResult.AccessToken);
        Response.Cookies.Append("RefreshToken", loginResult.RefreshToken);

        List<Claim> claims = [
                new(ClaimTypes.Name, Input.Email),
                new(ClaimTypes.Role, "Admin")
        ];

        var identity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
        var principal = new ClaimsPrincipal(identity);

        await HttpContext.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme, principal);

        return RedirectToPage("/Index");
    }
}

public class LoginDto
{
    public string Email { get; set; }
    public string Password { get; set; }
}
