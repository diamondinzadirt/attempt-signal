'use client';

import Link from "next/link";
import { useState } from "react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {useRouter} from "next/navigation";
import {Button} from "@/components/ui/button";
import {ChevronDown, LogOut} from "lucide-react";
import NavbarSearchBar from "@/components/NavbarSearchBar";
import {signOut} from "@/lib/actions/auth.actions";
import { NAV_ITEMS } from "@/lib/constants";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";

const UserDropdown = ({ user }: {user: User }) => {
    const router = useRouter();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleSignOut = async () => {
        await signOut();
        setMobileMenuOpen(false);
        router.push("/sign-in");
    }

    return (
        <>
            <div className="sm:hidden">
                <Button
                    variant="ghost"
                    className="flex items-center gap-1.5 px-2 text-gray-400 hover:text-violet-500"
                    onClick={() => setMobileMenuOpen(true)}
                    aria-label="Open mobile navigation menu"
                >
                    <Avatar className="h-8 w-8">
                        <AvatarImage src="" />
                        <AvatarFallback className="bg-violet-500 text-violet-950 text-sm font-bold">
                            {user.name[0]}
                        </AvatarFallback>
                    </Avatar>
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                </Button>
            </div>

            <Dialog open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <DialogContent className="sm:hidden top-0 left-0 h-dvh w-screen max-w-none translate-x-0 translate-y-0 rounded-none border-none bg-gray-900/85 px-4 py-6 text-gray-100 backdrop-blur-md data-[state=open]:slide-in-from-top-2 data-[state=closed]:slide-out-to-top-2">
                    <DialogTitle className="sr-only">Mobile navigation menu</DialogTitle>
                    <DialogDescription className="sr-only">
                        Quick actions for search, navigation, and account sign out.
                    </DialogDescription>

                    <div className="flex h-full flex-col">
                        <div className="pb-4">
                            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500">Search</p>
                            <NavbarSearchBar className="max-w-none" searchOnFocus={false} searchOnEmptyQuery={false} />
                        </div>

                        <nav className="flex flex-col gap-2 pt-2">
                            {NAV_ITEMS.map(({ href, label }) => (
                                <Link
                                    key={href}
                                    href={href}
                                    className="flex h-12 items-center rounded-md px-3 text-base font-medium text-gray-200 hover:bg-gray-700 hover:text-violet-400"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    {label}
                                </Link>
                            ))}
                        </nav>

                        <div className="mt-auto border-t border-gray-600 pt-4">
                            <button
                                type="button"
                                onClick={handleSignOut}
                                className="flex h-12 w-full items-center rounded-md px-3 text-base font-medium text-gray-100 hover:bg-gray-700 hover:text-violet-400"
                            >
                                <LogOut className="mr-2 h-4 w-4" />
                                Logout
                            </button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            <div className="hidden sm:block">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="flex items-center gap-3 text-gray-4 hover:text-violet-500">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src="" />
                                <AvatarFallback className="bg-violet-500 text-violet-950 text-sm font-bold">
                                    {user.name[0]}
                                </AvatarFallback>
                            </Avatar>
                            <div className="hidden md:flex flex-col items-start">
                                <span className='text-base font-medium text-gray-400'>
                                    {user.name}
                                </span>
                            </div>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="text-gray-400">
                        <DropdownMenuLabel>
                            <div className="flex relative items-center gap-3 py-2">
                                <Avatar className="h-10 w-10">
                                    <AvatarImage src="" />
                                    <AvatarFallback className="bg-violet-500 text-violet-950 text-sm font-bold">
                                        {user.name[0]}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col">
                                    <span className='text-base font-medium text-gray-400'>
                                        {user.name}
                                    </span>
                                    <span className="text-sm text-gray-500">{user.email}</span>
                                </div>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-gray-600"/>
                        <DropdownMenuItem onClick={handleSignOut} className="text-gray-100 text-md font-medium focus:bg-transparent focus:text-violet-500 transition-colors cursor-pointer">
                            <LogOut className="h-4 w-4 mr-2 hidden sm:block" />
                            Logout
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </>
    )
}
export default UserDropdown
