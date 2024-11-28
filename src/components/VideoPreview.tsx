import {useRef, useEffect} from 'react';

interface VideoPreviewProps {
    stream: MediaStream | null;
    elmentId: string;
}

export function VideoPreview({stream, elmentId}: VideoPreviewProps) {
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream;
        }
    }, [stream]);

    return (
        <div className="w-full max-w-md aspect-video bg-gray-900 rounded-lg overflow-hidden">
            <video
                ref={videoRef}
                id={elmentId}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
            />
        </div>
    );
}