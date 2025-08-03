using Coderboard.Modules.Identity.Web;
using Coderboard.Web;

var builder = WebApplication.CreateBuilder(args);

ProgramExtentions.CommonServices.RegisterServices(builder);
ProgramExtentions.Localizations.RegisterServices(builder);
ProgramExtentions.FastEndpoints.RegisterServices(builder);

// Register Modules
IdentityWebModule.RegisterServices(builder);

var app = builder.Build();

ProgramExtentions.CommonServices.ConfigureServices(app);
ProgramExtentions.Localizations.ConfigureServices(app);
ProgramExtentions.FastEndpoints.ConfigureServices(app);

// Configure Modules
IdentityWebModule.ConfigureServices(app);

app.Run();
