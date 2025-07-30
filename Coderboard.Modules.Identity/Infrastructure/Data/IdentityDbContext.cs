using Coderboard.Modules.Identity.Domain;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace Coderboard.Modules.Identity.Infrastructure.Data
{
    public class IdentityModuleDbContext : IdentityDbContext
    {
        public DbSet<SystemUser> SystemUser { get; set; }

        public IdentityModuleDbContext(DbContextOptions<IdentityModuleDbContext> options) : base(options) { }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            modelBuilder.HasDefaultSchema("Identity");
        }
    }
}
