using System.Net.Http.Headers;
using System.Net;
using System.Text.Json;

namespace Coderboard.Web.Framework
{
    public class TokenRefreshHandler : DelegatingHandler
    {
        private readonly IHttpContextAccessor _contextAccessor;

        public TokenRefreshHandler(IHttpContextAccessor contextAccessor)
        {
            _contextAccessor = contextAccessor;
        }

        protected override async Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
        {
            var accessToken = _contextAccessor.HttpContext?.Request.Cookies["AccessToken"];

            if (!string.IsNullOrEmpty(accessToken))
            {
                request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
            }

            var response = await base.SendAsync(request, cancellationToken);

            if (response.StatusCode == HttpStatusCode.Unauthorized)
            {
                // Try refresh
                var newToken = await RefreshTokenAsync();

                if (string.IsNullOrEmpty(newToken))
                    return response; // Refresh failed; return original 401

                // Set the new token in the request and retry
                var clonedRequest = await CloneHttpRequestMessageAsync(request);
                clonedRequest.Headers.Authorization = new AuthenticationHeaderValue("Bearer", newToken);

                return await base.SendAsync(clonedRequest, cancellationToken);
            }

            return response;
        }

        private async Task<string?> RefreshTokenAsync()
        {
            var refreshToken = _contextAccessor.HttpContext?.Request.Cookies["RefreshToken"];
            if (string.IsNullOrEmpty(refreshToken))
                return null;

            var client = new HttpClient(); // Create one-time client for refresh
            var request = new HttpRequestMessage(HttpMethod.Post, "https://your-api.com/auth/refresh");

            request.Content = new FormUrlEncodedContent(new Dictionary<string, string>
            {
                ["refresh_token"] = refreshToken
            });

            var response = await client.SendAsync(request);
            if (!response.IsSuccessStatusCode)
                return null;

            var json = await response.Content.ReadAsStringAsync();
            var obj = JsonSerializer.Deserialize<JwtResponse>(json, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

            // Update cookie with new token
            var httpContext = _contextAccessor.HttpContext;
            httpContext?.Response.Cookies.Append("AccessToken", obj?.AccessToken ?? "", new CookieOptions { HttpOnly = true, Secure = true });

            return obj?.AccessToken;
        }

        private async Task<HttpRequestMessage> CloneHttpRequestMessageAsync(HttpRequestMessage request)
        {
            var clone = new HttpRequestMessage(request.Method, request.RequestUri);

            // Copy content (if present)
            if (request.Content != null)
            {
                var ms = new MemoryStream();
                await request.Content.CopyToAsync(ms);
                ms.Position = 0;
                clone.Content = new StreamContent(ms);

                // Copy headers
                foreach (var header in request.Content.Headers)
                {
                    clone.Content.Headers.Add(header.Key, header.Value);
                }
            }

            // Copy headers
            foreach (var header in request.Headers)
            {
                clone.Headers.TryAddWithoutValidation(header.Key, header.Value);
            }

            return clone;
        }

        private class JwtResponse
        {
            public string AccessToken { get; set; } = string.Empty;
        }
    }
}
