using Microsoft.AspNetCore.Mvc.RazorPages;

namespace Coderboard.Modules.Identity.Web.Framework
{
    public static class PageModelExtentions
    {
        public static string GetPageModelModule(this PageModel model)
        {
            return $"/_content/{model.GetType().Assembly.GetName().Name}"
                    + model.PageContext?.ActionDescriptor?.RelativePath + ".js";
        }
    }
}
