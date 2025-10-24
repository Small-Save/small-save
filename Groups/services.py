import phonenumbers
from phonenumbers import NumberParseException
from typing import Optional, Dict, Any
from django.core.exceptions import ValidationError
from django.core.validators import validate_email


def normalize_phone_number(phone: str, region: str = None) -> Optional[str]:
    """
    Normalize phone number using phonenumbers library for international support.
    Returns E164 format if valid, None if invalid.

    Args:
        phone: Raw phone number string
        region: Default region code (e.g., 'US', 'GB') if no country code provided
    """
    if not phone:
        return None

    try:
        parsed_number = phonenumbers.parse(phone, region)
        if not phonenumbers.is_valid_number(parsed_number):
            return None
        return phonenumbers.format_number(
            parsed_number, phonenumbers.PhoneNumberFormat.E164
        )
    except NumberParseException:
        return None


def validate_contact_data(contact: Dict[str, Any]) -> Dict[str, Any]:
    """
    Validate and normalize contact data.
    Returns validated contact or raises ValidationError.
    """
    if not isinstance(contact, dict):
        raise ValidationError("Contact must be a dictionary")

    phone = contact.get("phone")
    email = contact.get("email")
    name = contact.get("name", "").strip()

    if not phone and not email:
        raise ValidationError("Either phone or email is required")

    validated_contact = {"name": name}

    # Validate and normalize phone
    if phone:
        # Try to detect region from user's profile or default to None for international parsing
        normalized_phone = normalize_phone_number(phone)
        if normalized_phone:
            validated_contact["phone"] = normalized_phone
        else:
            raise ValidationError(f"Invalid phone number: {phone}")

    # Validate email
    if email:
        try:
            validate_email(email)
            validated_contact["email"] = email.lower().strip()
        except ValidationError:
            raise ValidationError(f"Invalid email address: {email}")

    return validated_contact
