import Image from "next/image";

export default function MyHeader(props: { name: string; message: string }) {
    return (
        <div className="w-full flex flex-col items-center justify-center my-6 text-center animate-fadeIn">
            <div className="relative mb-3 group">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary to-secondary rounded-2xl blur-sm opacity-25 group-hover:opacity-40 transition-opacity"></div>
                <div className="relative bg-white p-2.5 rounded-2xl shadow-sm border border-slate-200/80 flex items-center justify-center">
                    <Image src="/LOGO.png" alt="Logo" width={100} height={100} priority className="object-contain" />
                </div>
            </div>
            <div className="inline-flex items-center gap-2 mb-1">
                <span className="badge badge-primary badge-sm font-bold uppercase tracking-wider text-[10px] px-2.5 py-1">
                    {props.name}
                </span>
                <span className="text-xs text-secondary-gray font-medium tracking-wide">
                    Energy Logistics Network
                </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-dark-slate tracking-tight">
                {props.name} Portal
            </h1>
            <p className="text-sm text-secondary-gray max-w-md mt-1">
                {props.message}
            </p>
        </div>
    );
}