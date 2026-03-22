"use client";

import { useEffect, useRef, useState } from "react";
import { MotionValue, useTransform, useMotionValueEvent } from "framer-motion";
import { cn } from "@/lib/utils";

interface CanvasSequenceProps {
    className?: string;
    /** Scroll progress scoped to the scrollytelling container (0 → 1) */
    scrollProgress: MotionValue<number>;
}

const FRAME_COUNT = 240;
// Crop the bottom 8% of each frame to remove the "Veo" watermark
const CROP_BOTTOM_RATIO = 0.08;

export default function CanvasSequence({ className, scrollProgress }: CanvasSequenceProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [images, setImages] = useState<HTMLImageElement[]>([]);

    // Map the scoped scroll progress (0→1) to frame index (0→239)
    const frameIndex = useTransform(scrollProgress, [0, 1], [0, FRAME_COUNT - 1]);

    useEffect(() => {
        const loadedImages: HTMLImageElement[] = [];
        let loadedCount = 0;

        for (let i = 1; i <= FRAME_COUNT; i++) {
            const img = new Image();
            const paddedIndex = i.toString().padStart(3, "0");
            img.src = `/sequence/ezgif-frame-${paddedIndex}.jpg`;

            img.onload = () => {
                loadedCount++;
                if (loadedCount === FRAME_COUNT) {
                    setImages(loadedImages);
                    renderFrame(0, loadedImages);
                }
            };

            loadedImages.push(img);
        }
    }, []);

    const renderFrame = (index: number, imgs: HTMLImageElement[]) => {
        if (!canvasRef.current || !imgs[index]) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const img = imgs[index];

        // Source: crop the bottom portion to remove watermark
        const srcW = img.width;
        const srcH = img.height * (1 - CROP_BOTTOM_RATIO);

        // Cover the canvas
        const hRatio = canvas.width / srcW;
        const vRatio = canvas.height / srcH;
        const ratio = Math.max(hRatio, vRatio);

        const drawW = srcW * ratio;
        const drawH = srcH * ratio;
        const centerX = (canvas.width - drawW) / 2;
        const centerY = (canvas.height - drawH) / 2;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(
            img,
            0, 0, srcW, srcH,
            centerX, centerY, drawW, drawH
        );
    };

    useMotionValueEvent(frameIndex, "change", (latest) => {
        if (images.length === FRAME_COUNT) {
            requestAnimationFrame(() => renderFrame(Math.round(latest), images));
        }
    });

    useEffect(() => {
        const handleResize = () => {
            if (canvasRef.current) {
                canvasRef.current.width = window.innerWidth;
                canvasRef.current.height = window.innerHeight;
                renderFrame(Math.round(frameIndex.get()), images);
            }
        };

        window.addEventListener("resize", handleResize);
        handleResize();

        return () => window.removeEventListener("resize", handleResize);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [images]);

    return (
        <div className={cn("absolute inset-0 w-full h-full pointer-events-none z-0", className)}>
            <canvas
                ref={canvasRef}
                className="w-full h-full"
                style={{ willChange: "transform" }}
            />
        </div>
    );
}
