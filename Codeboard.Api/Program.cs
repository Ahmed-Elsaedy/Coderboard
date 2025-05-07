using Codeboard.Api.Domain;
using Codeboard.Api.Framework.Extenstions;
using Codeboard.Api.Infrastructure.Database;
using FluentValidation;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddAuthorization();

builder.Services.ConfigureApplicationCookie(options =>
{
    options.Cookie.Name = "Identity";
    options.Cookie.HttpOnly = true;
    options.ExpireTimeSpan = TimeSpan.FromMinutes(30);
    options.SlidingExpiration = false;
});

builder.Services.AddIdentityApiEndpoints<SystemUser>()
    .AddEntityFrameworkStores<ApplicationDbContext>();

builder.Services.AddOpenApi(options =>
{
    options.AddOperationTransformer((operation, context, cancellationToken) =>
    {
        var path = context.Description.RelativePath;
        if(path == "identity/manage/2fa")
        {
            operation.OperationId = "IdentityManage2fa";
        }
        
        return Task.CompletedTask;
    });
});

builder.Services.AddEndpoints(typeof(Program).Assembly);

builder.Services.AddValidatorsFromAssemblyContaining<Program>();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/openapi/v1.json", "Codeboard API V1");
    });
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapGroup("/identity")
   .MapIdentityApi<SystemUser>()
   .WithTags("Identity");

app.MapEndpoints();

app.Run();
