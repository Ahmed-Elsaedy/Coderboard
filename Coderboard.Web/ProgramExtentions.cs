using Coderboard.Modules.Identity;
using Coderboard.Web.Resources;
using FastEndpoints;
using FastEndpoints.Swagger;
using Microsoft.AspNetCore.Localization;
using Microsoft.Extensions.Options;
using System.Globalization;
using System.Reflection;

namespace Coderboard.Web
{
    public static class ProgramExtentions
    {
        public static class Localizations
        {
            public static IServiceCollection RegisterServices(WebApplicationBuilder builder)
            {
                builder.Services.AddLocalization(options => options.ResourcesPath = "Resources");

                builder.Services.Configure<RequestLocalizationOptions>(options =>
                {
                    var supportedCultures = new[]
                    {
                        new CultureInfo("en"),
                        new CultureInfo("ar")
                    };

                    options.DefaultRequestCulture = new RequestCulture("en");
                    options.SupportedCultures = supportedCultures;
                    options.SupportedUICultures = supportedCultures;

                    options.AddInitialRequestCultureProvider(new CustomRequestCultureProvider(async context =>
                    {
                        var cultureFromCookie = context.Request.Cookies["Culture"];
                        return await Task.FromResult(new ProviderCultureResult(string.IsNullOrEmpty(cultureFromCookie) ? "en" : cultureFromCookie));
                    }));
                });

                return builder.Services;
            }

            public static WebApplication ConfigureServices(WebApplication app)
            {
                var locOptions = app.Services.GetRequiredService<IOptions<RequestLocalizationOptions>>();
                app.UseRequestLocalization(locOptions.Value);
                
                return app;
            }
        }

        public static class RazorPages
        {
            public static IServiceCollection RegisterServices(WebApplicationBuilder builder)
            {
                builder.Services.AddRazorPages()
                    .AddViewLocalization()
                    .AddDataAnnotationsLocalization(
                            options =>
                            {
                                options.DataAnnotationLocalizerProvider =
                                    (type, factory) =>
                                    {
                                        var assemblyName =
                                            new AssemblyName(
                                                typeof(DataAnnotations)
                                                        .GetTypeInfo()
                                                        .Assembly.FullName!);
                                        return factory.Create("DataAnnotations", assemblyName.Name!);
                                    };
                            });
                return builder.Services;
            }
        }

        public static class FastEndpoints
        {
            public static IServiceCollection RegisterServices(WebApplicationBuilder builder)
            {
                builder.Services.AddFastEndpoints(o =>
                    {
                        o.SourceGeneratorDiscoveredTypes.AddRange(Coderboard.Modules.Identity.DiscoveredTypes.All);
                    }).SwaggerDocument(o =>
                    {
                        o.AutoTagPathSegmentIndex = 0;
                        o.EnableJWTBearerAuth = false;
                    });

                return builder.Services;
            }

            public static WebApplication ConfigureServices(WebApplication app)
            {
                app.UseFastEndpoints(
                       c =>
                       {
                           c.Binding.ReflectionCache.AddFromCoderboardModulesIdentity();
                           c.Errors.UseProblemDetails();
                       })
                   .UseSwaggerGen();

                return app;
            }
        }

        public static class CommonServices
        {
            public static IServiceCollection RegisterServices(WebApplicationBuilder builder)
            {
                builder.Services.AddHttpContextAccessor();

                return builder.Services;
            }

            public static WebApplication ConfigureServices(WebApplication app)
            {
                if (!app.Environment.IsDevelopment())
                {
                    app.UseExceptionHandler("/Error");
                    app.UseHsts();
                }

                app.UseHttpsRedirection();

                app.UseRouting();

                app.UseAuthentication();

                app.UseAuthorization();

                app.MapStaticAssets();

                app.MapRazorPages()
                   .WithStaticAssets();

                return app;
            }
        }
    }
}