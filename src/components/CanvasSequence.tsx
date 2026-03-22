"use client";

import { useEffect, useRef } from "react";
import { type MotionValue, useMotionValueEvent, useTransform, useScroll } from "framer-motion";
import { cn } from "@/lib/utils";

interface CanvasSequenceProps {
    className?: string;
    scrollProgress?: MotionValue<number>;
}

const FRAME_COUNT = 240;
const CROP_BOTTOM_RATIO = 0.08;

export default function CanvasSequence({ className, scrollProgress }: CanvasSequenceProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Use a ref for images to prevent ANY React stale closures or re-render bugs
    const imagesRef = useRef<HTMLImageElement[]>(Array(FRAME_COUNT).fill(null));
    const currentFrameRef = useRef(0);

    useEffect(() => {
        for (let i = 1; i <= FRAME_COUNT; i++) {
            const img = new Image();
            const paddedIndex = i.toString().padStart(3, "0");
            img.src = `/sequence/ezgif-frame-${paddedIndex}.jpg`;

            img.onload = () => {
                imagesRef.current[i - 1] = img;

                // Draw the FIRST frame immediately when it loads, even if others aren't ready
                if (i === 1) {
                    renderFrame(0);
                }
            };
        }
    }, []);

    const renderFrame = (targetIndex: number) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const safeIndex = Math.max(0, Math.min(FRAME_COUNT - 1, Math.round(targetIndex)));
        const img = imagesRef.current[safeIndex];

        // If the image isn't loaded yet, do nothing (keep previous frame)
        if (!img || !img.complete) return;

        if (canvas.width === 0 || canvas.height === 0) {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const srcW = img.naturalWidth || img.width;
        const srcH = (img.naturalHeight || img.height) * (1 - CROP_BOTTOM_RATIO);
        if (!srcW || !srcH) return;

        const hRatio = canvas.width / srcW;
        const vRatio = canvas.height / srcH;

        // Use contain logic (Math.min) to ensure the FULL image is always visible.
        // We add a tiny 0.95 multiplier to give it a microscopic premium border.
        const ratio = Math.min(hRatio, vRatio) * 0.95;

        const drawW = srcW * ratio;
        const drawH = srcH * ratio;
        const cx = (canvas.width - drawW) / 2;
        const cy = (canvas.height - drawH) / 2;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, srcW, srcH, cx, cy, drawW, drawH);
    };

    // Fallback map
    const { scrollYProgress: defaultScroll } = useScroll();
    const activeProgress = scrollProgress || defaultScroll;
    const frameValue = useTransform(activeProgress, [0, 1], [0, FRAME_COUNT - 1]);

    useMotionValueEvent(frameValue, "change", (latestVal) => {
        // We can scrub even if not FULLY loaded, as long as the specific frame is loaded
        const target = Math.round(latestVal);
        if (currentFrameRef.current !== target) {
            currentFrameRef.current = target;

            // Use requestAnimationFrame for smooth drawing
            requestAnimationFrame(() => renderFrame(target));
        }
    });

    useEffect(() => {
        const handleResize = () => {
            if (canvasRef.current) {
                canvasRef.current.width = window.innerWidth;
                canvasRef.current.height = window.innerHeight;
                renderFrame(currentFrameRef.current);
            }
        };
        window.addEventListener("resize", handleResize);
        handleResize();
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // Use a stable element that doesn't re-render aggressively
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
