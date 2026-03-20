'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import LoadingSpinner from "@/components/LoadingSpinner";

const FooterLink = ({ text, linkText, href }: FooterLinkProps) => {
    const router = useRouter();
    const [isNavigating, setIsNavigating] = useState(false);

    const handleClick = () => {
        setIsNavigating(true);
        router.push(href);
    };

    return (
        <>
            <div className="text-center pt-4">
                <p className="text-sm text-gray-500">
                    {text}{` `}
                    <button type="button" onClick={handleClick} className="footer-link cursor-pointer">
                        {linkText}
                    </button>
                </p>
            </div>
            {isNavigating && <LoadingSpinner fullScreen label={`Opening ${linkText.toLowerCase()}...`} />}
        </>
    )
}
export default FooterLink
