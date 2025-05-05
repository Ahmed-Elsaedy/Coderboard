using Codeboard.Api.Framework.Interfaces;

namespace Codeboard.Api.Endpoints.Weather.GetForecast
{
    public class GetForecast : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app)
        {
            var weatherApi = app.MapGroup("/weather")
                .WithTags("Weather");

            weatherApi.MapGet("/", () =>
            {
                var Summaries = new[] { "Freezing", "Bracing", "Chilly", "Cool", "Mild", "Warm", "Balmy", "Hot", "Sweltering", "Scorching" };

                var forecasts = Enumerable.Range(1, 5).Select(index =>
                    new WeatherForecast
                    {
                        Date = DateOnly.FromDateTime(DateTime.Now.AddDays(index)),
                        TemperatureC = Random.Shared.Next(-20, 55),
                        Summary = Summaries[Random.Shared.Next(Summaries.Length)]
                    }).ToArray();

                return forecasts;
            })
            .WithName("GetWeatherForecast");
        }
    }
}
