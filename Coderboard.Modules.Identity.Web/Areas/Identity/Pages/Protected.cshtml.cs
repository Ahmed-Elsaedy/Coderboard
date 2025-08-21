using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace Coderboard.Modules.Identity.Web.Areas.Identity.Pages
{
    [Authorize]
    public class ProtectedModel : PageModel
    {
        public void OnGet()
        {
        }
    }
}
