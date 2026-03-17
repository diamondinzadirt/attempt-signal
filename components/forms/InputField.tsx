'use client';

import React, { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react';
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {cn} from "@/lib/utils";

const InputField = ({ name, label, placeholder, type = "text", register, error, validation, disabled, value }: FormInputProps) => {
    const isPasswordField = type === 'password';
    const [showPassword, setShowPassword] = useState(false);
    const inputType = isPasswordField && showPassword ? 'text' : type;

    return (
        <div className="space-y-2">
            <Label htmlFor={name} className="form-label">
                {label}
            </Label>
            <div className="relative">
                <Input
                    type={inputType}
                    id={name}
                    placeholder={placeholder}
                    disabled={disabled}
                    value={value}
                    className={cn('form-input', isPasswordField && 'pr-11', { 'opacity-50 cursor-not-allowed': disabled })}
                    {...register(name, validation)}
                />

                {isPasswordField && (
                    <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 transition-colors hover:text-violet-400 focus:outline-none focus-visible:text-violet-400 disabled:pointer-events-none"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        aria-pressed={showPassword}
                        disabled={disabled}
                    >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                )}
            </div>
            {error && <p className="text-sm text-red-500">{error.message}</p>}
        </div>
    )
}
export default InputField
