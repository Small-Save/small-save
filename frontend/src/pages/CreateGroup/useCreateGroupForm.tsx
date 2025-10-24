import { useCallback, useMemo } from "react";
import useFormInput from "Hooks/useFormInput";
import { validateDuration, validateGroupSize, validateTargetAmount } from "lib/utils";

// Types
export type WinnerSelectionMethod = "random" | "bidding";

export interface CreateGroupFormData {
    groupName: string;
    targetAmount: string;
    duration: string;
    groupSize: string;
    winnerMethod: WinnerSelectionMethod;
    startDate: string;
}

// Validation functions
const validateGroupName = (name: string): ValidationResult => {
    const trimmedName = name.trim();
    if (trimmedName.length < 2) {
        return { isValid: false, errorText: "Group name must be at least 2 characters" };
    }
    if (trimmedName.length > 50) {
        return { isValid: false, errorText: "Group name must be less than 50 characters" };
    }
    return { isValid: true };
};

const validateStartDate = (date: string): ValidationResult => {
    if (!date) {
        return { isValid: false, errorText: "Start date is required" };
    }

    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
        return { isValid: false, errorText: "Start date cannot be in the past" };
    }

    return { isValid: true };
};

export const useCreateGroupForm = () => {
    // Form state management
    const groupName = useFormInput("", validateGroupName);
    const targetAmount = useFormInput("", validateTargetAmount);
    const duration = useFormInput("", validateDuration);
    const groupSize = useFormInput("", validateGroupSize);
    const winnerMethod = useFormInput<WinnerSelectionMethod>("random");
    const startDate = useFormInput("", validateStartDate);

    // Form validation
    const isFormValid = useMemo(() => {
        return groupName.isValid && targetAmount.isValid && duration.isValid && groupSize.isValid && startDate.isValid;
    }, [groupName.isValid, targetAmount.isValid, duration.isValid, groupSize.isValid, startDate.isValid]);

    // Touch all fields to show validation errors
    const touchAllFields = useCallback(() => {
        groupName.bind.onIonBlur?.();
        targetAmount.bind.onIonBlur?.();
        duration.bind.onIonBlur?.();
        groupSize.bind.onIonBlur?.();
        startDate.bind.onIonBlur?.();
    }, [groupName.bind, targetAmount.bind, duration.bind, groupSize.bind, startDate.bind]);

    // Get form data
    const getFormData = useCallback((): CreateGroupFormData => {
        return {
            groupName: groupName.value.trim(),
            targetAmount: targetAmount.value,
            duration: duration.value,
            groupSize: groupSize.value,
            winnerMethod: winnerMethod.value,
            startDate: startDate.value
        };
    }, [groupName.value, targetAmount.value, duration.value, groupSize.value, winnerMethod.value, startDate.value]);

    // Reset form
    const resetForm = useCallback(() => {
        groupName.setValue("");
        targetAmount.setValue("");
        duration.setValue("");
        groupSize.setValue("");
        winnerMethod.setValue("random");
        startDate.setValue("");
    }, [groupName, targetAmount, duration, groupSize, winnerMethod, startDate]);

    return {
        fields: {
            groupName,
            targetAmount,
            duration,
            groupSize,
            winnerMethod,
            startDate
        },
        isFormValid,
        touchAllFields,
        getFormData,
        resetForm
    };
};
