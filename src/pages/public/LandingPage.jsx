import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { ArrowRight, PlayCircle, ShieldCheck, Radio, Activity } from "lucide-react";
import { IconSphere } from "@/components/styles/background/IconSphere";
import { Tiles } from "@/components/styles/background/tiles";
import { Button } from "@/components/ui/button";

function Hero({ className, ...props }) {
    const navigate = useNavigate();
    return (
        <>
            {/* Hero Section */}
            <div className={cn("relative min-h-screen overflow-hidden", className)} {...props}>
                {/* Tiles background */}
                <div className="absolute inset-0 z-0">
                    <Tiles rows={50} cols={50} />
                </div>
                <div className="absolute inset-0 bg-muted/80 z-5" />

                {/* Content overlay */}
                <div className="absolute inset-0 flex flex-col z-10">
                    {/* nav */}
                    <header className="relative mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4">
                        <div className="flex items-center gap-2">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                                <ShieldCheck className="h-5 w-5" strokeWidth={2.25} />
                            </div>
                            <span className="text-lg font-semibold tracking-tight">
                                Sentinel<span className="text-destructive">.</span>EDM
                            </span>
                        </div>
                        <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
                            <a href="#about" className="hover:text-foreground transition-colors">
                                About
                            </a>
                            <a href="#features" className="hover:text-foreground transition-colors">
                                Features
                            </a>
                            <a href="#how" className="hover:text-foreground transition-colors">
                                How it works
                            </a>
                            <a href="#faq" className="hover:text-foreground transition-colors">
                                FAQ
                            </a>
                        </nav>
                        <div className="flex items-center gap-3">
                            <Button variant="outline" onClick={() => navigate("/login")}>
                                Sign in
                            </Button>
                        </div>
                    </header>

                    {/* hero grid */}
                    <section className="relative mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-12 px-6 lg:grid-cols-2 lg:gap-8 flex-1">
                        {/* left */}
                        <div className="relative">
                            <h1 className="text-balance text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
                                NwSSU SJC{" "}
                                <span className="text-destructive">Emergency Alert </span>
                                <span>Platform.</span>
                            </h1>
                            <p className="text-lg leading-relaxed text-muted-foreground sm:text-lg">
                                Keeping the campus informed and safe.
                            </p>
                            <dl className="mt-4 grid max-w-lg grid-cols-3 gap-6 pt-8">
                                <Stat icon={<Radio className="h-4 w-4" />} label="Alert types" value="420+" />
                                <Stat icon={<Activity className="h-4 w-4" />} label="Avg. dispatch" value="2.4s" />
                                <Stat icon={<ShieldCheck className="h-4 w-4" />} label="Uptime SLA" value="99.99%" />
                            </dl>
                        </div>
                        {/* right — standalone floating 3D icon sphere */}
                        <div className="relative flex h-[520px] items-center justify-center lg:h-[500px]">
                            <IconSphere radius={230} />
                        </div>
                    </section>
                </div>
            </div>
        </>
    );
}

export default Hero;

function Stat({ icon, label, value }) {
    return (
        <div>
            <div className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-muted-foreground">
                {icon}
                {label}
            </div>
            <div className="mt-1 text-2xl font-semibold tracking-tight">{value}</div>
        </div>
    );
}