using FastEndpoints;
using Microsoft.AspNetCore.Http;

namespace Coderboard.Modules.Identity.Features.SayHello
{
    sealed class Endpoint : Endpoint<Request, Response>
    {
        public override void Configure()
        {
            Post("/api/hello");
            Description(x => x.WithTags("Test"));
            // AllowAnonymous();
        }

        public override async Task HandleAsync(Request r, CancellationToken c)
        {
            await SendAsync(new()
            {
                Message = $"Hello {r.FirstName} {r.LastName}..."
            });
        }
    }
}