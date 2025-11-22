from rest_framework.exceptions import APIException
from rest_framework import status

from rest_framework.views import exception_handler
from utils.response import CustomResponse


def custom_exception_handler(exc, context):
    """
    Custom exception handler that ensures all errors are returned
    using CustomResponse format.
    """

    # First, get the standard DRF response
    response = exception_handler(exc, context)

    if response is not None:
        # Example: ValidationError, AuthenticationFailed, PermissionDenied
        return CustomResponse(
            is_success=False,
            data={},
            status_code=response.status_code,
            message="Request failed",
            toast_message=None,
            error=response.data,   # include DRF's error details
        )

    # If DRF could not handle the exception, treat it as 500
    return CustomResponse(
        is_success=False,
        data={},
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        message="Internal server error",
        toast_message=None,
        error=str(exc),
    )

class CustomAPIException(APIException):
    def __init__(self, detail=None, toast_message=None, status_code=status.HTTP_400_BAD_REQUEST):
        self.toast_message = toast_message or "Something went wrong"
        self.status_code = status_code
        super().__init__(detail=detail)

    def get_full_details(self):
        # This will be returned to the client
        return {
            "is_success": False,
            "data": {},
            "message": self.detail,
            "toast_message": self.toast_message,
            "error": str(self.detail),
        }


class BadRequestError(CustomAPIException):
    def __init__(self, detail="Bad request", toast_message="Invalid input"):
        super().__init__(detail=detail, toast_message=toast_message, status_code=status.HTTP_400_BAD_REQUEST)


class ConflictError(CustomAPIException):
    def __init__(self, detail="Conflict", toast_message="Conflict occurred"):
        super().__init__(detail=detail, toast_message=toast_message, status_code=status.HTTP_409_CONFLICT)

