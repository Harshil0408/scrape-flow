"use client"

import { CoinsIcon, HomeIcon, Layers2Icon, MenuIcon, ShieldCheckIcon } from "lucide-react"
import Logo from "./logo"
import Link from "next/link"
import { Button, buttonVariants } from "./ui/button"
import { usePathname } from "next/navigation"
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet"
import { useState } from "react"
import UserAvailableCreditBadge from "./user-available-credit-badge"

const routes = [
    {
        href: "/",
        label: "Home",
        icon: HomeIcon
    },
    {
        href: "workflows",
        label: "Workflows",
        icon: Layers2Icon
    },
    {
        href: "credentials",
        label: "Credentials",
        icon: ShieldCheckIcon
    },
    {
        href: "billing",
        label: "Billing",
        icon: CoinsIcon
    },
]

const DesktopSidebar = () => {

    const pathname = usePathname();
    const activeRoutes = routes.find(
        (route) => route.href.length > 1 && pathname.includes(route.href)
    ) || routes[0];

    return (
        <div className="hidden relative md:block min-w-[280px] max-w-[280px] h-screen overflow-hidden w-full bg-primary/5 dark:bg-secondary/30 dark:text-foreground text-muted-foreground border-r-2 border-separate">
            <div className="flex items-center justify-center gap-2 border-b-[1px] border-separate p-4">
                <Logo />
            </div>
            <div className="p-2"><UserAvailableCreditBadge /></div>
            <div className="flex flex-col p-2 gap-2">
                {routes.map((route) => (
                    <Link href={route.href} key={route.href} className={buttonVariants({ variant: activeRoutes.href === route.href ? "sidebarActiveItem" : "sidebarItem" })}>
                        <route.icon size={20} />
                        {route.label}
                    </Link>
                ))}
            </div>
        </div>
    )
}

export const MobileSidebar = () => {

    const [isOpen, setIsOpen] = useState<boolean>(false);
    const pathname = usePathname();
    const activeRoutes = routes.find(
        (route) => route.href.length > 0 && pathname.includes(route.href)
    ) || routes[0];

    return (
        <div className="block border-separate bg-background md:hidden">
            <nav className="container flex items-center justify-between px-8">
                <Sheet open={isOpen} onOpenChange={setIsOpen}>
                    <SheetTrigger asChild>
                        <Button variant={"ghost"} size={"icon"}>
                            <MenuIcon />
                        </Button>
                    </SheetTrigger>
                    <SheetContent className="w-[400px] sm:w-[540px] space-y-4" side={"left"}>
                        <Logo />
                        <UserAvailableCreditBadge />
                        <div className="flex flex-col gap-1">
                            {" "}
                            {routes.map((route) => (
                                <Link
                                    href={route.href}
                                    key={route.href}
                                    className={buttonVariants({ variant: activeRoutes.href === route.href ? "sidebarActiveItem" : "sidebarItem" })}
                                    onClick={() => setIsOpen((prev) => !prev)}
                                >
                                    <route.icon size={20} />
                                    {route.label}
                                </Link>
                            ))}
                        </div>
                    </SheetContent>
                </Sheet>
            </nav>
        </div>
    )
}

export default DesktopSidebar
