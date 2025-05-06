using Codeboard.Api.Domain;
using Codeboard.Api.Framework.Interfaces;
using Codeboard.Api.Infrastructure.Database;

namespace Codeboard.Api.Features.Weather.GetForecast
{
    public class GetForecast : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app)
        {
            var weatherApi = app.MapGroup("/weather")
                .WithTags("Weather");

            weatherApi.MapGet("/", (HttpContext httpContext) =>
            {
                var userClaims = httpContext.User.Claims.Select(c => new
                {
                    c.Type,
                    c.Value
                });

                return Results.Ok(userClaims);
            })
            .WithName("GetWeatherForecast")
            .RequireAuthorization();
        }
    }
}
