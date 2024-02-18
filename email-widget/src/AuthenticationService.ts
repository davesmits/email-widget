import { OidcClient, OidcClientSettings, UseRefreshTokenArgs } from 'oidc-client-ts';
import { jwtDecode } from 'jwt-decode';

const url = self.location.origin;


const settings: OidcClientSettings = {
    authority: 'https://login.microsoftonline.com/common',
    client_id: '69627cef-ce41-4861-8418-7f336d6d1321',
    redirect_uri: url,
    post_logout_redirect_uri: url,
    response_type: 'code',
    scope: 'https://graph.microsoft.com/Mail.Read offline_access profile openid',

    response_mode: 'fragment',

    filterProtocolClaims: true
};

const client = new OidcClient(settings);

export class AuthenticationService {

    public async startLogin(): Promise<void> {
        const optionalArgs = {
            prompt: 'select_account',
            resource: 'https://graph.microsoft.com',
            scope: 'https://graph.microsoft.com/Mail.Read offline_access profile openid'
        };

        const req = await client.createSigninRequest(optionalArgs);
        window.location.href = req.url;
    }

    public async tryProcessLogin(): Promise<Token | null> {
        if (window.location.hash && window.location.hash.startsWith('#code=')) {

            //const response = await client.processSigninResponse(window.location.href);
            const state = await client.readSigninResponseState(window.location.href);
            window.location.hash = '';

            const response = await (await fetch(`/api/ExchangeAuthorizationCodeToAccessToken?authcode=${encodeURIComponent(state.response.code ?? '')}&redirect_uri=${encodeURIComponent(state.state.redirect_uri)}&code_verifier=${encodeURIComponent(state.state.code_verifier ?? '')}&scope=${encodeURIComponent(state.state.scope ?? '')}`, {
                method: 'GET',
            })).json();

            const payload = jwtDecode<JwtClaims>(response.access_token);

            return {
                name: payload['upn'] as string,
                id_token: response.id_token ?? null,
                access_token: response.access_token,
                refresh_token: response.refresh_token ?? null,
                scope: response.scope ?? null
            }
        }
        return null;
    }

    public async refreshTokenAsync(token: Token): Promise<Token | null> {

        const response = await (await fetch(`/api/RefreshToken?refresh_token=${encodeURIComponent(token.refresh_token ?? '')}&scope=${encodeURIComponent(token.scope ?? '')}`, {
            method: 'GET',
        })).json();

        const payload = jwtDecode<JwtClaims>(response.access_token);

        return {
            name: payload['upn'] as string,
            id_token: response.id_token ?? null,
            access_token: response.access_token,
            refresh_token: response.refresh_token ?? null,
            scope: response.scope ?? null
        }
    }
}

export interface JwtClaims {
    [claim: string]: unknown;

    /** The 'iss' (issuer) claim identifies the principal that issued the JWT. The processing of this claim is generally application specific. The 'iss' value is a case-sensitive string containing a StringOrURI value. */
    iss?: string;
    /** The 'sub' (subject) claim identifies the principal that is the subject of the JWT. The claims in a JWT are normally statements about the subject. The subject value MUST either be scoped to be locally unique in the context of the issuer or be globally unique. The processing of this claim is generally application specific. The 'sub' value is a case-sensitive string containing a StringOrURI value. */
    sub?: string;
    /** The 'aud' (audience) claim identifies the recipients that the JWT is intended for. Each principal intended to process the JWT MUST identify itself with a value in the audience claim. If the principal processing the claim does not identify itself with a value in the 'aud' claim when this claim is present, then the JWT MUST be rejected. In the general case, the 'aud' value is an array of case-sensitive strings, each containing a StringOrURI value. In the special case when the JWT has one audience, the 'aud' value MAY be a single case-sensitive string containing a StringOrURI value. The interpretation of audience values is generally application specific. */
    aud?: string | string[];
    /** The 'exp' (expiration time) claim identifies the expiration time on or after which the JWT MUST NOT be accepted for processing. The processing of the 'exp' claim requires that the current date/time MUST be before the expiration date/time listed in the 'exp' claim. Implementers MAY provide for some small leeway, usually no more than a few minutes, to account for clock skew. Its value MUST be a number containing a NumericDate value. */
    exp?: number;
    /** The 'nbf' (not before) claim identifies the time before which the JWT MUST NOT be accepted for processing. The processing of the 'nbf' claim requires that the current date/time MUST be after or equal to the not-before date/time listed in the 'nbf' claim. Implementers MAY provide for some small leeway, usually no more than a few minutes, to account for clock skew. Its value MUST be a number containing a NumericDate value. */
    nbf?: number;
    /** The 'iat' (issued at) claim identifies the time at which the JWT was issued. This claim can be used to determine the age of the JWT. Its value MUST be a number containing a NumericDate value. */
    iat?: number;
    /** The 'jti' (JWT ID) claim provides a unique identifier for the JWT. The identifier value MUST be assigned in a manner that ensures that there is a negligible probability that the same value will be accidentally assigned to a different data object; if the application uses multiple issuers, collisions MUST be prevented among values produced by different issuers as well. The 'jti' claim can be used to prevent the JWT from being replayed. The 'jti' value is a case-sensitive string. */
    jti?: string;
}

export interface Token {
    name: string;
    id_token: string | null;
    access_token: string;
    refresh_token: string | null;
    scope: string | null;
}

export interface UserInfo {
    name: string;
}

export const AuthenticationServiceInstance = new AuthenticationService();