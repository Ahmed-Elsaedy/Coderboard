using Coderboard.Modules.Identity.Infrastructure.Data;
using Coderboard.Modules.Identity.Infrastructure.Services;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Identity.UI.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Coderboard.Modules.Identity
{
    public static class IdentityModule
    {
        public static IServiceCollection RegisterServices(IServiceCollection services, IConfiguration configuration)
        {
            services.AddDbContext<IdentityModuleDbContext>(options =>
                // options.UseSqlServer(configuration.GetConnectionString("IdentityDbConnection")));
                options.UseSqlite(configuration.GetConnectionString("IdentityDbConnection")));

            services.AddTransient<IEmailSender, FileEmailSender>();

            return services;
        }

        public static WebApplication ConfigureServices(WebApplication app)
        {
            return app;
        }
    }
}
