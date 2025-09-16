from rest_framework import status
from rest_framework.response import Response


class CustomResponse(Response):
    """Custom Response class for handling responses."""

    def __init__(
        self,
        is_success: bool = True,
        data: dict | None = None,
        toast_message: str | None = None,
        message: str | None = None,
        error: str | None = "",
        status_code: int = status.HTTP_200_OK,
    ):
        if data is None:
            data = {}
        super().__init__(
            self._format_response(is_success, data, message, toast_message, error),
            status_code,
        )

    @staticmethod
    def _format_response(is_success: bool, data: dict, message: str, toast_message: str, error: str) -> dict:
        return {
            "is_success": is_success,
            "data": data,
            "message": message,
            "toast_message": toast_message,
            "error": error,
        }
