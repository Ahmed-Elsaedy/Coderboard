using Microsoft.AspNetCore.Identity;

namespace Codeboard.Api.Domain
{
    public class SystemUser : IdentityUser
    {
        public string FirstName { get; set; }
        public string LastName { get; set; }
    }
}
