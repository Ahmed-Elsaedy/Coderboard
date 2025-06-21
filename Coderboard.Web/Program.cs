using Coderboard.Web.Framework.Kiota;
using Coderboard.Web.Resources;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Localization;
using Microsoft.Extensions.Options;
using Microsoft.Kiota.Abstractions.Authentication;
using System.Globalization;
using System.Reflection;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddHttpContextAccessor();

builder.Services.AddKiotaHandlers();

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

builder.Services.AddHttpClient<CoderboardApiClientFactory>((sp, client) => {
    var config = sp.GetRequiredService<IConfiguration>();
    client.BaseAddress = new Uri(config["ApiBaseUrl"]);
    client.DefaultRequestHeaders.Add("x-api-key", config["Auth:ApiKey"]);
}).AttachKiotaHandlers();

builder.Services.AddTransient(sp => sp.GetRequiredService<CoderboardApiClientFactory>().GetClient());

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

app.MapStaticAssets();
app.MapRazorPages()
   .WithStaticAssets();

app.Run();

internal class TokenProvider : IAccessTokenProvider
{
    public AllowedHostsValidator AllowedHostsValidator { get; }

    public Task<string> GetAuthorizationTokenAsync(
        Uri uri,
        Dictionary<string, object> additionalAuthenticationContext = null,
        CancellationToken cancellationToken = default)
    {
        return Task.FromResult("");
    }
}