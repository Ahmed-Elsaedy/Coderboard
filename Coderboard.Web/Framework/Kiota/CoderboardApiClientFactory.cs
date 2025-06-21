using Coderboard.Web.HttpClients;
using Microsoft.Kiota.Abstractions.Authentication;
using Microsoft.Kiota.Http.HttpClientLibrary;

namespace Coderboard.Web.Framework.Kiota
{
    public class CoderboardApiClientFactory
    {
        private readonly IAuthenticationProvider _authenticationProvider;
        private readonly HttpClient _httpClient;

        public CoderboardApiClientFactory(HttpClient httpClient)
        {
            _authenticationProvider = new AnonymousAuthenticationProvider();
            _httpClient = httpClient;
        }

        public CoderboardApiClient GetClient()
        {
            return new CoderboardApiClient(new HttpClientRequestAdapter(_authenticationProvider, httpClient: _httpClient));
        }
    }
}
