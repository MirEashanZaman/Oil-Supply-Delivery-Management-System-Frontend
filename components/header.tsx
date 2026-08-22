import Image from "next/image";

export default function MyHeader(props: { name: string; message: string }) {
    return (
        <>
            <Image src="/LOGO.png" alt="Logo" width={150} height={150} />
            <h6>{props.name} Page</h6>
            <p>{props.message}</p>
        </>
    );
}