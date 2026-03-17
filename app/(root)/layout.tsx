import Header from "@/components/Header";
import DashboardTickerBar from "@/components/DashboardTickerBar";
import AppCopyright from "@/components/AppCopyright";
import {auth} from "@/lib/better-auth/auth";
import {headers} from "next/headers";
import {redirect} from "next/navigation";

const Layout = async ({ children }: { children : React.ReactNode }) => {
    const session = await auth.api.getSession({ headers: await headers() });

    if(!session?.user) redirect('/sign-in');

    const user = {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
    }

    return (
        <main className="min-h-screen text-gray-400">
            <Header user={user} />
            <DashboardTickerBar />

            <div className="container flex min-h-[calc(100vh-70px)] flex-col py-10">
                <div className="flex-1">
                    {children}
                </div>
                <AppCopyright className="pt-10 text-center sm:text-left" />
            </div>
        </main>
    )
}
export default Layout
