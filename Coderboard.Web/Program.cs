using Coderboard.Modules.Identity;
using Coderboard.Web.Resources;
using FastEndpoints;
using FastEndpoints.Swagger;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Localization;
using Microsoft.Extensions.Options;
using System.Globalization;
using System.Reflection;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddHttpContextAccessor();

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

builder.Services
  .AddFastEndpoints(o =>
  {
      o.SourceGeneratorDiscoveredTypes.AddRange(Coderboard.Modules.Identity.DiscoveredTypes.All);
  });

builder.Services.SwaggerDocument(o =>
{
    o.AutoTagPathSegmentIndex = 0;
    o.EnableJWTBearerAuth = false;
});

builder.Services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
    .AddCookie(options =>
    {
        options.LoginPath = "/Login";
        options.LogoutPath = "/Logout";
        options.ExpireTimeSpan = TimeSpan.FromMinutes(60);
        options.SlidingExpiration = false;
    });

builder.Services.AddAuthorization();

IdentityModule.RegisterServices(builder.Services, builder.Configuration);

var app = builder.Build();

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error");
    app.UseHsts();
}

var locOptions = app.Services.GetRequiredService<IOptions<RequestLocalizationOptions>>();
app.UseRequestLocalization(locOptions.Value);

app.UseHttpsRedirection();

app.UseRouting();

app.UseAuthentication();
app.UseAuthorization();

app.UseFastEndpoints(
       c =>
       {
           c.Binding.ReflectionCache.AddFromCoderboardModulesIdentity();
           c.Errors.UseProblemDetails();
       })
   .UseSwaggerGen();

app.MapStaticAssets();
app.MapRazorPages()
   .WithStaticAssets();

IdentityModule.ConfigureServices(app);

app.Run();
