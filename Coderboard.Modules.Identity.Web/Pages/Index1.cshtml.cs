using Coderboard.Modules.Identity.Web.Resources;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using System.ComponentModel.DataAnnotations;

namespace Coderboard.Modules.Identity.Web.Pages
{
    public class Index1Model : PageModel
    {
        [BindProperty]
        [DataType(DataType.EmailAddress)]
        [Display(Name = "First", ResourceType = typeof(IdentityResources))]
        public string? Email { get; set; }
        public void OnGet()
        {
        }
    }
}
