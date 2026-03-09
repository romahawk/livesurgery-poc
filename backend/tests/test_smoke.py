from app.main import app


def test_app_bootstraps() -> None:
    assert app.title == "Livesurgery PoC API"


def test_root_route_exists() -> None:
    route_paths = {route.path for route in app.routes}
    assert "/" in route_paths


def test_healthz_route_exists() -> None:
    route_paths = {route.path for route in app.routes}
    assert "/healthz" in route_paths


def test_sessions_routes_exist() -> None:
    route_paths = {route.path for route in app.routes}
    assert "/v1/sessions" in route_paths
    assert "/v1/sessions/{session_id}" in route_paths


def test_auth_token_route_exists() -> None:
    route_paths = {route.path for route in app.routes}
    assert "/auth/token" in route_paths
