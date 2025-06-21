using Coderboard.Modules.Identity.Domain;
using Microsoft.EntityFrameworkCore;

namespace Coderboard.Modules.Identity.Infrastructure.Data
{
    public class IdentityDbContext : DbContext
    {
        public DbSet<SystemUser> SystemUser { get; set; }

        public IdentityDbContext(DbContextOptions<IdentityDbContext> options) : base(options) { }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            modelBuilder.HasDefaultSchema("Identity");
        }
    }
}
