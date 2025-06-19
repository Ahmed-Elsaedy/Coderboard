using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using System.Text.Json;

namespace Coderboard.Web.Pages
{
    public class DrawModel : PageModel
    {
        private readonly IWebHostEnvironment _environment;

        public DrawModel(IWebHostEnvironment environment)
        {
            _environment = environment;
        }

        [FromRoute]
        public string FileName { get; set; }

        public void OnGet()
        {
        }

        public IActionResult OnGetElements()
        {
            if (string.IsNullOrEmpty(FileName))
            {
                return new JsonResult(new { elements = Array.Empty<object>() });
            }

            var drawingsPath = Path.Combine(_environment.WebRootPath, "Drawings");
            var filePath = Path.Combine(drawingsPath, $"{FileName}.json");

            if (!System.IO.File.Exists(filePath))
            {
                return new JsonResult(new { elements = Array.Empty<object>() });
            }

            var jsonContent = System.IO.File.ReadAllText(filePath);
            var drawingData = JsonSerializer.Deserialize<object>(jsonContent);
            return new JsonResult(drawingData);
        }
    }
}
