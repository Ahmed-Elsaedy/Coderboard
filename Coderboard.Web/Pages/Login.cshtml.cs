using Coderboard.Web.Resources;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using System.ComponentModel.DataAnnotations;

namespace Coderboard.Web.Pages;

public class LoginModel : PageModel
{
    private readonly IConfiguration _config;

    public LoginModel(IConfiguration config)

    {
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

    //public IActionResult OnPost()
    //{
    //    //if (!ModelState.IsValid)
    //    //    return Page();

    //    //var result = await _apiClient.Api.Hello.PostAsync(new() { FirstName = "Joeehn", LastName = "Doeee" });

    //    //ViewData["Message"] = result.Message;

    //    //var loginResult = await _identityClient.LoginAsync(new LoginRequest()
    //    //{
    //    //    Email = Email,
    //    //    Password = Password
    //    //});

    //    //Response.Cookies.Append("AccessToken", loginResult.AccessToken);
    //    //Response.Cookies.Append("RefreshToken", loginResult.RefreshToken);

    //    //List<Claim> claims = [
    //    //        new(ClaimTypes.Name, Email),
    //    //        new(ClaimTypes.Role, "Admin")
    //    //];

    //    //var identity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
    //    //var principal = new ClaimsPrincipal(identity);

    //    //await HttpContext.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme, principal);

    //    return Page();
    //}
}