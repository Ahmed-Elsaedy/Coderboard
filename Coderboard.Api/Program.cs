using Coderboard.Api;
using Coderboard.Modules.Identity;
using FastEndpoints;
using FastEndpoints.ClientGen.Kiota;
using FastEndpoints.Swagger;
using Kiota.Builder;
using Microsoft.AspNetCore.Authentication;
using NSwag;

var builder = WebApplication.CreateBuilder(args);

builder.Services
  .AddFastEndpoints(o =>
  {
      o.SourceGeneratorDiscoveredTypes.AddRange(Coderboard.Modules.Identity.DiscoveredTypes.All);
  })
  .AddAuthorization()
  .AddAuthentication(ApikeyAuth.SchemeName)
  .AddScheme<AuthenticationSchemeOptions, ApikeyAuth>(ApikeyAuth.SchemeName, null);

builder.Services.SwaggerDocument(o =>
{
    o.AutoTagPathSegmentIndex = 0;
    o.EnableJWTBearerAuth = false;
    o.DocumentSettings = s =>
    {
        s.AddAuth(ApikeyAuth.SchemeName, new()
        {
            Name = ApikeyAuth.HeaderName,
            In = OpenApiSecurityApiKeyLocation.Header,
            Type = OpenApiSecuritySchemeType.ApiKey,
        });
    };
});

IdentityModule.RegisterServices(builder.Services, builder.Configuration);

var app = builder.Build();

app.UseHttpsRedirection();

app.UseAuthentication()
   .UseAuthorization()
   .UseFastEndpoints(
       c =>
       {
           c.Binding.ReflectionCache.AddFromCoderboardApi();
           c.Errors.UseProblemDetails();
       })
   .UseSwaggerGen();

IdentityModule.ConfigureServices(app);

await app.GenerateApiClientsAndExitAsync(c =>
    {
        c.SwaggerDocumentName = "v1";
        c.Language = GenerationLanguage.CSharp;
        c.OutputPath = Path.Combine(app.Environment.ContentRootPath, "..", "Coderboard.Web", "HttpClients");
        c.ClientNamespaceName = "Coderboard.Web.HttpClients";
        c.ClientClassName = "CoderboardApiClient";
        c.CreateZipArchive = false;
    });

app.Run();
