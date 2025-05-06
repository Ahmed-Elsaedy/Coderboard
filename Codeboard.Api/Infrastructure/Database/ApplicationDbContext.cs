using Codeboard.Api.Domain;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace Codeboard.Api.Infrastructure.Database
{
    public class ApplicationDbContext : IdentityDbContext<SystemUser>
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) :
            base(options)
        { }

        public DbSet<Student> Students { get; set; }
    }
}
