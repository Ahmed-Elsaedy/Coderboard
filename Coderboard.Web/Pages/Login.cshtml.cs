using Coderboard.Clients;
using Coderboard.Web.Resources;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using System.ComponentModel.DataAnnotations;
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
    [DataType(DataType.EmailAddress)]
    [Required(ErrorMessage = nameof(DataAnnotations.Required))]
    [Display(Name = nameof(DataAnnotations.Pages_LoginModel_Email))]
    public string Email { get; set; }

    [BindProperty]
    [DataType(DataType.Password)]
    [Required(ErrorMessage = nameof(DataAnnotations.Required))]
    [Display(Name = nameof(DataAnnotations.Pages_LoginModel_Password))]
    public string Password { get; set; }

    public async Task<IActionResult> OnPostAsync()
    {
        if (!ModelState.IsValid)
            return Page();

        var loginResult = await _identityClient.LoginAsync(new LoginRequest()
        {
            Email = Email,
            Password = Password
        });

        Response.Cookies.Append("AccessToken", loginResult.AccessToken);
        Response.Cookies.Append("RefreshToken", loginResult.RefreshToken);

        List<Claim> claims = [
                new(ClaimTypes.Name, Email),
                new(ClaimTypes.Role, "Admin")
        ];

        var identity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
        var principal = new ClaimsPrincipal(identity);

        await HttpContext.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme, principal);

        return RedirectToPage("/Index");
    }
}