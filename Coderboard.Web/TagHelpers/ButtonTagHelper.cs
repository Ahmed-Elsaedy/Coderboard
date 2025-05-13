using Microsoft.AspNetCore.Razor.TagHelpers;
namespace Coderboard.Web.TagHelpers
{
    [HtmlTargetElement("custom-button")]
    public class ButtonTagHelper : TagHelper
    {
        public string Text { get; set; } = "Click Me";
        public string Color { get; set; } = "primary"; // bootstrap default

        public override void Process(TagHelperContext context, TagHelperOutput output)
        {
            output.TagName = "button"; // Replace <custom-button> with <button>
            output.Attributes.SetAttribute("class", $"btn btn-{Color}");
            output.Content.SetContent(Text);
        }
    }
}
