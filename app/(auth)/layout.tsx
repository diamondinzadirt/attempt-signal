import Link from "next/link";
import Image from "next/image";
import {auth} from "@/lib/better-auth/auth";
import {headers} from "next/headers";
import {redirect} from "next/navigation";
import AuthPreviewImage from "@/components/AuthPreviewImage";
import AppCopyright from "@/components/AppCopyright";

const Layout = async ({ children }: { children : React.ReactNode }) => {
    const session = await auth.api.getSession({ headers: await headers() })

    if(session?.user) redirect('/')

    return (
        <main className="auth-layout">
            <section className="auth-left-section scrollbar-hide-default relative">
                <div aria-hidden className="auth-mobile-hero-glow sm:hidden" />

                <Link href="/" className="auth-logo relative z-10 flex w-fit items-center gap-2 sm:gap-3">
                    <Image src="/assets/icons/logo.svg" alt="Attempt Signal logo" width={140} height={32} className='h-8 w-auto' />
                    <span className="brand-title" aria-label="ATTEMPT SIGNAL">
                        <span className="brand-word">ATTEMPT</span>
                        <span className="brand-word">SIGNAL</span>
                    </span>
                </Link>

                 <div className="z-10 relative lg:mt-4 lg:mb-16">
                    <p className="auth-blockquote lg:hidden">
                        <span className="block">Smarter watchlists</span>
                        <span className="block">AI alerts when markets move</span>
                    </p>
                    <p className="auth-blockquote hidden lg:block">
                        Attempt Signal turns your watchlist into a winning list. The alerts are spot-on, with AI summarized information of moves in the market.
                    </p>
                </div>

                <div className="relative z-10 pb-6 lg:pb-8 flex-1">{children}</div>
                <AppCopyright className="relative z-10 pb-6 text-center lg:pb-8 lg:text-left" />
            </section>

            <section className="auth-right-section">
                <div className="flex-1 relative">
                    <AuthPreviewImage />
                </div>
            </section>
        </main>
    )
}
export default Layout
