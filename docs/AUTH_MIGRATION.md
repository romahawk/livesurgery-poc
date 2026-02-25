# Auth Migration Plan — Dev Scaffold → Real OIDC

**Status:** Not started (current: dev auth scaffold, see ADR-003)
**Target:** Bearer JWT validated against an OIDC IdP (Auth0, Supabase Auth, or Keycloak)
**Estimated scope:** 2–3 days solo work

---

## Current state

The app uses two layers of dev auth:

1. **`POST /auth/token`** — backend mints an HMAC-signed token given userId + role in the request body. No identity verification.
2. **Dev header fallback** — if no Bearer token, `get_current_principal()` accepts `X-Dev-Role` and `X-Dev-User-Id` headers from the caller. Zero security.
3. **WS tokens** — session-scoped HMAC tokens minted by the backend after REST auth succeeds. These are safe to keep as-is; only the REST auth changes.

The single function to replace is `get_current_principal()` in `backend/app/core/auth.py`.
The frontend change is in `ensureToken()` in `frontend-react/src/api/sessions.js`.

---

## Step 1: Choose an IdP

| Option | Best for | Cost | Self-host |
|---|---|---|---|
| **Auth0** | Quickest integration, generous free tier | Free to ~7,500 MAU | No |
| **Supabase Auth** | Already using Supabase for Postgres | Free tier available | Possible |
| **Keycloak** | Full control, no vendor dependency | Free (infra cost only) | Yes |

**Recommendation for PoC/MVP:** Auth0 or Supabase Auth — lowest setup friction.

---

## Step 2: Configure the IdP

### Auth0 setup

1. Create an Auth0 tenant at `https://manage.auth0.com`
2. Create an **Application** (Single Page Application) → note `Domain` and `Client ID`
3. Create an **API** → set Identifier (Audience) e.g. `https://api.livesurgery.app`
4. Add roles to the access token:
   - Enable "Add Roles to Tokens" in Auth0 Rules or Actions
   - Create roles: `SURGEON`, `OBSERVER`, `ADMIN`
   - Add a custom claim: `https://livesurgery.app/role` in the access token
5. Set Allowed Callback URLs: `http://localhost:5173/callback, https://livesurgery.vercel.app/callback`

### Supabase Auth setup

1. Create a Supabase project
2. Enable email/password auth (or social providers)
3. Use the `user_metadata` or a custom `profiles` table to store role
4. JWT is automatically issued — use the Supabase JWT secret for verification

---

## Step 3: Replace backend token verification

**File:** `backend/app/core/auth.py`

Replace `_verify_api_token()` with a proper JWT validator.

### Option A: Auth0 (using python-jose)

```bash
pip install python-jose[cryptography] requests
```

```python
# backend/app/core/auth.py

import os
from jose import jwt, JWTError
import requests

AUTH0_DOMAIN = os.environ.get("AUTH0_DOMAIN")  # e.g. "dev-xxx.us.auth0.com"
AUTH0_AUDIENCE = os.environ.get("AUTH0_AUDIENCE")  # e.g. "https://api.livesurgery.app"
ALGORITHMS = ["RS256"]

def _get_jwks():
    url = f"https://{AUTH0_DOMAIN}/.well-known/jwks.json"
    return requests.get(url).json()

def _verify_bearer_token(token: str) -> dict:
    """Verify an Auth0 access token. Returns claims or raises AppError."""
    try:
        jwks = _get_jwks()
        unverified_header = jwt.get_unverified_header(token)
        rsa_key = {}
        for key in jwks["keys"]:
            if key["kid"] == unverified_header["kid"]:
                rsa_key = {k: key[k] for k in ["kty", "kid", "use", "n", "e"]}
        if not rsa_key:
            raise AppError("INVALID_TOKEN", "Unable to find appropriate key", 401)
        payload = jwt.decode(
            token,
            rsa_key,
            algorithms=ALGORITHMS,
            audience=AUTH0_AUDIENCE,
            issuer=f"https://{AUTH0_DOMAIN}/",
        )
        return payload
    except JWTError as exc:
        raise AppError("INVALID_TOKEN", "Token verification failed", 401) from exc
```

Then update `get_current_principal()`:

```python
def get_current_principal(
    authorization: str | None = Header(default=None),
) -> Principal:
    if not authorization or not authorization.startswith("Bearer "):
        raise AppError("MISSING_TOKEN", "Authorization header required", 401)

    raw_token = authorization.removeprefix("Bearer ").strip()
    claims = _verify_bearer_token(raw_token)

    # Extract userId and role from Auth0 claims
    user_id = claims["sub"]
    role_claim = claims.get("https://livesurgery.app/role", "OBSERVER")
    role = _normalize_role(role_claim)
    _upsert_user(user_id, role)
    return Principal(user_id=user_id, role=role)
```

> Remove the dev header fallback entirely at this point.

### Option B: Supabase Auth (using PyJWT)

```bash
pip install PyJWT cryptography
```

```python
import jwt as pyjwt

SUPABASE_JWT_SECRET = os.environ.get("SUPABASE_JWT_SECRET")

def _verify_bearer_token(token: str) -> dict:
    try:
        return pyjwt.decode(token, SUPABASE_JWT_SECRET, algorithms=["HS256"])
    except pyjwt.PyJWTError as exc:
        raise AppError("INVALID_TOKEN", "Token verification failed", 401) from exc
```

---

## Step 4: Replace frontend token acquisition

**File:** `frontend-react/src/api/sessions.js`

Replace `ensureToken()` with your IdP SDK.

### Option A: Auth0 React SDK

```bash
cd frontend-react
npm install @auth0/auth0-react
```

```jsx
// frontend-react/src/main.jsx
import { Auth0Provider } from "@auth0/auth0-react";

<Auth0Provider
  domain={import.meta.env.VITE_AUTH0_DOMAIN}
  clientId={import.meta.env.VITE_AUTH0_CLIENT_ID}
  authorizationParams={{
    redirect_uri: window.location.origin,
    audience: import.meta.env.VITE_AUTH0_AUDIENCE,
  }}
>
  <App />
</Auth0Provider>
```

```js
// frontend-react/src/api/sessions.js
import { useAuth0 } from "@auth0/auth0-react";

// In a hook or context that wraps the API calls:
const { getAccessTokenSilently } = useAuth0();

async function ensureToken() {
  return getAccessTokenSilently();
}
```

### Option B: Supabase Auth

```bash
npm install @supabase/supabase-js
```

```js
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

async function ensureToken() {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}
```

---

## Step 5: Update `.env.example`

Add IdP-specific variables to `.env.example`:

```bash
# Auth0 (if using Auth0)
AUTH0_DOMAIN=dev-xxx.us.auth0.com
AUTH0_AUDIENCE=https://api.livesurgery.app
VITE_AUTH0_DOMAIN=dev-xxx.us.auth0.com
VITE_AUTH0_CLIENT_ID=your-client-id
VITE_AUTH0_AUDIENCE=https://api.livesurgery.app

# Supabase (if using Supabase Auth)
SUPABASE_JWT_SECRET=your-supabase-jwt-secret
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

---

## Step 6: Update WS token minting (optional but recommended)

The WS token currently uses userId from the REST principal (after REST auth). Once REST auth is real, this chain is already secure. No change strictly required.

To strengthen it: pass the verified identity's `sub` claim into `hub.mint_token()` instead of the dev userId. This is already wired — `principal.user_id` flows into `ws_token = hub.mint_token(session_id, principal.user_id, ...)`.

---

## Step 7: Test the migration

```bash
# Backend: verify token from IdP is accepted
curl -H "Authorization: Bearer <real-access-token>" \
  http://localhost:8000/v1/sessions

# Frontend: open browser DevTools → Network → check Authorization header
# on requests to /v1/sessions — should show "Bearer eyJ..."

# Remove dev header fallback and verify 401 without a token:
curl http://localhost:8000/v1/sessions  # should return 401
```

---

## Rollback plan

The dev auth scaffold is still in `get_current_principal()` as the fallback branch. During migration, keep it there. Remove it only after verifying the new token path works end-to-end. The `X-Dev-Role` fallback is gated behind "no Bearer token present", so both paths can coexist during transition.

---

## Files changed in this migration

| File | Change |
|---|---|
| `backend/app/core/auth.py` | Replace `_verify_api_token()` with IdP JWT verifier; remove dev header fallback |
| `backend/app/routes/auth.py` | Replace token minting with OIDC token exchange (or remove entirely) |
| `backend/requirements.txt` | Add `python-jose[cryptography]` or `PyJWT cryptography` |
| `frontend-react/src/api/sessions.js` | Replace `ensureToken()` with IdP SDK call |
| `frontend-react/src/main.jsx` | Wrap `<App>` with `<Auth0Provider>` or Supabase provider |
| `frontend-react/package.json` | Add `@auth0/auth0-react` or `@supabase/supabase-js` |
| `.env.example` | Add IdP environment variables |
| `docs/DECISIONS_LOG.md` | Add ADR-007: IdP choice |
