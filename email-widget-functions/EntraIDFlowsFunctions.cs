using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using System.Net.Http;
using System.Collections.Generic;

namespace email_widget_functions
{
    public static class EntraIDFlowsFunctions
    {
        public static HttpClient _httpClient = new();

        [FunctionName("ExchangeAuthorizationCodeToAccessToken")]
        public static async Task<IActionResult> ExchangeAuthorizationCodeToAccessToken(
            [HttpTrigger(AuthorizationLevel.Anonymous, "get", "post", Route = null)] HttpRequest req,
            ILogger log)
        {
            string code = req.Query["authcode"];
            string redirect_uri = req.Query["redirect_uri"];
            string code_verifier = req.Query["code_verifier"];
            string scope = req.Query["scope"];

            var response = await _httpClient.SendAsync(new HttpRequestMessage(HttpMethod.Post, "https://login.microsoftonline.com/common/oauth2/v2.0/token")
            {
                Content = new FormUrlEncodedContent(new Dictionary<string, string>()
                {
                    {"grant_type", "authorization_code" },
                    {"client_id", "69627cef-ce41-4861-8418-7f336d6d1321" },
                    {"client_secret", "pyY8Q~CFc5QRFrEI-lqdHkBhkCdZAqBitO8MYcDh" },
                    {"scope", scope },
                    {"code", code },
                    {"redirect_uri", redirect_uri },
                    {"code_verifier", code_verifier }
                })
            });
            var token = await response.Content.ReadAsAsync<Token>();

            return new JsonResult(token);
        }

        [FunctionName("RefreshToken")]
        public static async Task<IActionResult> RefreshToken(
            [HttpTrigger(AuthorizationLevel.Anonymous, "get", "post", Route = null)] HttpRequest req,
            ILogger log)
        {
            string refresh_token = req.Query["refresh_token"];
            string scope = req.Query["scope"];

            var response = await _httpClient.SendAsync(new HttpRequestMessage(HttpMethod.Post, "https://login.microsoftonline.com/common/oauth2/v2.0/token")
            {
                Content = new FormUrlEncodedContent(new Dictionary<string, string>()
                {
                    {"grant_type", "refresh_token" },
                    {"client_id", "69627cef-ce41-4861-8418-7f336d6d1321" },
                    {"client_secret", "pyY8Q~CFc5QRFrEI-lqdHkBhkCdZAqBitO8MYcDh" },
                    {"scope", scope },
                    {"refresh_token", refresh_token },
                })
            });

            if (response.IsSuccessStatusCode)
            {
                var token = await response.Content.ReadAsAsync<Token>();
                return new JsonResult(token);
            }

            else
            {
                var token = await response.Content.ReadAsStringAsync();
                return new JsonResult(token);
            }
        }


        [FunctionName("UserInfo")]
        public static async Task<IActionResult> UserInfo(
                [HttpTrigger(AuthorizationLevel.Anonymous, "get", "post", Route = null)] HttpRequest req,
                ILogger log)
        {
            string code = req.Query["access_token"];

            var requestMessage = new HttpRequestMessage(HttpMethod.Post, "https://graph.microsoft.com/oidc/userinfo");
            requestMessage.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("bearer", code);
            var response = await _httpClient.SendAsync(requestMessage);
            var token = await response.Content.ReadAsAsync<UserInfo>();

            return new JsonResult(token);
        }
    }

}
