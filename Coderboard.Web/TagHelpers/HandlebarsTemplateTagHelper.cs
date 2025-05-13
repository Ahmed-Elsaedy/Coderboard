using HandlebarsDotNet;
using Microsoft.AspNetCore.Razor.TagHelpers;

namespace Coderboard.Web.TagHelpers
{
    [HtmlTargetElement("handlebars-template")]
    public class HandlebarsTemplateTagHelper : TagHelper
    {
        [HtmlAttributeName("id")]
        public string Id { get; set; } = Guid.NewGuid().ToString("N");

        [HtmlAttributeName("model")]
        public object Model { get; set; }

        public override async Task ProcessAsync(TagHelperContext context, TagHelperOutput output)
        {
            var templateContent = (await output.GetChildContentAsync()).GetContent();

            var compiled = Handlebars.Compile(templateContent);
            var rendered = compiled(Model ?? new { });

            string templateId = $"{Id}-template";
            string containerId = $"{Id}-container";

            output.TagName = null;
            output.Content.Clear();

            output.Content.AppendHtml($"""
                <script id="{templateId}" type="text/x-handlebars-template">
{templateContent}
</script>
""");

            output.Content.AppendHtml(Environment.NewLine);

            output.Content.AppendHtml($"""
                <div id="{containerId}">
{rendered}
</div>
""");
        }
    }
}
