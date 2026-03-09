from app.main import app


def test_app_bootstraps() -> None:
    assert app.title == "Livesurgery PoC API"


def test_root_route_exists() -> None:
    route_paths = {route.path for route in app.routes}
    assert "/" in route_paths
