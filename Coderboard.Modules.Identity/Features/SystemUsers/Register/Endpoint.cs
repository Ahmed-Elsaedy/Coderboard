using Coderboard.Modules.Identity.Infrastructure.Data;
using FastEndpoints;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;
using System.Text;

namespace Coderboard.Modules.Identity.Features.SayHello
{
    sealed class RegisterSystemUserEndpoint : Endpoint<RegisterSystemUserRequest>
    {
        private readonly IdentityDbContext _dbContext;
        public RegisterSystemUserEndpoint(IdentityDbContext dbContext)
        {
            _dbContext = dbContext;
        }
        public override void Configure()
        {
            Post("/systemusers/register");
            Description(x => x.WithTags("SystemUsers"));
            AllowAnonymous();
        }

        public override async Task HandleAsync(RegisterSystemUserRequest request, CancellationToken ct)
        {
            var passwordHash = HashPassword(request.Password);

            var alreadyExists = await _dbContext.SystemUser
                .AnyAsync(x => x.Email == request.Email, ct);

            if (alreadyExists)
                ThrowError("User with this email already exists.");

            var systemUser = new Domain.SystemUser()
            {
                Email = request.Email,
                FirstName = request.FirstName,
                LastName = request.LastName,
                PasswordHash = passwordHash
            };

            _dbContext.SystemUser.Add(systemUser);

            await _dbContext.SaveChangesAsync(ct);

            await SendOkAsync();
        }

        private string HashPassword(string password)
        {
            using var sha256 = SHA256.Create();
            var bytes = Encoding.UTF8.GetBytes(password);
            var hash = sha256.ComputeHash(bytes);
            return Convert.ToBase64String(hash);
        }
    }
}