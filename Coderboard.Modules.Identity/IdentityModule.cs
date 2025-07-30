using Coderboard.Modules.Identity.Infrastructure.Data;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Routing;
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

            services.AddIdentityApiEndpoints<IdentityUser>().AddEntityFrameworkStores<IdentityModuleDbContext>();

            return services;
        }

        public static WebApplication ConfigureServices(WebApplication app)
        {
            app.MapGroup("/identity").MapIdentityApi<IdentityUser>().WithTags("Identity");

            return app;
        }
    }
}
