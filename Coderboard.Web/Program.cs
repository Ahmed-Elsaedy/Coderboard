using Coderboard.Clients;
using Coderboard.Web.Framework;
using Coderboard.Web.Resources;
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

builder.Services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
    .AddCookie(options =>
    {
        options.LoginPath = "/Login";
        options.LogoutPath = "/Logout";
        options.ExpireTimeSpan = TimeSpan.FromMinutes(60);
        options.SlidingExpiration = false;
    });

builder.Services.AddAuthorization();

builder.Services.AddHttpClient("ApiClient", client =>
{
    client.BaseAddress = new Uri("https://localhost:7251");
})
.AddHttpMessageHandler<AccessTokenHandler>();

builder.Services.AddTransient<AccessTokenHandler>();

builder.Services.AddHttpClient<IdentityClient>("ApiClient");
builder.Services.AddHttpClient<WeatherClient>("ApiClient");

var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error");
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}

var locOptions = app.Services.GetRequiredService<IOptions<RequestLocalizationOptions>>();
app.UseRequestLocalization(locOptions.Value);

app.UseHttpsRedirection();

app.UseRouting();

app.UseAuthentication();
app.UseAuthorization();

app.MapStaticAssets();
app.MapRazorPages()
   .WithStaticAssets();

app.Run();
