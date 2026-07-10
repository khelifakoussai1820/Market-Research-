from fastapi import ApiRouter


router = ApiRouter(prefix="/auth", tags=["auth"])

@router.post("/login")
def login():
    return {"message": "Login"}

@router.post("/register")
def register():
    return {"message": "Register"}

@router.post("/logout")
def logout():
    return {"message": "Logout"}
