using FastEndpoints;
using FluentValidation;

namespace Coderboard.Modules.Identity.Features.SayHello;

sealed class RegisterSystemUserRequest
{
    public string Email { get; set; }
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public string Password { get; set; }

    internal sealed class Validator : Validator<RegisterSystemUserRequest>
    {
        public Validator()
        {
            RuleFor(x => x.FirstName).MinimumLength(3);
            RuleFor(x => x.LastName).MinimumLength(5);
        }
    }
}