'use client';
import { useEffect, useState } from "react";

export default function MapBox() {
    const [rect, setRect] = useState<{ x: number; y: number } | null>(null);

    useEffect(() => {
        (async () => {
            const res = await fetch("http://localhost:8080/map");
            const data = await res.json();
            setRect(data);
        })();
    }, []);

    return (
        <div className="flex justify-center items-center w-screen h-screen bg-gray-100">
            {rect && (
                <div
                    className="bg-white border-4 border-black"
                    style={{
                        width: `${rect.x}px`,
                        height: `${rect.y}px`,
                    }}
                />
            )}
        </div>
    );
}
