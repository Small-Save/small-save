import { IonInput } from "@ionic/react";
import useFormInput from "Hooks/useFormInput";

type InputType = 'text' | 'number' | 'email' | 'tel' | 'date';
interface FieldProps {
    label: string;
    placeholder?: string;
    type?: InputType;
    hook: ReturnType<typeof useFormInput<any>>;
    inputProps?: Record<string, any>;
}
export const Field: React.FC<FieldProps> = ({ label, placeholder, type = "text", hook, inputProps }) => {
    const { bind, isError } = hook;
    return (
        <IonInput
            type={type}
            label={label}
            labelPlacement="stacked"
            placeholder={placeholder}
            className={`${isError && "ion-invalid"} ${hook.touched && "ion-touched"}`}
            aria-invalid={isError}
            {...bind}
            {...inputProps}
        />
    );
};