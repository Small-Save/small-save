import { useState } from "react";


function useFormInput<T>(initial: T, validate?: (v: T) => ValidationResult, transform?: (v: T) => T) {
    const [value, setValue] = useState<T>(initial);
    const [touched, setTouched] = useState<boolean>(false);

    // compute validation result
    const result: ValidationResult = validate ? validate(value) : { isValid: true };
    const isError = touched && !result.isValid;

    const handleInput = (e: CustomEvent) => {
        const input = e.target as HTMLInputElement;
        let newValue = input?.value as T;
        if (transform) newValue = transform(newValue);
        setValue(newValue);
    };

    return {
        value,
        setValue,
        bind: {
            value,
            onIonInput: handleInput,
            onIonBlur: () => setTouched(true),
            errorText: result.errorText
        },
        isError,
        touched,
        isValid: result.isValid
    };
}

export default useFormInput;
