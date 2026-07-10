from fastapi import FastAPI


def create_app() -> FastAPI:
    app = FastAPI(title="Market Research API")
    return app


app = create_app()
