using Coderboard.Modules.Identity.Infrastructure.Data;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.DependencyInjection;

namespace Coderboard.Modules.Identity.Web
{
    public static class IdentityWebModule
    {
        public static IServiceCollection RegisterServices(WebApplicationBuilder builder)
        {
            IdentityModule.RegisterServices(builder.Services, builder.Configuration);

            builder.Services.AddDefaultIdentity<IdentityUser>(options => options.SignIn.RequireConfirmedAccount = true)
                    .AddEntityFrameworkStores<IdentityModuleDbContext>();

            builder.Services.AddAuthentication()
                .AddGoogle(options =>
                {
                    options.ClientId = builder.Configuration["Authentication:Google:ClientId"];
                    options.ClientSecret = builder.Configuration["Authentication:Google:ClientSecret"];
                    // This is the default path Google will redirect to:
                    // https://localhost:5001/signin-google (or your actual domain)
                    // options.CallbackPath = "/signin-google"; 
                    options.SaveTokens = true; // optional: store tokens in the auth cookie
                    options.Scope.Add("profile");
                    options.Scope.Add("email");
                });


            builder.Services.ConfigureApplicationCookie(options =>
            {
                options.LoginPath = "/Identity/Account/Login";
                options.AccessDeniedPath = "/Identity/Account/AccessDenied";

                options.Events.OnRedirectToLogin = context =>
                {
                    if (context.Request.Path.StartsWithSegments("/api"))
                    {
                        context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                        return Task.CompletedTask;
                    }
                    context.Response.Redirect(context.RedirectUri);
                    return Task.CompletedTask;
                };
            });

            return builder.Services;
        }

        public static WebApplication ConfigureServices(WebApplication app)
        {
            IdentityModule.ConfigureServices(app);

            return app;
        }
    }
}
