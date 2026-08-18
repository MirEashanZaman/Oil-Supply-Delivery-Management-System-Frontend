import Image from "next/image";

export default function MyHeader(props: { name: string; message: string }) {
    return (
        <>
            <Image src="/images.jpeg" alt="Logo" width={150} height={150} />
            <h6>{props.name} Page</h6>
            <p>This is {props.message}</p>
        </>
    );
}