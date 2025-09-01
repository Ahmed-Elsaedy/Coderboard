using Microsoft.AspNetCore.Identity.UI.Services;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System.Net.Mail;

namespace Coderboard.Modules.Identity.Infrastructure.Services
{
    public class FileEmailSender : IEmailSender
    {
        private readonly string _pickupDir;
        private readonly ILogger<FileEmailSender> _logger;

        public FileEmailSender(IConfiguration config, ILogger<FileEmailSender> logger)
        {
            _pickupDir = config["Email:PickupDirectory"] ?? "emails";
            _logger = logger;
        }

        public Task SendEmailAsync(string email, string subject, string htmlMessage)
        {
            // Ensure directory exists
            if (!Directory.Exists(_pickupDir))
                Directory.CreateDirectory(_pickupDir);

            var mail = new MailMessage("no-reply@myapp.com", email, subject, htmlMessage);
            mail.IsBodyHtml = true;

            using (var client = new SmtpClient())
            {
                client.DeliveryMethod = SmtpDeliveryMethod.SpecifiedPickupDirectory;
                client.PickupDirectoryLocation = _pickupDir;
                client.Send(mail);
            }

            _logger.LogInformation("Email saved to {Dir}", _pickupDir);
            return Task.CompletedTask;
        }
    }
}