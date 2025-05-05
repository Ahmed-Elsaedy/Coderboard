using Codeboard.Api.Framework.Interfaces;

namespace Codeboard.Api.Features.Students.GetStudents
{
    public class GetStudents : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app)
        {
            var studentApi = app.MapGroup("/student")
                .WithTags("Student");

            studentApi.MapGet("/", () =>
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
            .WithName("GetStudentForecast");
        }
    }
}
