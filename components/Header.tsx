import Link from "next/link";
import Image from "next/image";
import NavItems from "@/components/NavItems";
import UserDropdown from "@/components/UserDropdown";
import NavbarSearchBar from "@/components/NavbarSearchBar";

const Header = async ({ user }: { user: User }) => {
    return (
        <header className="sticky top-0 header">
            <div className="container header-wrapper gap-4">
                <Link href="/" className="flex items-center gap-2 sm:gap-3">
                    <Image src="/assets/icons/logo.svg" alt="Attempt Signal logo" width={140} height={32} className="h-8 w-auto cursor-pointer" />
                    <span className="brand-title" aria-label="attempt signal">
                        <span className="brand-word">attempt</span>
                        <span className="brand-word">signal</span>
                    </span>
                </Link>

                <div className="hidden sm:flex flex-1 items-center justify-end gap-6">
                    <nav>
                        <NavItems />
                    </nav>
                    <NavbarSearchBar className="w-[340px] xl:w-[420px]" />
                </div>

                <UserDropdown user={user} />
            </div>
        </header>
    )
}
export default Header
