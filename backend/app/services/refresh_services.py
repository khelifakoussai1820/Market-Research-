from app.services import auth_services


def rotate_tokens(refresh_token: str) -> tuple[str, str]:
    return auth_services.refresh_access_token(refresh_token)
