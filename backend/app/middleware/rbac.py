from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional
from app.auth import get_current_role, Role

security = HTTPBearer()


async def require_admin(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> str:
    """Require admin role for access."""
    token = credentials.credentials
    role = get_current_role(token)
    
    if role != Role.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    return role


async def require_readonly_or_admin(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> str:
    """Require readonly or admin role for access."""
    token = credentials.credentials
    role = get_current_role(token)
    
    if role not in [Role.ADMIN, Role.READONLY]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Valid role required"
        )
    
    return role


async def optional_auth(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(HTTPBearer(auto_error=False))
) -> Optional[str]:
    """Optional authentication - returns role if token provided, None otherwise."""
    if credentials:
        token = credentials.credentials
        return get_current_role(token)
    return None
